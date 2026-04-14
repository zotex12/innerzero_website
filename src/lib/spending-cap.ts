/**
 * Spending cap enforcement for cloud usage.
 * Conservative estimate: 0.5p per usage unit.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const PENCE_PER_USAGE_UNIT = 0.5;

/**
 * Calculate estimated spend this billing cycle in pence.
 * Uses usage_transactions SUM since billing cycle start.
 */
export async function getSpendingThisCyclePence(
  admin: SupabaseClient,
  userId: string,
  billingCycleEnd: string | null
): Promise<number> {
  if (!billingCycleEnd) return 0;

  // Derive cycle start: billing_cycle_end minus 1 month
  const end = new Date(billingCycleEnd);
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);

  const { data } = await admin
    .from("usage_transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "usage")
    .gte("created_at", start.toISOString());

  if (!data || data.length === 0) return 0;

  const totalUsageDeducted = data.reduce(
    (sum, row) => sum + Math.abs(row.amount),
    0
  );

  return totalUsageDeducted * PENCE_PER_USAGE_UNIT;
}

/**
 * Check if this request would exceed the spending cap.
 * Returns null if OK, or an error message if cap exceeded.
 * Skips check if spending_cap_pence is 0 (no cap).
 */
export async function checkSpendingCap(
  admin: SupabaseClient,
  userId: string,
  spendingCapPence: number,
  billingCycleEnd: string | null,
  requestCost: number
): Promise<string | null> {
  if (spendingCapPence <= 0) return null;

  const currentSpend = await getSpendingThisCyclePence(
    admin, userId, billingCycleEnd
  );
  const requestEstimate = requestCost * PENCE_PER_USAGE_UNIT;

  if (currentSpend + requestEstimate > spendingCapPence) {
    return "Monthly spending cap reached. Increase your cap in account settings or wait for your next billing cycle.";
  }

  return null;
}
