import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// Phase cloud-prebill-reservation (2026-07-17): pre-call reservation for the
// cloud proxy. See supabase/migrations/005_cloud_request_reservations.sql for
// the server-side contract. The whole feature is gated behind the
// CLOUD_PROXY_RESERVATION_ENABLED env kill switch in the route, defaulting
// OFF, so this module is inert until the migration is applied and the flag
// is set.

export type ReservationVerdict =
  | "ok"
  | "insufficient"
  | "duplicate_completed"
  | "duplicate_pending"
  | "payload_mismatch"
  | "no_profile"
  | "invalid_cost";

// The generated Database types do not yet include the 005 RPCs (types are
// regenerated from the live project, and the migration is applied by the
// operator after this code merges). A narrow local cast keeps the rest of
// the file fully typed without loosening the client itself.
type RpcCapable = {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

// Stable hash binding a request_id to the payload it was first used with.
// Reusing a request_id with a different payload is rejected server-side.
export function hashProxyPayload(
  messages: { role: string; content: string }[],
  systemPrompt: string | undefined,
  modelTier: string
): string {
  const canonical = JSON.stringify({
    m: messages.map((m) => [m.role, m.content]),
    s: systemPrompt ?? null,
    t: modelTier,
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export async function reserveCloudRequest(
  admin: SupabaseClient,
  userId: string,
  requestId: string,
  payloadHash: string,
  costUnits: number
): Promise<{ verdict: ReservationVerdict } | { rpcError: string }> {
  const { data, error } = await (admin as unknown as RpcCapable).rpc(
    "atomic_reserve_cloud_request",
    {
      p_user_id: userId,
      p_request_id: requestId,
      p_payload_hash: payloadHash,
      p_cost: costUnits,
    }
  );
  if (error) return { rpcError: error.message };
  if (typeof data !== "string") return { rpcError: "unexpected_rpc_result" };
  return { verdict: data as ReservationVerdict };
}

// Best-effort settle. A miss is safe: a pending hold self-expires from the
// hold sum after 5 minutes (migration 005), so a crashed finalize can never
// permanently block a user's balance.
export async function finalizeCloudRequest(
  admin: SupabaseClient,
  userId: string,
  requestId: string,
  outcome: "completed" | "failed"
): Promise<void> {
  try {
    const { error } = await (admin as unknown as RpcCapable).rpc(
      "finalize_cloud_request_reservation",
      {
        p_user_id: userId,
        p_request_id: requestId,
        p_outcome: outcome,
      }
    );
    if (error) {
      console.error(
        "[cloud-reservations] finalize failed:",
        error.message,
        "outcome=",
        outcome
      );
    }
  } catch (err) {
    console.error(
      "[cloud-reservations] finalize threw:",
      err instanceof Error ? err.message : "unknown"
    );
  }
}
