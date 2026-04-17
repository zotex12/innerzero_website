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
import { checkSpendingCap } from "@/lib/spending-cap";

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
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Validate request_id if provided
  const requestId = body.request_id;
  if (requestId !== undefined) {
    if (typeof requestId !== "string" || !REQUEST_ID_PATTERN.test(requestId)) {
      return NextResponse.json(
        { error: "request_id must be 1-64 alphanumeric/hyphen characters." },
        { status: 400 }
      );
    }
  }

  // Validate messages
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
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
  for (const msg of messages) {
    if (
      !msg.role ||
      !msg.content ||
      (msg.role !== "user" && msg.role !== "assistant") ||
      typeof msg.content !== "string"
    ) {
      return NextResponse.json(
        { error: "Each message must have role (user|assistant) and content (string)." },
        { status: 400 }
      );
    }
    if (msg.content.length > MAX_MESSAGE_CONTENT_CHARS) {
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
    .select("plan, usage_balance, usage_monthly_allowance, usage_alerts_sent, spending_cap_pence, billing_cycle_end")
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

  if (!hasPlan && !hasPayg) {
    return NextResponse.json(
      { error: "No active plan or credit packs. Subscribe or purchase credits." },
      { status: 403 }
    );
  }

  // Get tier config
  const { data: tier } = await admin
    .from("model_tiers")
    .select("name, usage_multiplier, models")
    .eq("name", requestedTier)
    .eq("active", true)
    .single();

  if (!tier) {
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

  // Spending cap check (subscription users only, cap > 0)
  if (hasPlan && (profile.spending_cap_pence ?? 0) > 0) {
    const capError = await checkSpendingCap(
      admin, userId, profile.spending_cap_pence!, profile.billing_cycle_end ?? null, cost
    );
    if (capError) {
      return NextResponse.json(
        { error: "spending_cap_exceeded", message: capError },
        { status: 402 }
      );
    }
  }

  // Check sufficient usage (subscription or PAYG)
  let deductSource: "subscription" | "payg" = "subscription";

  if (subscriptionBalance < cost) {
    // Verify at least one PAYG pack has enough balance before calling the provider.
    // The actual deduction happens after the provider response below.
    const { data: paygPacks } = await admin
      .from("usage_packs")
      .select("id, usage_remaining")
      .eq("user_id", userId)
      .gt("usage_remaining", 0)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("created_at", { ascending: true });

    const hasEligiblePack = (paygPacks ?? []).some((p) => p.usage_remaining >= cost);
    if (!hasEligiblePack) {
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

  // Select models from tier config
  const models = tier.models as string[] | null;
  if (!models || models.length === 0) {
    return NextResponse.json(
      { error: "No models configured for this tier." },
      { status: 500 }
    );
  }

  // Parse model entries: ["provider/model_id", ...]. Require exactly one
  // forward slash — skip malformed entries so future model ids containing
  // a slash cannot be silently mis-routed. Do not log user id or request
  // content; only the offending entry string.
  const MAX_ATTEMPTS = 2;
  const candidates = models.slice(0, MAX_ATTEMPTS).map((entry) => {
    const parts = entry.split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      console.warn(`[cloud/proxy] malformed model entry, skipping: ${entry}`);
      return null;
    }
    return { provider: parts[0], modelId: parts[1] };
  }).filter((c): c is { provider: string; modelId: string } => c !== null);

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Invalid model configuration." },
      { status: 500 }
    );
  }

  // Use shorter timeout when fallback is available
  const timeoutMs = candidates.length > 1 ? 15_000 : 30_000;

  // Provider fallback loop
  let lastError: unknown = null;

  for (const candidate of candidates) {
    const { provider, modelId } = candidate;

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

      // Deduct usage after successful response.
      // Transaction log semantics: model_tier is the tier the USER REQUESTED
      // (stable across provider fallback — a tier is a conceptual grouping
      // with its own fallback list). provider and model_id reflect the ACTUAL
      // executed provider chosen by the fallback loop. When reconciling
      // analytics, join transactions to model_tiers on model_tier and
      // remember that a single tier can map to rows with different providers.
      if (!alreadyDeducted) {
        if (deductSource === "subscription") {
          const newBalance = await deductUsage(userId, cost, requestedTier, provider, modelId, requestId);
          if (newBalance === null) {
            // Subscription drained by a concurrent request between the pre-check and
            // the atomic deduct. Fall through to PAYG packs if any.
            deductSource = "payg";
          }
        }

        if (deductSource === "payg") {
          // Atomic PAYG deduction with fall-through to the next eligible pack.
          const { data: eligiblePacks } = await admin
            .from("usage_packs")
            .select("id, usage_remaining")
            .eq("user_id", userId)
            .gt("usage_remaining", 0)
            .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
            .order("created_at", { ascending: true });

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
      }

      // Fire-and-forget cost log (internal analytics)
      const inputTokens = result.input_tokens ?? 0;
      const outputTokens = result.output_tokens ?? 0;
      const estimatedCost = estimateCostPence(modelId, inputTokens, outputTokens);

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
              estimated_cost_pence: estimatedCost,
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

      // Only retry on provider-side errors (timeout, 5xx, connection)
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
          })
        );
        continue; // try next provider
      }

      // Non-provider errors (config, 4xx) — do not retry
      break;
    }
  }

  // All attempts failed
  const responseTimeMs = Date.now() - startTime;
  const lastCandidate = candidates[candidates.length - 1];

  console.log(
    JSON.stringify({
      event: "cloud_proxy",
      ts: new Date().toISOString(),
      user_id: userId,
      model_tier: requestedTier,
      provider: lastCandidate.provider,
      model_id: lastCandidate.modelId,
      response_time_ms: responseTimeMs,
      success: false,
      error_type: lastError instanceof Error ? lastError.message.slice(0, 80) : "unknown",
    })
  );

  // Do NOT deduct usage on failure
  return NextResponse.json(
    { error: "provider_error", message: "Cloud AI temporarily unavailable." },
    { status: 502 }
  );
}
