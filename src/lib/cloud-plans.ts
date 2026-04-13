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
  stripeSessionId?: string
): Promise<void> {
  const admin = createAdminClient();

  // Get current balance to calculate balance_after
  const { data: profile } = await admin
    .from("profiles")
    .select("usage_balance")
    .eq("id", userId)
    .single();

  const currentBalance = profile?.usage_balance ?? 0;
  const balanceAfter = currentBalance + amount;

  // Insert transaction
  await admin.from("usage_transactions").insert({
    user_id: userId,
    type,
    amount,
    balance_after: balanceAfter,
    description,
    stripe_session_id: stripeSessionId ?? null,
  });

  // Update profile balance
  await admin
    .from("profiles")
    .update({ usage_balance: balanceAfter })
    .eq("id", userId);
}

export async function deductUsage(
  userId: string,
  amount: number,
  modelTier: string,
  provider: string,
  modelId: string
): Promise<void> {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("usage_balance")
    .eq("id", userId)
    .single();

  const currentBalance = profile?.usage_balance ?? 0;
  const balanceAfter = currentBalance - amount;

  await admin.from("usage_transactions").insert({
    user_id: userId,
    type: "usage",
    amount: -amount,
    balance_after: balanceAfter,
    description: `${provider}/${modelId}`,
    model_tier: modelTier,
    provider,
    model_id: modelId,
  });

  await admin
    .from("profiles")
    .update({ usage_balance: balanceAfter })
    .eq("id", userId);
}
