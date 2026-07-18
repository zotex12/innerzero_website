/**
 * C1 server-managed-voice-proxy (2026-07-18, locked decision 13).
 *
 * Managed voice for pure subscribers: this module mints short-TTL OpenAI
 * Realtime client secrets (gpt-realtime-2.1-mini) and charges 15 usage
 * units per STARTED minute through the EXISTING atomic deduct paths.
 * Mint-and-renew ONLY: no audio, no transcript, and no message content
 * ever flows through or is stored on this server; the desktop connects
 * to OpenAI directly with the ephemeral secret.
 *
 * Money invariant: a client secret is NEVER RETURNED to the client
 * unless that minute's 15-unit deduction has landed. Mint runs BEFORE
 * the deduction because an unreturned secret is inert (it cannot open a
 * session and costs nothing), while a landed PAYG deduction has no
 * refund primitive; withholding the secret on any post-mint failure
 * preserves "no free audio" without compensation logic.
 *
 * Everything here is reached only behind CLOUD_VOICE_MANAGED_ENABLED
 * (default OFF) in the routes, so the deploy is inert until the
 * operator applies migration 011, sets OPENAI_API_KEY (the platform
 * key; never a user's BYO key), and flips the flag.
 */

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deductUsage } from "@/lib/cloud-plans";
import { reportProviderFailure } from "@/lib/cloud-failover";

// ── Decision-13 pricing constants (re-verified live 2026-07-18) ───────
// gpt-realtime-2.1-mini: audio $10/1M in ($0.30 cached), $20/1M out.
// Worst case ~4p per minute (assistant-heavy speech + context re-feed
// with automatic input caching), below the 5.3p/min trigger that would
// raise the unit rate, so the locked 15 units per started minute stands.

export const VOICE_MODEL_ID = "gpt-realtime-2.1-mini";
export const VOICE_UNITS_PER_MINUTE = 15;
export const VOICE_EST_COST_PENCE_PER_MINUTE = 4;
export const VOICE_MAX_SESSION_MINUTES = 30;
export const VOICE_RENEW_INTERVAL_SECONDS = 60;
// Client secret TTL: one 60s renewal cadence plus skew/latency headroom.
// Documented API range is 10..7200 seconds.
export const VOICE_TOKEN_TTL_SECONDS = 90;
// An active session whose renewals stopped for two cadences plus skew is
// stale: it no longer blocks a new session and flips to 'expired' (the
// abuse signal for clients that stop renewing).
export const VOICE_STALE_SECONDS = 150;
// Anchored renewal cadence (Codex C1 review round-2 fold): charged
// minute N+1 becomes due at started_at + N*60s minus this fixed grace.
// Anchoring to started_at means early renewals cannot compound; the
// worst-case overcharge per session is this one-time grace.
export const VOICE_RENEW_EARLY_GRACE_SECONDS = 5;
// Session-start lease quota (Codex C1 review P1 fold): ending a session
// releases the registry slot but cannot terminate an already-established
// provider connection, so starts inside a rolling window are capped to
// bound client-controlled fan-out. The window covers the provider's
// maximum realtime session lifetime (60 minutes, verified 2026-07-18;
// no server-side kill exists) PLUS the maximum delayed connection
// start (a minted secret stays usable for up to TTL + skew = 210s
// before the provider session even begins; Codex round-3 fold) plus
// margin: 3600 + 300 = 3900s. At most VOICE_MAX_SESSIONS_PER_WINDOW
// provider sessions can therefore be alive concurrently: anything whose
// registry row left the window is provider-dead by definition even if
// its connection started as late as the secret allowed. Sessions that
// never released a secret (aborted at minute 1) do not consume quota.
export const VOICE_LEASE_WINDOW_SECONDS = 3900;
export const VOICE_MAX_SESSIONS_PER_WINDOW = 3;

// Incident-alert provider key for the B0 alert state machine
// (cloud_provider_failure/success upsert unknown providers). Voice has
// NO fallback provider (decision 11 scope limit): failures alert the
// operator and the desktop falls to local voice.
export const VOICE_INCIDENT_PROVIDER = "openai_voice";

