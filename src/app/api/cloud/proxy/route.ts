import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesktopUser } from "@/lib/auth-desktop";
import { deductUsage } from "@/lib/cloud-plans";
import {
  routeToProvider,
  estimateCostPence,
  ProviderUnavailableError,
} from "@/lib/cloud-providers";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkAndSendUsageAlert } from "@/lib/usage-alerts";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_SYSTEM_PROMPT_CHARS = 2000;
const MAX_MESSAGE_EXCHANGES = 10; // 5 exchanges = 10 messages (user + assistant)
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

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
  const rateLimited = checkRateLimit(request, "cloudProxy");
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
  const systemPrompt = body.system_prompt
    ? body.system_prompt.slice(0, MAX_SYSTEM_PROMPT_CHARS)
    : undefined;
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

  // Check sufficient usage (subscription or PAYG)
  let deductSource: "subscription" | "payg" = "subscription";
  let paygPackId: string | null = null;

  if (subscriptionBalance >= cost) {
    deductSource = "subscription";
  } else {
    // Try PAYG packs
    const { data: paygPacks } = await admin
      .from("usage_packs")
      .select("id, usage_remaining")
      .eq("user_id", userId)
      .gt("usage_remaining", 0)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(1);

    const pack = paygPacks?.[0];
    if (pack && pack.usage_remaining >= cost) {
      deductSource = "payg";
      paygPackId = pack.id;
    } else {
      return NextResponse.json({
        error: "insufficient_usage",
        usage_balance: subscriptionBalance,
      });
    }
  }

  // Select models from tier config
  const models = tier.models as string[] | null;
  if (!models || models.length === 0) {
    return NextResponse.json(
      { error: "No models configured for this tier." },
      { status: 500 }
    );
  }

  // Parse model entries: ["provider/model_id", ...]
  const MAX_ATTEMPTS = 2;
  const candidates = models.slice(0, MAX_ATTEMPTS).map((entry) => {
    const idx = entry.indexOf("/");
    if (idx === -1) return null;
    return { provider: entry.slice(0, idx), modelId: entry.slice(idx + 1) };
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

      // Deduct usage after successful response
      if (!alreadyDeducted) {
        if (deductSource === "subscription") {
          await deductUsage(userId, cost, requestedTier, provider, modelId, requestId);
        } else if (paygPackId) {
          // Deduct from PAYG pack
          const { data: pack } = await admin
            .from("usage_packs")
            .select("usage_remaining")
            .eq("id", paygPackId)
            .single();

          if (pack) {
            await admin
              .from("usage_packs")
              .update({ usage_remaining: pack.usage_remaining - cost })
              .eq("id", paygPackId);
          }

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
        }
      }

      // Fire-and-forget cost log (internal analytics)
      const inputTokens = result.input_tokens ?? 0;
      const outputTokens = result.output_tokens ?? 0;
      const estimatedCost = estimateCostPence(modelId, inputTokens, outputTokens);

      admin
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
        })
        .then(({ error: costErr }) => {
          if (costErr) console.error("[proxy_cost_log] insert failed:", costErr.message);
        });

      // Fire-and-forget usage threshold alert (subscription users only)
      if (!alreadyDeducted && deductSource === "subscription" && monthlyAllowance > 0) {
        const newBalance = subscriptionBalance - cost;
        checkAndSendUsageAlert(userId, newBalance, monthlyAllowance, alertsSent)
          .catch((err) => console.error("[usage-alerts] check failed:", err instanceof Error ? err.message : "unknown"));
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
