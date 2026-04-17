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