// Vercel env alias (2026-07-18 activation): the production key was
// created under the name `openai_voice` and Vercel forbids renaming a
// Sensitive variable without re-entering the value, so both names are
// accepted. OPENAI_API_KEY stays the documented canonical name;
// consolidate when the key is next rotated. Either way this is the
// PLATFORM key, never a user's BYO key.
function voiceApiKey(): string {
  return process.env.OPENAI_API_KEY || process.env.openai_voice || "";
}

export function isVoiceConfigured(): boolean {
  return voiceApiKey().length > 0;
}

// ── Ephemeral client secret minting ───────────────────────────────────

export type VoiceErrorClass = "transient" | "auth" | "request";

export class VoiceProviderError extends Error {
  readonly reasonCode: string;
  readonly errorClass: VoiceErrorClass;
  constructor(reasonCode: string, errorClass: VoiceErrorClass) {
    // Classified code only; never a provider body (it could be logged).
    super(`voice_mint_${reasonCode}`);
    this.name = "VoiceProviderError";
    this.reasonCode = reasonCode;
    this.errorClass = errorClass;
  }
}

// Pure, exported for tests: HTTP status -> error class. Mirrors the B0
// failure matrix: 401/403 are our key/config ('auth'); timeouts, 408,
// 429 and 5xx are provider-side ('transient'); any other 4xx is a
// malformed request ('request') and must never be retried elsewhere.
export function classifyMintStatus(status: number): VoiceErrorClass {
  if (status === 401 || status === 403) return "auth";
  if (status === 408 || status === 429 || status >= 500) return "transient";
  return "request";
}

// Pure, exported for tests: the client-secret request body. Session
// config pins the model and audio output and disables tools; input
// caching is automatic on the Realtime API (no flag). Kept minimal so
// upstream schema drift cannot 400 on an optional knob.
export function buildVoiceClientSecretRequest(): {
  expires_after: { anchor: "created_at"; seconds: number };
  session: {
    type: "realtime";
    model: string;
    output_modalities: string[];
    tools: never[];
  };
} {
  return {
    expires_after: {
      anchor: "created_at",
      seconds: VOICE_TOKEN_TTL_SECONDS,
    },
    session: {
      type: "realtime",
      model: VOICE_MODEL_ID,
      output_modalities: ["audio"],
      tools: [],
    },
  };
}

export interface VoiceClientSecret {
  value: string;
  expiresAt: number; // seconds since epoch
}

