import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

type CloudPlanRow = {
  id: string;
  name: string;
  plan_type: "subscription" | "payg";
  stripe_product_id: string;
  stripe_price_id: string;
  usage_amount: number;
  price_pence: number;
  tier_access: string[];
  active: boolean;
};

export async function getCloudPlanById(
  planId: string
): Promise<CloudPlanRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("cloud_plans")
    .select("*")
    .eq("id", planId)
    .eq("active", true)
    .single();
  return data;
}

export async function getCloudPlanByPriceId(
  priceId: string
): Promise<CloudPlanRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("cloud_plans")
    .select("*")
    .eq("stripe_price_id", priceId)
    .eq("active", true)
    .single();
  return data;
}

export async function getCloudPlanByProductId(
  productId: string
): Promise<CloudPlanRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("cloud_plans")
    .select("*")
    .eq("stripe_product_id", productId)
    .eq("active", true)
    .single();
  return data;
}

/**
 * Tier set a PLAN-FREE managed-cloud user may request (PAYG packs or a
 * retained balance after cancellation). Phase payg-tier-gate-server-side:
 * the proxy used to check tier_access only for subscribers, so a plan-free
 * user could buy premium/ultra at 4x/8x credits with nothing to gate it.
 *
 * The set is the UNION of tier_access over the ACTIVE plan_type='payg'
 * cloud_plans rows, read live so a widened pack row widens access without a
 * deploy. A read error or no active rows resolves to [] which the caller
 * treats as "refuse every tier" - the same fail-closed shape the subscriber
 * branch has when its plan row is missing. Never throws.
 */
export async function getPaygTierAccess(
  admin: SupabaseClient
): Promise<string[]> {
  try {
    const { data, error } = await admin
      .from("cloud_plans")
      .select("tier_access")
      .eq("plan_type", "payg")
      .eq("active", true);
    if (error || !data) {
      // Logged so an entitlement-read outage (every PAYG user refused) can
      // be told apart from a deliberately empty configuration (Codex fold).
      console.error("[cloud-plans] payg tier_access read failed", {
        code: (error as { code?: string } | null)?.code,
        message: (error as { message?: string } | null)?.message,
      });
      return [];
    }
    const union = new Set<string>();
    for (const row of data as { tier_access: string[] | null }[]) {
      for (const tier of row.tier_access ?? []) union.add(tier);
    }
    return [...union];
  } catch (err) {
    console.error("[cloud-plans] payg tier_access read threw", {
      message: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

/** Plain membership check; an empty allowed set refuses every tier. */
export function isTierAllowed(allowed: string[], tier: string): boolean {
  return allowed.includes(tier);
}

export async function grantUsage(
  userId: string,
  amount: number,
  type: string,
  description: string,
  stripeSessionId?: string,
  requestId?: string
): Promise<number | null> {
  const admin = createAdminClient();

  // Dedup path: insert the transaction row first so the UNIQUE index on
  // request_id is the primitive that blocks replays. If the insert fails with
  // 23505, another concurrent handler already processed this event — no-op.
  // balance_after is filled in after the atomic grant returns the true value.
  let insertedId: string | null = null;
  if (requestId) {
    const { data: inserted, error: insertError } = await admin
      .from("usage_transactions")
      .insert({
        user_id: userId,
        type,
        amount,
        balance_after: 0,
        description,
        stripe_session_id: stripeSessionId ?? null,
        request_id: requestId,
      })
      .select("id")
      .single();

    if (insertError) {
      if (insertError.code === "23505") return null;
      throw insertError;
    }
    insertedId = inserted?.id ?? null;
  }

  // Atomic balance update — DB-side UPDATE ... SET usage_balance = usage_balance + $amount.
  const { data: newBalance, error: rpcError } = await admin.rpc(
    "atomic_grant_subscription",
    { p_user_id: userId, p_amount: amount }
  );
  if (rpcError) throw rpcError;
  if (newBalance === null) return null;

  if (insertedId) {
    await admin
      .from("usage_transactions")
      .update({ balance_after: newBalance })
      .eq("id", insertedId);
  } else {
    await admin.from("usage_transactions").insert({
      user_id: userId,
      type,
      amount,
      balance_after: newBalance,
      description,
      stripe_session_id: stripeSessionId ?? null,
    });
  }

  return newBalance;
}

/**
 * Result of a subscription-path deduction attempt.
 *   - number                    → success; new usage balance
 *   - null                      → subscription balance insufficient (routes fall through to PAYG)
 *   - "spending_cap_exceeded"   → cap would be breached; caller returns HTTP 402
 */
export type DeductResult = number | null | "spending_cap_exceeded";

export async function deductUsage(
  userId: string,
  amount: number,
  modelTier: string,
  provider: string,
  modelId: string,
  requestId: string | undefined,
  costPence: number
): Promise<DeductResult> {
  const admin = createAdminClient();

  // Atomic conditional decrement + cap enforcement + cycle-spend increment
  // under the profile row's update lock. RPC returns one row with
  // (new_balance, new_spend_pence, rejected_reason). rejected_reason is
  // null on success and 'insufficient_usage' / 'spending_cap_exceeded' /
  // 'profile_not_found' on failure.
  const { data, error: rpcError } = await admin.rpc(
    "atomic_deduct_sub_with_cap",
    { p_user_id: userId, p_amount: amount, p_cost_pence: costPence }
  );
  if (rpcError) throw rpcError;

  const row = data?.[0];
  if (!row) return null;

  if (row.rejected_reason === "spending_cap_exceeded") {
    return "spending_cap_exceeded";
  }
  if (row.rejected_reason === "insufficient_usage") {
    return null;
  }
  if (row.rejected_reason === "profile_not_found") {
    return null;
  }
  if (row.new_balance === null) return null;

  // atomic_deduct_sub_with_cap has already decremented usage_balance and
  // bumped spending_this_cycle_pence atomically at this point. The audit
  // row here is secondary — but a silent insert failure (e.g. 23505 on a
  // duplicate request_id from a partially-failed prior call) would leave
  // us deducted without a matching tx row, and the next retry's
  // idempotency pre-check would miss → double-deduct window. Capture and
  // log so ops can reconcile; do NOT retry and do NOT rollback the RPC.
  const { error: txInsertError } = await admin
    .from("usage_transactions")
    .insert({
      user_id: userId,
      type: "usage",
      amount: -amount,
      balance_after: row.new_balance,
      description: `${provider}/${modelId}`,
      model_tier: modelTier,
      provider,
      model_id: modelId,
      ...(requestId ? { request_id: requestId } : {}),
    });
  if (txInsertError) {
    console.error("[cloud-plans] usage_transactions insert failed after atomic_deduct_sub_with_cap", {
      user_id: userId,
      request_id: requestId ?? null,
      new_balance: row.new_balance,
      code: txInsertError.code,
      message: txInsertError.message,
    });
  }

  return row.new_balance;
}
