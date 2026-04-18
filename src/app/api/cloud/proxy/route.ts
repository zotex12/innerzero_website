import { NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesktopUser } from "@/lib/auth-desktop";
import { deductUsage } from "@/lib/cloud-plans";
import {
  routeToProvider,
  estimateCostPence,
  ProviderUnavailableError,
} from "@/lib/cloud-providers";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { checkAndSendUsageAlert } from "@/lib/usage-alerts";

// Known limitation: the idempotency check for request_id runs BEFORE the
// provider call, so two concurrent retries of the same request_id can each
// reach the provider (both get billed by the upstream AI vendor). The
// deduct step is race-safe (unique index on request_id + atomic RPC), so
// only one deduction lands — the second concurrent call will see 23505 on
// the transaction insert or insufficient_usage at deduct time. Closing this
// duplicate-provider-call window requires caching the provider response in
// usage_transactions, which is a schema change deferred to a future batch.

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_SYSTEM_PROMPT_CHARS = 2000;
const MAX_MESSAGE_EXCHANGES = 10; // 5 exchanges = 10 messages (user + assistant)
const MAX_MESSAGE_CONTENT_CHARS = 50_000;
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

// Cascade kill-switch. Defaults on; set Vercel env
// CLOUD_PROXY_CASCADE_ENABLED=false to disable fallback across all cloud
// proxy requests without a redeploy cycle (operational rollback for cost
// testing or incident response). When off, the first provider error
// propagates directly to the user via the existing 502 path.
const CASCADE_ENABLED = process.env.CLOUD_PROXY_CASCADE_ENABLED !== "false";

interface ProxyMessage {
  role: "user" | "assistant";
  content: string;
}

