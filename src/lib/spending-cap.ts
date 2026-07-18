/**
 * Spending cap — read-only helpers.
 *
 * Mutations go through `atomic_deduct_sub_with_cap` (Phase 90 Batch 6).
 * That RPC maintains `profiles.spending_this_cycle_pence` atomically on
 * every deduction and enforces the cap in the same statement, so there is
 * no separate write path in this module.
 *
 * Cap semantics after Batch 6:
 *   - spending_cap_pence IS NULL  → no cap (deduct freely)
 *   - spending_cap_pence = 0      → hard stop (reject every deduction)
 *   - spending_cap_pence > 0      → reject when cycle spend + request > cap
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** Conservative cost-per-usage-unit for paths without real token counts
 *  (e.g. /api/cloud/deduct). The proxy route uses real provider estimates. */
export const PENCE_PER_USAGE_UNIT = 0.5;

// ── B1 (2026-07-18): request-size cap + effective-cap semantics ───────

/** Total input budget per proxy request across all message contents plus
 *  the system prompt. 90,000 chars is ~22k tokens at 4 chars/token,
 *  inside the H9 sizing budget that keeps a 1-unit call under the
 *  decision-10 margin floor at the Pro per-unit rate. Hostile
 *  token-dense input that beats the chars/token assumption is bounded at
 *  CYCLE level by the plan provider-cost ceiling (migration 009), which
 *  uses real post-call token costs. */
export const MAX_TOTAL_REQUEST_CHARS = 90_000;

/** Sum of message content lengths plus the system prompt length. */
export function totalRequestChars(
  messages: { content: string }[],
  systemPrompt: string | undefined
): number {
  let total = systemPrompt ? systemPrompt.length : 0;
  for (const m of messages) total += m.content.length;
  return total;
}

/** TS mirror of the migration-009 guard semantics: effective cap is the
 *  smaller of the user cap and the plan ceiling, where NULL means "no
 *  cap of that kind" (Postgres least() ignores NULLs the same way).
 *  Exported for tests and any read-side advisory use. */
export function effectiveSpendCapPence(
  userCapPence: number | null,
  planCeilingPence: number | null
): number | null {
  if (userCapPence === null) return planCeilingPence;
  if (planCeilingPence === null) return userCapPence;
  return Math.min(userCapPence, planCeilingPence);
}

/**
 * Read the denormalised cycle spend directly from the profile row.
 * Signature kept so existing callers do not change, but `billingCycleEnd`
 * is no longer used — the cycle-spend column is reset by the RPCs on
 * cycle renewal / upgrade.
 */
export async function getSpendingThisCyclePence(
  admin: SupabaseClient,
  userId: string,
  _billingCycleEnd: string | null
): Promise<number> {
  const { data } = await admin
    .from("profiles")
    .select("spending_this_cycle_pence")
    .eq("id", userId)
    .single();

  return data?.spending_this_cycle_pence ?? 0;
}

/**
 * Read-only cap check. Post-Batch 6 the deduct + proxy routes do NOT call
 * this — they rely on `atomic_deduct_sub_with_cap` instead. Retained for
 * any future read-side use; no mutation happens here.
 *
 * Returns null when the request is within the cap (or no cap set); returns
 * an error message string when the request would breach the cap.
 */
export async function checkSpendingCap(
  admin: SupabaseClient,
  userId: string,
  spendingCapPence: number | null,
  billingCycleEnd: string | null,
  requestCost: number
): Promise<string | null> {
  // No cap configured — skip.
  if (spendingCapPence === null) return null;

  // Hard stop — cap explicitly set to 0 rejects every deduction.
  if (spendingCapPence === 0) {
    return "Monthly spending cap reached. Increase your cap in account settings or wait for your next billing cycle.";
  }

  const currentSpend = await getSpendingThisCyclePence(
    admin, userId, billingCycleEnd
  );
  const requestEstimate = requestCost * PENCE_PER_USAGE_UNIT;

  if (currentSpend + requestEstimate > spendingCapPence) {
    return "Monthly spending cap reached. Increase your cap in account settings or wait for your next billing cycle.";
  }

  return null;
}