// Mint one ephemeral client secret. Throws VoiceProviderError with a
// classified reason; the secret VALUE is never logged anywhere.
export async function mintVoiceClientSecret(
  timeoutMs = 10_000
): Promise<VoiceClientSecret> {
  const apiKey = voiceApiKey();
  if (!apiKey) {
    throw new VoiceProviderError("not_configured", "auth");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(buildVoiceClientSecretRequest()),
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    throw new VoiceProviderError(
      timedOut ? "timeout" : "connection_error",
      "transient"
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new VoiceProviderError(
      `http_${res.status}`,
      classifyMintStatus(res.status)
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new VoiceProviderError("bad_json", "transient");
  }
  const secret = data as { value?: unknown; expires_at?: unknown };
  if (typeof secret.value !== "string" || secret.value.length === 0) {
    throw new VoiceProviderError("missing_value", "transient");
  }
  // expires_at must be a finite epoch timestamp with enough remaining
  // lifetime to survive the deduction and delivery (>= 30s, round-2
  // fold: a near-expired credential would be dead on arrival AFTER the
  // charge), and no further out than the requested TTL plus clock-skew
  // allowance (a longer-lived credential than intended). Rejected
  // BEFORE any deduction, classified transient, secret withheld.
  const nowEpoch = Math.floor(Date.now() / 1000);
  const expiresAt = secret.expires_at;
  if (
    typeof expiresAt !== "number" ||
    !Number.isFinite(expiresAt) ||
    expiresAt < nowEpoch + 30 ||
    expiresAt > nowEpoch + VOICE_TOKEN_TTL_SECONDS + 120
  ) {
    throw new VoiceProviderError("bad_expiry", "transient");
  }
  return { value: secret.value, expiresAt };
}

// ── Session registry RPC wrappers (migration 011) ─────────────────────
// Start/renew fail CLOSED on RPC error (no session, no charge, no
// secret); end fails soft (a stale active row self-expires server-side).

type RpcCapable = {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

export type VoiceStartVerdict =
  | "ok"
  | "concurrent_session"
  | "session_quota"
  | "no_profile";

export async function startVoiceSession(
  admin: SupabaseClient,
  userId: string,
  sessionId: string
): Promise<{ verdict: VoiceStartVerdict } | { rpcError: string }> {
  const { data, error } = await (admin as unknown as RpcCapable).rpc(
    "voice_session_start",
    {
      p_user_id: userId,
      p_session_id: sessionId,
      p_stale_seconds: VOICE_STALE_SECONDS,
      p_lease_window_seconds: VOICE_LEASE_WINDOW_SECONDS,
      p_max_sessions_per_window: VOICE_MAX_SESSIONS_PER_WINDOW,
    }
  );
  if (error) return { rpcError: error.message };
  if (
    data !== "ok" &&
    data !== "concurrent_session" &&
    data !== "session_quota" &&
    data !== "no_profile"
  ) {
    return { rpcError: "unexpected_rpc_result" };
  }
  return { verdict: data };
}

export type VoiceRenewVerdict =
  | "ok"
  | "too_early"
  | "not_found"
  | "session_ended"
  | "max_minutes";

export async function renewVoiceSessionMinute(
  admin: SupabaseClient,
  userId: string,
  sessionId: string
): Promise<
  | { verdict: VoiceRenewVerdict; minutesCharged: number; retryAfterSeconds: number }
  | { rpcError: string }
> {
  const { data, error } = await (admin as unknown as RpcCapable).rpc(
    "voice_session_renew",
    {
      p_user_id: userId,
      p_session_id: sessionId,
      p_stale_seconds: VOICE_STALE_SECONDS,
      p_max_minutes: VOICE_MAX_SESSION_MINUTES,
      p_early_grace_seconds: VOICE_RENEW_EARLY_GRACE_SECONDS,
    }
  );
  if (error) return { rpcError: error.message };
  const row = Array.isArray(data) ? data[0] : null;
  const verdict = (row as { verdict?: unknown } | null)?.verdict;
  const minutes = (row as { minutes_charged?: unknown } | null)?.minutes_charged;
  const retryAfter = (row as { retry_after_seconds?: unknown } | null)
    ?.retry_after_seconds;
  if (
    (verdict === "ok" ||
      verdict === "too_early" ||
      verdict === "not_found" ||
      verdict === "session_ended" ||
      verdict === "max_minutes") &&
    typeof minutes === "number"
  ) {
    return {
      verdict,
      minutesCharged: minutes,
      retryAfterSeconds: typeof retryAfter === "number" ? retryAfter : 0,
    };
  }
  return { rpcError: "unexpected_rpc_result" };
}

// Classified end reasons: the SQL side normalises anything outside this
// union to 'other', so user-derived text can never enter ended_reason
// (Codex C1 review P3 fold).
export type VoiceEndReason =
  | "client_end"
  | "credits_exhausted"
  | "spending_cap_exceeded"
  | "provider_error"
  | "deduct_failed"
  | "max_minutes"
  | "stale"
  | "aborted";

export async function endVoiceSession(
  admin: SupabaseClient,
  userId: string,
  sessionId: string,
  reason: VoiceEndReason
): Promise<void> {
  try {
    const { error } = await (admin as unknown as RpcCapable).rpc(
      "voice_session_end",
      {
        p_user_id: userId,
        p_session_id: sessionId,
        p_reason: reason.slice(0, 64),
      }
    );
    if (error) {
      console.error("[cloud-voice] end rpc failed:", error.message);
    }
  } catch (err) {
    console.error(
      "[cloud-voice] end rpc threw:",
      err instanceof Error ? err.message : "unknown"
    );
  }
}

// ── Per-minute deduction through the EXISTING billing paths ───────────

// Globally unique per charged minute; usage_transactions has a unique
// partial index on request_id, so a replayed insert costs only the
// secondary audit row (logged loudly), exactly like the text paths.
export function voiceMinuteRequestId(
  sessionId: string,
  minute: number
): string {
  return `voice_${sessionId}_m${minute}`;
}

export type VoiceDeductOutcome =
  | { ok: true; source: "subscription" | "payg" }
  | {
      ok: false;
      reason: "insufficient_usage" | "spending_cap_exceeded" | "deduct_error";
    };

// ── One charged minute, end to end (shared by /session and /renew) ────
// Sequence: registry renew (advance the minute under the profile lock)
// -> mint the fresh secret -> land the 15-unit deduction -> only then
// release the secret to the caller. Any failure after the registry step
// ends the session and withholds the secret, so no path can hand out
// audio access without a landed charge.

export type VoiceMinuteOutcome =
  | {
      ok: true;
      minutesCharged: number;
      clientSecret: string;
      clientSecretExpiresAt: number;
      deductSource: "subscription" | "payg";
    }
  | {
      ok: false;
      kind:
        | "not_found"
        | "session_ended"
        | "max_minutes"
        | "too_early"
        | "registry_error"
        | "provider_error"
        | "insufficient_usage"
        | "spending_cap_exceeded"
        | "deduct_error";
      minutesCharged: number;
      retryAfterSeconds?: number;
      // Set on provider_error so the route can drive the incident
      // machinery (classified code only, never a provider body).
      providerErrorClass?: VoiceErrorClass;
      providerReason?: string;
    };

// isStart: a failure while charging minute 1 means NO secret was ever
// released for this session, so the row is closed as 'aborted' and does
// not consume the lease quota (Codex C1 review P1 fold).
export async function chargeVoiceMinute(
  admin: SupabaseClient,
  userId: string,
  sessionId: string,
  isStart = false
): Promise<VoiceMinuteOutcome> {
  const renewed = await renewVoiceSessionMinute(admin, userId, sessionId);
  if ("rpcError" in renewed) {
    console.error("[cloud-voice] renew rpc failed:", renewed.rpcError);
    if (isStart) {
      await endVoiceSession(admin, userId, sessionId, "aborted");
    }
    return { ok: false, kind: "registry_error", minutesCharged: 0 };
  }
  if (renewed.verdict !== "ok") {
    return {
      ok: false,
      kind: renewed.verdict,
      minutesCharged: renewed.minutesCharged,
      retryAfterSeconds: renewed.retryAfterSeconds,
    };
  }
  const minute = renewed.minutesCharged;

  let secret: VoiceClientSecret;
  try {
    secret = await mintVoiceClientSecret();
  } catch (err) {
    const isVoiceErr = err instanceof VoiceProviderError;
    // No charge for this minute (the deduction has not run) and the
    // session ends: with the mint endpoint down the live session is
    // best treated as over, and NO second cloud provider ever hears
    // the audio (decision 11 scope limit). Desktop falls to local.
    await endVoiceSession(
      admin,
      userId,
      sessionId,
      isStart ? "aborted" : "provider_error"
    );
    return {
      ok: false,
      kind: "provider_error",
      minutesCharged: minute - 1,
      providerErrorClass: isVoiceErr ? err.errorClass : "transient",
      providerReason: isVoiceErr ? err.reasonCode : "unknown_error",
    };
  }

  const deducted = await deductVoiceMinute(admin, userId, sessionId, minute);
  if (!deducted.ok) {
    // Definite rejections (insufficient / cap) end the session: the
    // customer cannot pay for the next minute. An AMBIGUOUS deduct
    // error on a renewal does NOT end the session (Codex C1 round-2 P2
    // fold): the live provider connection continues on the old secret
    // either way, so keeping the row active means a landed-but-lost
    // charge bought a minute the customer actually keeps, and a
    // genuinely failed charge is at worst one unbilled minute; the next
    // anchored boundary bills normally. Both directions are bounded at
    // one minute and the ambiguous log above carries the evidence. At
    // START there is no established connection to preserve, so any
    // minute-1 failure aborts (secret never released, quota-exempt).
    const definite = deducted.reason !== "deduct_error";
    if (isStart) {
      await endVoiceSession(admin, userId, sessionId, "aborted");
    } else if (definite) {
      const endReason: VoiceEndReason =
        deducted.reason === "insufficient_usage"
          ? "credits_exhausted"
          : "spending_cap_exceeded";
      await endVoiceSession(admin, userId, sessionId, endReason);
    }
    return { ok: false, kind: deducted.reason, minutesCharged: minute - 1 };
  }

  return {
    ok: true,
    minutesCharged: minute,
    clientSecret: secret.value,
    clientSecretExpiresAt: secret.expiresAt,
    deductSource: deducted.source,
  };
}

// ── Route-shared HTTP helpers (used by /session and /renew) ───────────
// Next.js route files may only export handlers, so the shared failure
// mapping, event log, and cost-row insert live here.

// Failure mapping for a charged-minute attempt. Also drives the voice
// incident alerting (decision 11: server-side only, NO fallback
// provider, classified codes only; a request-class mint 4xx is our
// config bug, not an outage, and does not feed the circuit).
export async function voiceFailureResponse(
  admin: SupabaseClient,
  outcome: Extract<VoiceMinuteOutcome, { ok: false }>
): Promise<NextResponse> {
  switch (outcome.kind) {
    case "provider_error": {
      if (outcome.providerErrorClass !== "request") {
        await reportProviderFailure(
          admin,
          VOICE_INCIDENT_PROVIDER,
          `${outcome.providerErrorClass}:${outcome.providerReason}`
        );
      }
      return NextResponse.json(
        {
          error: "voice_unavailable",
          message: "Managed voice is temporarily unavailable.",
        },
        { status: 502 }
      );
    }
    case "insufficient_usage":
      return NextResponse.json(
        { error: "insufficient_usage" },
        { status: 402 }
      );
    case "spending_cap_exceeded":
      return NextResponse.json(
        { error: "spending_cap_exceeded" },
        { status: 402 }
      );
    case "not_found":
      return NextResponse.json({ error: "session_not_found" }, { status: 404 });
    case "session_ended":
      return NextResponse.json({ error: "session_ended" }, { status: 409 });
    case "too_early": {
      // Cadence guard: the session is fine, the renewal is just early
      // (or a duplicate of one that already charged this minute). The
      // client keeps its current secret and retries after the hint.
      const retryAfter = Math.max(1, outcome.retryAfterSeconds ?? 1);
      return NextResponse.json(
        {
          error: "renew_too_early",
          minutes_charged: outcome.minutesCharged,
          retry_after: retryAfter,
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
    case "max_minutes":
      return NextResponse.json(
        {
          error: "max_session_length",
          minutes_charged: outcome.minutesCharged,
        },
        { status: 409 }
      );
    default:
      // registry_error / deduct_error: fail closed, nothing was handed out.
      return NextResponse.json(
        { error: "voice_session_failed" },
        { status: 500 }
      );
  }
}

// Privacy-preserving structured log line: ids and counters only, never
// the secret value, never content.
export function logVoiceEvent(
  event: string,
  userId: string,
  sessionId: string,
  outcome: { minutesCharged: number; deductSource?: string }
): void {
  console.log(
    JSON.stringify({
      event,
      ts: new Date().toISOString(),
      user_id: userId,
      session_id: sessionId,
      model_id: VOICE_MODEL_ID,
      minutes_charged: outcome.minutesCharged,
      deduct_source: outcome.deductSource ?? null,
    })
  );
}

// One proxy_cost_log row per charged minute: decision-13 worst-case
// estimate (real usage reporting is a future phase); usage_deducted
// carries the 15 units so margin dashboards see both sides.
export async function insertVoiceCostRow(
  admin: SupabaseClient,
  userId: string,
  sessionId: string,
  minute: number
): Promise<void> {
  try {
    const { error } = await admin.from("proxy_cost_log").insert({
      user_id: userId,
      request_id: voiceMinuteRequestId(sessionId, minute),
      provider: "openai",
      model_id: VOICE_MODEL_ID,
      input_tokens: 0,
      output_tokens: 0,
      estimated_cost_pence: VOICE_EST_COST_PENCE_PER_MINUTE,
      usage_deducted: VOICE_UNITS_PER_MINUTE,
    });
    if (error) {
      console.error(
        "[cloud-voice] proxy_cost_log insert failed:",
        error.message
      );
    }
  } catch (err) {
    console.error(
      "[cloud-voice] proxy_cost_log insert threw:",
      err instanceof Error ? err.message : "unknown"
    );
  }
}

// Subscription first (atomic_deduct_sub_with_cap: balance + B1 user cap
// + plan provider-cost ceiling in one guarded statement, with the real
// estimated voice cost feeding spending_this_cycle_pence), then PAYG
// packs (atomic_deduct_pack), mirroring the text proxy's order.
export async function deductVoiceMinute(
  admin: SupabaseClient,
  userId: string,
  sessionId: string,
  minute: number
): Promise<VoiceDeductOutcome> {
  const requestId = voiceMinuteRequestId(sessionId, minute);
  let subResult: Awaited<ReturnType<typeof deductUsage>>;
  try {
    subResult = await deductUsage(
      userId,
      VOICE_UNITS_PER_MINUTE,
      "voice",
      "openai",
      VOICE_MODEL_ID,
      requestId,
      VOICE_EST_COST_PENCE_PER_MINUTE
    );
  } catch (err) {
    // Distinct, grep-able record (Codex C1 review P2, accepted class):
    // a thrown RPC error is normally a genuine failure (no charge), but
    // in the rare lost-response case the commit may have landed while
    // this path withholds the secret and ends the session. That is the
    // same accepted crash-window class as the text proxy's post-provider
    // accounting failures, bounded at one minute (15 units); this log
    // carries everything support needs to verify against
    // usage_transactions / proxy_cost_log and re-grant.
    console.error(
      JSON.stringify({
        event: "cloud_voice_deduct_ambiguous",
        ts: new Date().toISOString(),
        user_id: userId,
        session_id: sessionId,
        minute,
        request_id: requestId,
        error: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      })
    );
    return { ok: false, reason: "deduct_error" };
  }

  if (subResult === "spending_cap_exceeded") {
    return { ok: false, reason: "spending_cap_exceeded" };
  }
  if (typeof subResult === "number") {
    return { ok: true, source: "subscription" };
  }

  // Subscription could not cover the minute; try PAYG packs (oldest
  // first, whole-cost coverage only), same shape as the text proxy.
  const { data: eligiblePacks, error: packsError } = await admin
    .from("usage_packs")
    .select("id, usage_remaining")
    .eq("user_id", userId)
    .gt("usage_remaining", 0)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("purchased_at", { ascending: true });
  if (packsError) {
    console.error("[cloud-voice] usage_packs query failed", {
      user_id: userId,
      code: packsError.code,
      message: packsError.message,
    });
    return { ok: false, reason: "deduct_error" };
  }

  for (const pack of eligiblePacks ?? []) {
    if (pack.usage_remaining < VOICE_UNITS_PER_MINUTE) continue;
    const { data: remaining, error: rpcError } = await admin.rpc(
      "atomic_deduct_pack",
      { p_pack_id: pack.id, p_amount: VOICE_UNITS_PER_MINUTE }
    );
    if (rpcError) {
      // STOP at the first pack RPC error, never try another pack
      // (Codex C1 round-2 P1 fold): a lost response may mean the
      // decrement landed, so continuing could charge a second pack for
      // the same minute. Same ambiguous-commit logging contract as the
      // subscription path above.
      console.error(
        JSON.stringify({
          event: "cloud_voice_deduct_ambiguous",
          ts: new Date().toISOString(),
          user_id: userId,
          session_id: sessionId,
          minute,
          request_id: requestId,
          source: "payg",
          error: rpcError.message.slice(0, 200),
        })
      );
      return { ok: false, reason: "deduct_error" };
    }
    if (remaining !== null) {
      // Secondary audit row; the atomic decrement already landed. A
      // failed insert must be loud but must not undo the deduction
      // (same contract as the text proxy PAYG path).
      const { data: profileRow } = await admin
        .from("profiles")
        .select("usage_balance")
        .eq("id", userId)
        .single();
      const { error: txError } = await admin.from("usage_transactions").insert({
        user_id: userId,
        type: "usage",
        amount: -VOICE_UNITS_PER_MINUTE,
        balance_after: profileRow?.usage_balance ?? 0,
        description: `openai/${VOICE_MODEL_ID} (voice minute, PAYG pack)`,
        model_tier: "voice",
        provider: "openai",
        model_id: VOICE_MODEL_ID,
        request_id: requestId,
      });
      if (txError) {
        console.error(
          "[cloud-voice] usage_transactions insert failed after atomic_deduct_pack",
          {
            user_id: userId,
            request_id: requestId,
            code: txError.code,
            message: txError.message,
          }
        );
      }
      return { ok: true, source: "payg" };
    }
  }

  return { ok: false, reason: "insufficient_usage" };
}