interface ProxyBody {
  messages: ProxyMessage[];
  model_tier?: string;
  system_prompt?: string;
  request_id?: string;
}

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "cloudProxy", getRateLimitKey(request));
  if (rateLimited) return rateLimited;

  const auth = await getDesktopUser(request);
  if ("error" in auth) return auth.error;

  let body: ProxyBody;
  try {
    body = (await request.json()) as ProxyBody;
  } catch {
    console.debug("[proxy 400] invalid_json_body");
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Validate request_id if provided
  const requestId = body.request_id;
  if (requestId !== undefined) {
    if (typeof requestId !== "string" || !REQUEST_ID_PATTERN.test(requestId)) {
      console.debug(
        "[proxy 400] invalid_request_id, type=", typeof requestId,
        "len=", typeof requestId === "string" ? requestId.length : -1,
      );
      return NextResponse.json(
        { error: "request_id must be 1-64 alphanumeric/hyphen characters." },
        { status: 400 }
      );
    }
  }

  // Validate messages
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    console.debug(
      "[proxy 400] messages_invalid, is_array=", Array.isArray(body.messages),
      "length=", Array.isArray(body.messages) ? body.messages.length : -1,
    );
    return NextResponse.json(
      { error: "messages array is required and must not be empty." },
      { status: 400 }
    );
  }

  // Enforce limits
  const messages = body.messages.slice(-MAX_MESSAGE_EXCHANGES);

  // Reject oversized system_prompt explicitly — never silently truncate.
  if (
    body.system_prompt !== undefined &&
    typeof body.system_prompt === "string" &&
    body.system_prompt.length > MAX_SYSTEM_PROMPT_CHARS
  ) {
    console.debug(
      "[proxy 400] system_prompt_too_long, len=", body.system_prompt.length,
      "max=", MAX_SYSTEM_PROMPT_CHARS,
    );
    return NextResponse.json(
      {
        error: "system_prompt_too_long",
        detail: "system_prompt must be 2000 characters or less.",
      },
      { status: 400 }
    );
  }
  const systemPrompt =
    typeof body.system_prompt === "string" ? body.system_prompt : undefined;
  const requestedTier = body.model_tier || "auto";

  // Validate message format
  let maxLenSeen = 0;
  for (const msg of messages) {
    if (
      !msg.role ||
      !msg.content ||
      (msg.role !== "user" && msg.role !== "assistant") ||
      typeof msg.content !== "string"
    ) {
      console.debug(
        "[proxy 400] message_shape_invalid, role=", msg?.role,
        "content_type=", typeof msg?.content,
        "messages_count=", messages.length,
      );
      return NextResponse.json(
        { error: "Each message must have role (user|assistant) and content (string)." },
        { status: 400 }
      );
    }
    if (msg.content.length > maxLenSeen) maxLenSeen = msg.content.length;
    if (msg.content.length > MAX_MESSAGE_CONTENT_CHARS) {
      console.debug(
        "[proxy 400] message_too_long, max_len_seen=", maxLenSeen,
        "cap=", MAX_MESSAGE_CONTENT_CHARS,
        "messages_count=", messages.length,
      );
      return NextResponse.json(
        {
          error: "message_too_long",
          detail: "Each message must be 50000 characters or less.",
        },
        { status: 400 }
      );
    }
  }

  const admin = createAdminClient();
  const userId = auth.user.id;
  const startTime = Date.now();

  // Get profile with plan info
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, usage_balance, usage_monthly_allowance, usage_alerts_sent")
    .eq("id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const subscriptionBalance = profile.usage_balance ?? 0;
  const monthlyAllowance = profile.usage_monthly_allowance ?? 0;
  const alertsSent = (profile.usage_alerts_sent as string[] | null) ?? [];

  // Check user has active plan or PAYG packs
  let hasPlan = profile.plan && profile.plan !== "free";
  let hasPayg = false;

  if (!hasPlan) {
    const { count } = await admin
      .from("usage_packs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("usage_remaining", 0)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());
    hasPayg = (count ?? 0) > 0;
  }

  // Cancelled users retain their usage_balance per the cancel contract — a
  // plan=free + usage_balance>0 state is a valid paying customer whose
  // credits must remain spendable. Desktop already treats this as eligible
  // via has_spendable_cloud_credits (InnerZero c03e0a8); mirror here.
  const hasRetainedBalance = (profile.usage_balance ?? 0) > 0;

  if (!hasPlan && !hasPayg && !hasRetainedBalance) {
    return NextResponse.json(
      { error: "no_managed_credits", message: "No active plan, PAYG packs, or retained credits." },
      { status: 403 }
    );
  }

  // Get tier config.
  // Use id, not name — the DB has id='auto', name='Auto'. Phase 90 Batch 7 fix.
  const { data: tier } = await admin
    .from("model_tiers")
    .select("id, usage_multiplier, models")
    .eq("id", requestedTier)
    .eq("active", true)
    .single();

  if (!tier) {
    console.debug("[proxy 400] model_tier_invalid, tier=", requestedTier);
    return NextResponse.json(
      { error: `Unknown or inactive model tier: ${requestedTier}` },
      { status: 400 }
    );
  }

  // Check tier access if user has a subscription plan
  if (hasPlan) {
    const { data: cloudPlan } = await admin
      .from("cloud_plans")
      .select("tier_access")
      .eq("id", profile.plan!)
      .single();

    const tierAccess = cloudPlan?.tier_access ?? [];
    if (!tierAccess.includes(requestedTier)) {
      return NextResponse.json(
        { error: `Your plan does not include access to the '${requestedTier}' tier.` },
        { status: 403 }
      );
    }
  }

  const cost = tier.usage_multiplier;

  // Spending cap enforcement is now folded into atomic_deduct_sub_with_cap
  // (Phase 90 Batch 6) — the pre-check here was removed to close the TOCTOU
  // race. The RPC runs the balance and cap check in the same statement
  // under the profile row's lock.

  // Check sufficient usage (subscription or PAYG)
  let deductSource: "subscription" | "payg" = "subscription";

  if (subscriptionBalance < cost) {
    // Verify at least one PAYG pack has enough balance before calling the provider.
    // The actual deduction happens after the provider response below.
    // Schema has purchased_at, not created_at — regression guard.
    const { data: paygPacks, error: packsError } = await admin
      .from("usage_packs")
      .select("id, usage_remaining")
      .eq("user_id", userId)
      .gt("usage_remaining", 0)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("purchased_at", { ascending: true });
    if (packsError) {
      console.error("[cloud/proxy] usage_packs pre-check query failed", {
        user_id: userId,
        code: packsError.code,
        message: packsError.message,
        request_id: requestId ?? null,
      });
      // If the user has NO retained sub balance to pivot to either, we
      // can't distinguish "legitimately out of credits" from "DB query
      // failed" — returning 402 would mislead them into a false top-up.
      // Return 500 with a correlation id so they retry. If sub balance
      // could serve, fall through to let the deduction path below try.
      if (subscriptionBalance <= 0) {
        return NextResponse.json(
          {
            error: "pack_query_failed",
            message: "Temporary error checking credits. Please retry.",
            request_id: requestId ?? null,
          },
          { status: 500 }
        );
      }
    }

    const hasEligiblePack = (paygPacks ?? []).some((p) => p.usage_remaining >= cost);
    if (!hasEligiblePack) {
      console.debug(
        "[proxy 402] insufficient_usage (pre-deduct), sub_balance=", subscriptionBalance,
        "cost=", cost,
        "payg_pack_count=", (paygPacks ?? []).length,
        "has_plan=", hasPlan,
      );
      // 402 sub-codes: "insufficient_usage" and "spending_cap_exceeded".
      // Keep both aligned — desktop branches on the body `error` field.
      return NextResponse.json(
        {
          error: "insufficient_usage",
          usage_balance: subscriptionBalance,
        },
        { status: 402 }
      );
    }
    deductSource = "payg";
  }

  // Select models from tier config.
  // model_tiers.models is a JSONB array of {model_id, provider, priority?,
  // display_name?} objects. Sorted by priority ascending with fallback to
  // source order.
  type TierModelEntry = {
    model_id: string;
    provider: string;
    priority?: number;
    display_name?: string;
  };
  const models = tier.models as TierModelEntry[] | null;
  if (!Array.isArray(models)) {
    console.error(
      "[cloud/proxy] tier.models is not an array, typeof=", typeof models,
      "tier=", requestedTier,
    );
    return NextResponse.json(
      { error: "Invalid tier configuration." },
      { status: 500 }
    );
  }
  if (models.length === 0) {
    return NextResponse.json(
      { error: "No models configured for this tier." },
      { status: 500 }
    );
  }

  const MAX_ATTEMPTS = 2;
  const validated = models
    .map((entry, idx) => ({ entry, idx }))
    .filter(({ entry }) => {
      if (
        !entry ||
        typeof entry.model_id !== "string" ||
        entry.model_id.length === 0 ||
        typeof entry.provider !== "string" ||
        entry.provider.length === 0
      ) {
        console.warn(
          "[cloud/proxy] malformed tier model entry, skipping; missing model_id or provider"
        );
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const pa = typeof a.entry.priority === "number" ? a.entry.priority : Number.MAX_SAFE_INTEGER;
      const pb = typeof b.entry.priority === "number" ? b.entry.priority : Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return a.idx - b.idx;
    });

  const candidates = validated
    .slice(0, MAX_ATTEMPTS)
    .map(({ entry }) => ({ provider: entry.provider, modelId: entry.model_id }));

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Invalid model configuration." },
      { status: 500 }
    );
  }

  // Use shorter timeout when fallback is available. 10s per provider is
  // generally sufficient for first-token latency on healthy providers and
  // bounds the ghost-generation window (the cancelled provider\u2019s
  // upstream compute keeps running server-side even after the proxy
  // aborts). 30s retained for single-candidate tiers since there is no
  // fallback to cascade to.
  const timeoutMs = candidates.length > 1 ? 10_000 : 30_000;

  // Provider fallback loop
  let lastError: unknown = null;
  // Tracks every provider/model we actually attempted so the "all failed"
  // log below reports the real offenders (not just the last tier entry).
  const attempted: { provider: string; modelId: string }[] = [];

  for (const candidate of candidates) {
    const { provider, modelId } = candidate;
    attempted.push({ provider, modelId });

    try {
      const result = await routeToProvider(
        provider, modelId, messages, systemPrompt, timeoutMs
      );

      const responseTimeMs = Date.now() - startTime;

      // Privacy-preserving log (no content, no IPs)
      console.log(
        JSON.stringify({
          event: "cloud_proxy",
          ts: new Date().toISOString(),
          user_id: userId,
          model_tier: requestedTier,
          provider,
          model_id: modelId,
          response_time_ms: responseTimeMs,
          success: true,
          attempt: candidates.indexOf(candidate) + 1,
        })
      );

      // Idempotency: skip deduction if this request_id was already processed
      let alreadyDeducted = false;
      if (requestId) {
        const { data: existing } = await admin
          .from("usage_transactions")
          .select("id")
          .eq("request_id", requestId)
          .single();
        if (existing) alreadyDeducted = true;
      }

      // Cap-currency cost in integer pence — token-based provider estimate
      // rounded up conservatively (under-charge is worse than over-charge).
      const inputTokens = result.input_tokens ?? 0;
      const outputTokens = result.output_tokens ?? 0;
      const estimatedCostPence = estimateCostPence(modelId, inputTokens, outputTokens);
      const costPence = Math.max(0, Math.ceil(estimatedCostPence));

      // Deduct usage after successful response.
      // Transaction log semantics: model_tier is the tier the USER REQUESTED
      // (stable across provider fallback — a tier is a conceptual grouping
      // with its own fallback list). provider and model_id reflect the ACTUAL
      // executed provider chosen by the fallback loop. When reconciling
      // analytics, join transactions to model_tiers on model_tier and
      // remember that a single tier can map to rows with different providers.
      // Tracks whether we landed a deduction on either path. Used below to
      // hard-fail with 500 rather than silently return a free provider
      // response when nothing could be deducted post-hoc (audit finding B2).
      let anyDeduction = false;

      if (!alreadyDeducted) {
        if (deductSource === "subscription") {
          const newBalance = await deductUsage(
            userId, cost, requestedTier, provider, modelId, requestId, costPence
          );
          if (newBalance === "spending_cap_exceeded") {
            console.debug(
              "[proxy 402] spending_cap_exceeded, cost_pence=", costPence,
              "tier=", requestedTier,
              "provider=", provider,
            );
            return NextResponse.json(
              { error: "spending_cap_exceeded" },
              { status: 402 }
            );
          }
          if (newBalance === null) {
            // Subscription drained by a concurrent request between the pre-check and
            // the atomic deduct. Fall through to PAYG packs if any.
            deductSource = "payg";
          } else {
            anyDeduction = true;
          }
        }

        if (deductSource === "payg") {
          // Atomic PAYG deduction with fall-through to the next eligible pack.
          // Schema has purchased_at, not created_at — regression guard.
          const { data: eligiblePacks, error: eligiblePacksError } = await admin
            .from("usage_packs")
            .select("id, usage_remaining")
            .eq("user_id", userId)
            .gt("usage_remaining", 0)
            .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
            .order("purchased_at", { ascending: true });
          if (eligiblePacksError) {
            console.error("[cloud/proxy] usage_packs deduct query failed", {
              user_id: userId,
              code: eligiblePacksError.code,
              message: eligiblePacksError.message,
            });
          }

          let packDeducted = false;
          for (const pack of eligiblePacks ?? []) {
            if (pack.usage_remaining < cost) continue;
            const { data: remaining, error: rpcError } = await admin.rpc(
              "atomic_deduct_pack",
              { p_pack_id: pack.id, p_amount: cost }
            );
            if (rpcError) {
              console.error("[cloud/proxy] atomic_deduct_pack error:", rpcError.message);
              continue;
            }
            if (remaining !== null) {
              packDeducted = true;
              break;
            }
          }

          if (packDeducted) {
            await admin.from("usage_transactions").insert({
              user_id: userId,
              type: "usage",
              amount: -cost,
              balance_after: subscriptionBalance,
              description: `${provider}/${modelId} (PAYG pack)`,
              model_tier: requestedTier,
              provider,
              model_id: modelId,
              ...(requestId ? { request_id: requestId } : {}),
            });
            anyDeduction = true;
          } else {
            console.error(
              JSON.stringify({
                event: "cloud_proxy_deduct_miss",
                ts: new Date().toISOString(),
                user_id: userId,
                cost,
                reason: "no_pack_deducted_after_provider",
              })
            );
          }
        }

        // Silent-freebie guard: provider was called successfully but neither
        // sub nor pack deduction landed. Do NOT return the content to the
        // user — that would be free compute at InnerZero's expense. Log for
        // manual reconciliation and fail 500. No provider refund attempt
        // (out of scope; provider-specific). Retries with the same
        // request_id will hit the `alreadyDeducted` branch and skip this
        // check, which is correct (the original attempt will have landed
        // its deduction before ever reaching this path).
        if (!anyDeduction) {
          console.error(
            JSON.stringify({
              event: "cloud_proxy_deduction_failed_after_provider_call",
              ts: new Date().toISOString(),
              user_id: userId,
              request_id: requestId ?? null,
              provider,
              model_id: modelId,
              cost,
              reason: "no_eligible_pack_remaining",
            })
          );
          return NextResponse.json(
            {
              error: "deduction_failed",
              message: "Cloud response was generated but internal accounting failed. Please contact support if this persists.",
            },
            { status: 500 }
          );
        }
      }

      // Fire-and-forget cost log (internal analytics). `estimatedCostPence`
      // was already computed above for the cap-enforced deduction.

      // after() keeps the runtime alive until background work completes, so
      // serverless cold-stops don't drop audit inserts. The response still
      // returns synchronously below — user-visible latency is unchanged.
      after(async () => {
        try {
          const { error: costErr } = await admin
            .from("proxy_cost_log")
            .insert({
              user_id: userId,
              request_id: requestId ?? null,
              provider,
              model_id: modelId,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              estimated_cost_pence: estimatedCostPence,
              usage_deducted: alreadyDeducted ? 0 : cost,
            });
          if (costErr) console.error("[proxy_cost_log] insert failed:", costErr.message);
        } catch (err) {
          console.error(
            "[proxy_cost_log] insert threw:",
            err instanceof Error ? err.message : "unknown"
          );
        }
      });

      // Usage threshold alert (subscription users only) — also deferred.
      if (!alreadyDeducted && deductSource === "subscription" && monthlyAllowance > 0) {
        const newBalance = subscriptionBalance - cost;
        after(async () => {
          try {
            await checkAndSendUsageAlert(userId, newBalance, monthlyAllowance, alertsSent);
          } catch (err) {
            console.error(
              "[usage-alerts] check failed:",
              err instanceof Error ? err.message : "unknown"
            );
          }
        });
      }

      // Get updated balance for header
      const { data: updatedProfile } = await admin
        .from("profiles")
        .select("usage_balance")
        .eq("id", userId)
        .single();

      const remainingBalance = updatedProfile?.usage_balance ?? 0;

      return NextResponse.json(
        {
          content: result.content,
          provider: result.provider,
          model: result.model,
          input_tokens: result.input_tokens,
          output_tokens: result.output_tokens,
        },
        {
          headers: {
            "X-Usage-Remaining": String(remainingBalance),
            "X-Provider": provider,
          },
        }
      );
    } catch (err) {
      lastError = err;

      // Only retry on provider-side errors (timeout, 5xx, connection).
      // The CASCADE_ENABLED kill-switch short-circuits the fallback loop
      // without removing the code path — set env to "false" to disable
      // cross-provider cascade entirely; first-provider error then
      // falls through to the 502 response below.
      if (err instanceof ProviderUnavailableError) {
        console.log(
          JSON.stringify({
            event: "cloud_proxy_fallback",
            ts: new Date().toISOString(),
            user_id: userId,
            model_tier: requestedTier,
            provider,
            model_id: modelId,
            error: err.message.slice(0, 80),
            attempt: candidates.indexOf(candidate) + 1,
            cascade_enabled: CASCADE_ENABLED,
          })
        );
        if (!CASCADE_ENABLED) break;
        continue; // try next provider
      }

      // Non-provider errors (config, 4xx) — do not retry
      break;
    }
  }

  // All attempts failed
  const responseTimeMs = Date.now() - startTime;
  const lastAttempted = attempted[attempted.length - 1];
  const errorType =
    lastError instanceof Error ? lastError.message.slice(0, 200) : "unknown";

  console.log(
    JSON.stringify({
      event: "cloud_proxy",
      ts: new Date().toISOString(),
      user_id: userId,
      model_tier: requestedTier,
      provider: lastAttempted?.provider ?? null,
      model_id: lastAttempted?.modelId ?? null,
      attempted,
      response_time_ms: responseTimeMs,
      success: false,
      error_type: errorType,
    })
  );

  // Do NOT deduct usage on failure.
  // Non-production envs (dev + Vercel preview) include the truncated error
  // message so local/preview clients can diagnose without Vercel log access.
  // Production responses stay clean.
  const includeDebug =
    process.env.NODE_ENV !== "production" ||
    process.env.VERCEL_ENV === "preview";
  return NextResponse.json(
    {
      error: "provider_error",
      message: "Cloud AI temporarily unavailable.",
      ...(includeDebug ? { debug_error_type: errorType } : {}),
    },
    { status: 502 }
  );
}
