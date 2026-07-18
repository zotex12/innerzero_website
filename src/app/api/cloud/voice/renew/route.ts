import { NextResponse, after } from "next/server";
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
  voiceFailureResponse,
  VOICE_INCIDENT_PROVIDER,
  VOICE_MAX_SESSION_MINUTES,
  VOICE_RENEW_INTERVAL_SECONDS,
} from "@/lib/cloud-voice";

// C1 kill switch: see session/route.ts. Same default-OFF inertness.
const VOICE_ENABLED = process.env.CLOUD_VOICE_MANAGED_ENABLED === "true";

export const runtime = "nodejs";
export const maxDuration = 15;

// Server-generated session ids are UUIDs; reject anything else before
// touching the registry.
const SESSION_ID_PATTERN = /^[0-9a-fA-F-]{36}$/;

interface RenewBody {
  session_id?: string;
}

// Renew a managed voice session for one more started minute: advances
// the registry counter (30-minute max), mints a fresh short-TTL client
// secret, and charges 15 units through the existing atomic deduct
// paths. A renewal that cannot pay dies at the minute boundary and the
// session ends; the fresh secret is only returned after the deduction
// lands (a live OpenAI connection continues on the old secret, so the
// renewal is the billing heartbeat and the reconnect credential).
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

  let body: RenewBody;
  try {
    body = (await request.json()) as RenewBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const sessionId = body.session_id;
  if (typeof sessionId !== "string" || !SESSION_ID_PATTERN.test(sessionId)) {
    return NextResponse.json(
      { error: "session_id must be a valid session identifier." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const outcome = await chargeVoiceMinute(admin, userId, sessionId);
  if (!outcome.ok) {
    return applySecurityHeaders(await voiceFailureResponse(admin, outcome));
  }

  logVoiceEvent("cloud_voice_session_renew", userId, sessionId, outcome);
  after(async () => {
    await insertVoiceCostRow(admin, userId, sessionId, outcome.minutesCharged);
    await reportProviderSuccess(admin, VOICE_INCIDENT_PROVIDER);
  });

  return applySecurityHeaders(
    NextResponse.json({
      session_id: sessionId,
      client_secret: outcome.clientSecret,
      client_secret_expires_at: outcome.clientSecretExpiresAt,
      minutes_charged: outcome.minutesCharged,
      renew_interval_seconds: VOICE_RENEW_INTERVAL_SECONDS,
      max_session_minutes: VOICE_MAX_SESSION_MINUTES,
    })
  );
}
