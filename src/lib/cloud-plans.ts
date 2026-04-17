import { createAdminClient } from "@/lib/supabase/admin";

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

export async function deductUsage(
  userId: string,
  amount: number,
  modelTier: string,
  provider: string,
  modelId: string,
  requestId?: string
): Promise<number | null> {
  const admin = createAdminClient();

  // Atomic conditional decrement: returns new balance, or null if insufficient.
  const { data: newBalance, error: rpcError } = await admin.rpc(
    "atomic_deduct_subscription",
    { p_user_id: userId, p_amount: amount }
  );
  if (rpcError) throw rpcError;
  if (newBalance === null) return null;

  await admin.from("usage_transactions").insert({
    user_id: userId,
    type: "usage",
    amount: -amount,
    balance_after: newBalance,
    description: `${provider}/${modelId}`,
    model_tier: modelTier,
    provider,
    model_id: modelId,
    ...(requestId ? { request_id: requestId } : {}),
  });

  return newBalance;
}
