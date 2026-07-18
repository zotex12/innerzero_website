import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesktopUser } from "@/lib/auth-desktop";
import { checkRateLimit, checkRateLimitShared } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/security-headers";
import { endVoiceSession } from "@/lib/cloud-voice";

// C1 kill switch: see session/route.ts. Same default-OFF inertness.
const VOICE_ENABLED = process.env.CLOUD_VOICE_MANAGED_ENABLED === "true";

export const runtime = "nodejs";
export const maxDuration = 15;

const SESSION_ID_PATTERN = /^[0-9a-fA-F-]{36}$/;

interface EndBody {
  session_id?: string;
}

// Clean client end of a managed voice session. No billing here: charged
// minutes are already spent (per STARTED minute, decision 13); this
// frees the one-concurrent-session slot immediately instead of waiting
// for the stale window. Idempotent: ending an already-ended or unknown
// session succeeds quietly.
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

  let body: EndBody;
  try {
    body = (await request.json()) as EndBody;
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
  await endVoiceSession(admin, userId, sessionId, "client_end");

  console.log(
    JSON.stringify({
      event: "cloud_voice_session_end",
      ts: new Date().toISOString(),
      user_id: userId,
      session_id: sessionId,
    })
  );

  return applySecurityHeaders(NextResponse.json({ ok: true }));
}
