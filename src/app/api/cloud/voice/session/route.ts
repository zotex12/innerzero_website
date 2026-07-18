import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesktopUser } from "@/lib/auth-desktop";
import { checkRateLimit, checkRateLimitShared } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/security-headers";
import { reportProviderSuccess } from "@/lib/cloud-failover";
import {
  chargeVoiceMinute,
  insertVoiceCostRow,
  isVoiceConfigured,
  logVoiceEvent,
  startVoiceSession,
  voiceFailureResponse,
  VOICE_INCIDENT_PROVIDER,
  VOICE_MAX_SESSION_MINUTES,
  VOICE_MODEL_ID,
  VOICE_RENEW_INTERVAL_SECONDS,
  VOICE_UNITS_PER_MINUTE,
} from "@/lib/cloud-voice";

// C1 kill switch (phase server-managed-voice-proxy, 2026-07-18).
// Default OFF: the deploy is inert until the operator applies migration
// 011, sets OPENAI_API_KEY in Vercel, and flips this flag. With the
// flag off the route rejects before ANY auth, DB, or provider work.
const VOICE_ENABLED = process.env.CLOUD_VOICE_MANAGED_ENABLED === "true";

export const runtime = "nodejs";
export const maxDuration = 15;

// Start a managed voice session: registers the session (ONE active per
// user), mints the first short-TTL OpenAI Realtime client secret, and
// charges minute 1 (15 units, locked decision 13) through the existing
// atomic deduct paths. The secret is only returned after the deduction
// lands. No audio ever flows through this server; the desktop connects
// to OpenAI directly with the ephemeral secret.
export async function POST(request: Request) {
  if (!VOICE_ENABLED) {
    return NextResponse.json(
      { error: "voice_managed_disabled" },
      { status: 503 }
    );
  }

  const ipLimited = checkRateLimit(request, "cloudAbuse");
  if (ipLimited) return ipLimited;

  const auth = await getDesktopUser(request);
  if ("error" in auth) return auth.error;
  const userId = auth.user.id;

  const rateLimited = await checkRateLimitShared(
    request,
    "voiceSession",
    `user:${userId}`
  );
  if (rateLimited) return rateLimited;

  if (!isVoiceConfigured()) {
    console.error(
      "[cloud/voice] OPENAI_API_KEY not configured; managed voice unavailable"
    );
    return NextResponse.json({ error: "voice_unconfigured" }, { status: 503 });
  }

  const admin = createAdminClient();

  // Eligibility mirrors the text proxy: an active plan, an eligible PAYG
  // pack, or a retained post-cancel balance. The actual 15-unit check
  // happens atomically inside the deduction.
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, usage_balance")
    .eq("id", userId)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }
  const hasPlan = profile.plan && profile.plan !== "free";
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
  const hasRetainedBalance = (profile.usage_balance ?? 0) > 0;
  if (!hasPlan && !hasPayg && !hasRetainedBalance) {
    return NextResponse.json(
      {
        error: "no_managed_credits",
        message: "No active plan, PAYG packs, or retained credits.",
      },
      { status: 403 }
    );
  }

  const sessionId = randomUUID();
  const started = await startVoiceSession(admin, userId, sessionId);
  if ("rpcError" in started) {
    // Fail CLOSED: no registry row means no session and no charge (the
    // most likely cause is migration 011 not yet applied).
    console.error("[cloud/voice] start rpc failed:", started.rpcError);
    return NextResponse.json(
      { error: "voice_session_failed" },
      { status: 500 }
    );
  }
  if (started.verdict === "no_profile") {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }
  if (started.verdict === "concurrent_session") {
    return NextResponse.json(
      { error: "concurrent_voice_session" },
      { status: 409 }
    );
  }
  if (started.verdict === "session_quota") {
    // Lease quota (Codex C1 review fold): ending a session cannot kill
    // an established provider connection, so starts inside the rolling
    // window are capped to bound fan-out. Honest flows keep one session
    // open and renew instead of cycling start/end.
    return NextResponse.json(
      { error: "voice_session_quota" },
      { status: 429, headers: { "Retry-After": "300" } }
    );
  }

  // isStart: a minute-1 failure closes the row as 'aborted' (no secret
  // was ever released) so it does not consume the lease quota.
  const outcome = await chargeVoiceMinute(admin, userId, sessionId, true);
  if (!outcome.ok) {
    return applySecurityHeaders(await voiceFailureResponse(admin, outcome));
  }

  // Privacy-preserving log + per-minute cost row (no secret value, no
  // content). after() keeps the runtime alive past the response; the
  // success report keeps the openai_voice incident circuit closed.
  logVoiceEvent("cloud_voice_session_start", userId, sessionId, outcome);
  after(async () => {
    await insertVoiceCostRow(admin, userId, sessionId, outcome.minutesCharged);
    await reportProviderSuccess(admin, VOICE_INCIDENT_PROVIDER);
  });

  return applySecurityHeaders(
    NextResponse.json({
      session_id: sessionId,
      client_secret: outcome.clientSecret,
      client_secret_expires_at: outcome.clientSecretExpiresAt,
      model: VOICE_MODEL_ID,
      minutes_charged: outcome.minutesCharged,
      units_per_minute: VOICE_UNITS_PER_MINUTE,
      renew_interval_seconds: VOICE_RENEW_INTERVAL_SECONDS,
      max_session_minutes: VOICE_MAX_SESSION_MINUTES,
    })
  );
}
