/**
 * B0 managed-text failover: server-owned primary/fallback config, circuit
 * breaker state (Supabase, migration 006), and the operator incident alert
 * state machine (locked decision 11).
 *
 * Reached only when CLOUD_PROXY_B0_V4FLASH_ENABLED is on in the proxy
 * route. Every function here fails SOFT: an RPC or email failure degrades
 * to plain direct-DeepSeek routing with a loud log, never a thrown error
 * in the request path. Nothing in this module ever logs or stores message
 * content, and all alerting is server-side only.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProviderErrorClass } from "@/lib/cloud-providers";

// ── Server-owned model config (locked decisions 6, 9, 11) ─────────────
// The B0 path routes from this pair, not from model_tiers.models rows:
// tier rows stay for access gating and the usage multiplier only.

export interface B0Candidate {
  provider: "deepseek" | "google";
  modelId: string;
}

export const B0_PRIMARY: B0Candidate = {
  provider: "deepseek",
  modelId: "deepseek-v4-flash",
};

export const B0_FALLBACK: B0Candidate = {
  provider: "google",
  modelId: "gemini-2.5-flash-lite",
};

// Half-open probe interval while the circuit is open: at most one request
// per window is allowed to try DeepSeek again.
export const B0_PROBE_SECONDS = 60;

export type RouteVerdict = "closed" | "probe" | "open";

// Pure candidate selection, exported for tests.
// - closed: primary first, fallback second (when the fallback flag is on).
// - probe:  same list, but the caller must report the primary outcome so
//           a success closes the circuit.
// - open:   fallback only; with the fallback flag off the list is empty
//           and the route fast-fails with the clean 502 envelope instead
//           of burning a timeout on a known-dead primary.
export function selectB0Candidates(
  verdict: RouteVerdict,
  fallbackEnabled: boolean
): { candidates: B0Candidate[]; probe: boolean } {
  if (verdict === "open") {
    return { candidates: fallbackEnabled ? [B0_FALLBACK] : [], probe: false };
  }
  return {
    candidates: fallbackEnabled ? [B0_PRIMARY, B0_FALLBACK] : [B0_PRIMARY],
    probe: verdict === "probe",
  };
}

// Pure failure-action decision, exported for tests (Codex correction c).
// A request-class 4xx must never be resent to another provider and must
// not open the circuit. Only a primary failure with a next candidate and
// a non-request class may fall back.
export function b0FailureAction(
  errorClass: ProviderErrorClass,
  provider: string,
  hasNextCandidate: boolean
): "stop" | "fallback" {
  if (provider !== B0_PRIMARY.provider) return "stop";
  if (errorClass === "request") return "stop";
  return hasNextCandidate ? "fallback" : "stop";
}

// ── RPC wrappers (fail-soft) ──────────────────────────────────────────

// Same narrow cast pattern as cloud-reservations.ts: the generated types
// do not include the 006 RPCs until the operator applies the migration
// and regenerates them.
type RpcCapable = {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

// Route check. Fail-open to "closed": if the health infrastructure is
// unavailable (e.g. flag enabled before migration 006 is applied), the
// route degrades to plain direct-DeepSeek routing.
export async function checkProviderRoute(
  admin: SupabaseClient,
  provider: string,
  probeSeconds: number = B0_PROBE_SECONDS
): Promise<RouteVerdict> {
  try {
    const { data, error } = await (admin as unknown as RpcCapable).rpc(
      "cloud_provider_route_check",
      { p_provider: provider, p_probe_seconds: probeSeconds }
    );
    if (error) {
      console.error("[cloud-failover] route_check rpc failed:", error.message);
      return "closed";
    }
    if (data === "closed" || data === "probe" || data === "open") return data;
    console.error("[cloud-failover] route_check unexpected verdict:", data);
    return "closed";
  } catch (err) {
    console.error(
      "[cloud-failover] route_check threw:",
      err instanceof Error ? err.message : "unknown"
    );
    return "closed";
  }
}

// Report a primary failure and drive the alert state machine: ONE email on
// circuit-open, a throttled summary at most every 30 minutes while open,
// nothing otherwise. p_reason is a classified code + HTTP status only.
// Returns the RPC verdict for logging; never throws.
export async function reportProviderFailure(
  admin: SupabaseClient,
  provider: string,
  reason: string
): Promise<string> {
  try {
    const { data, error } = await (admin as unknown as RpcCapable).rpc(
      "cloud_provider_failure",
      { p_provider: provider, p_reason: reason.slice(0, 200) }
    );
    if (error) {
      console.error("[cloud-failover] failure rpc failed:", error.message);
      return "rpc_error";
    }
    const verdict = typeof data === "string" ? data : "unexpected";
    if (verdict === "opened") {
      await sendIncidentEmail("open", provider, reason);
    } else if (verdict.startsWith("summary_due:")) {
      const count = verdict.slice("summary_due:".length);
      await sendIncidentEmail("summary", provider, `${count} failures since the last alert. Latest: ${reason}`);
    }
    return verdict;
  } catch (err) {
    console.error(
      "[cloud-failover] failure report threw:",
      err instanceof Error ? err.message : "unknown"
    );
    return "threw";
  }
}

// Report a primary success (probe or first call after recovery). Sends the
// ONE recovery email when it closes an open circuit. Never throws.
export async function reportProviderSuccess(
  admin: SupabaseClient,
  provider: string
): Promise<string> {
  try {
    const { data, error } = await (admin as unknown as RpcCapable).rpc(
      "cloud_provider_success",
      { p_provider: provider }
    );
    if (error) {
      console.error("[cloud-failover] success rpc failed:", error.message);
      return "rpc_error";
    }
    const verdict = typeof data === "string" ? data : "unexpected";
    if (verdict === "recovered") {
      await sendIncidentEmail("recovered", provider, "Probe request succeeded.");
    }
    return verdict;
  } catch (err) {
    console.error(
      "[cloud-failover] success report threw:",
      err instanceof Error ? err.message : "unknown"
    );
    return "threw";
  }
}

// Audit one fallback event (Codex correction d). reason carries a
// classified code + HTTP status text only; NEVER content. Never throws.
export async function recordFallbackEvent(
  admin: SupabaseClient,
  userId: string,
  fromProvider: string,
  toProvider: string,
  reason: string
): Promise<void> {
  try {
    const { error } = await (admin as unknown as RpcCapable).rpc(
      "record_cloud_fallback_event",
      {
        p_user_id: userId,
        p_from_provider: fromProvider,
        p_to_provider: toProvider,
        p_reason: reason.slice(0, 200),
      }
    );
    if (error) {
      console.error("[cloud-failover] fallback event rpc failed:", error.message);
    }
  } catch (err) {
    console.error(
      "[cloud-failover] fallback event threw:",
      err instanceof Error ? err.message : "unknown"
    );
  }
}

// ── Operator incident emails (server-side only) ───────────────────────

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ALERT_EMAIL = process.env.CLOUD_INCIDENT_ALERT_EMAIL;
const FROM_EMAIL = "InnerZero <noreply@innerzero.com>";

export type IncidentKind = "open" | "summary" | "recovered";

// Pure builder, exported for tests. detail is a classified reason string,
// never message content. No em dashes.
export function buildIncidentEmail(
  kind: IncidentKind,
  provider: string,
  detail: string
): { subject: string; html: string } {
  const safeDetail = detail.slice(0, 300);
  switch (kind) {
    case "open":
      return {
        subject: `InnerZero Cloud incident: ${provider} circuit OPEN`,
        html: `<p>The managed cloud primary provider <strong>${provider}</strong> failed and the circuit is now OPEN.</p>
<p>Requests are routing to the fallback provider if the fallback flag is enabled; otherwise users receive the clean unavailable message and the desktop falls back to local.</p>
<p>Reason: ${safeDetail}</p>
<p>A probe request will retry ${provider} every ${B0_PROBE_SECONDS} seconds. You will get one recovery email when the circuit closes and a summary at most every 30 minutes while it stays open.</p>`,
      };
    case "summary":
      return {
        subject: `InnerZero Cloud incident: ${provider} still down`,
        html: `<p>The circuit for <strong>${provider}</strong> is still OPEN.</p>
<p>${safeDetail}</p>`,
      };
    case "recovered":
      return {
        subject: `InnerZero Cloud incident resolved: ${provider} recovered`,
        html: `<p>The circuit for <strong>${provider}</strong> has CLOSED. Managed requests are routing to the primary provider again.</p>
<p>${safeDetail}</p>`,
      };
  }
}

async function sendIncidentEmail(
  kind: IncidentKind,
  provider: string,
  detail: string
): Promise<void> {
  if (!ALERT_EMAIL) {
    console.error(
      "[cloud-failover] CLOUD_INCIDENT_ALERT_EMAIL not configured; incident email skipped:",
      kind,
      provider
    );
    return;
  }
  if (!RESEND_API_KEY) {
    console.error(
      "[cloud-failover] RESEND_API_KEY not configured; incident email skipped:",
      kind,
      provider
    );
    return;
  }
  const { subject, html } = buildIncidentEmail(kind, provider, detail);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: ALERT_EMAIL, subject, html }),
    });
    if (!res.ok) {
      console.error(`[cloud-failover] Resend API error: ${res.status}`);
    }
  } catch (err) {
    console.error(
      "[cloud-failover] incident email send failed:",
      err instanceof Error ? err.message : "unknown"
    );
  }
}
