import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesktopUser } from "@/lib/auth-desktop";

export async function GET(request: Request) {
  const auth = await getDesktopUser(request);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select(
      "plan, usage_balance, usage_monthly_allowance, billing_cycle_end, overage_enabled, spending_cap_pence, spending_this_cycle_pence"
    )
    .eq("id", auth.user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  // Get tier_access from the user's cloud plan
  let tierAccess: string[] = [];
  if (profile.plan && profile.plan !== "free") {
    const { data: cloudPlan } = await admin
      .from("cloud_plans")
      .select("tier_access")
      .eq("id", profile.plan)
      .single();
    tierAccess = cloudPlan?.tier_access ?? [];
  }

  // Get active PAYG packs
  const { data: paygPacks } = await admin
    .from("usage_packs")
    .select("id, usage_granted, usage_remaining, expires_at")
    .eq("user_id", auth.user.id)
    .gt("usage_remaining", 0)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("created_at", { ascending: true });

  // Get all active model tiers
  const { data: modelTiers } = await admin
    .from("model_tiers")
    .select(
      "id, name, display_name, usage_multiplier, cost_per_request, models"
    )
    .eq("active", true)
    .order("sort_order", { ascending: true });

  // Cycle spend is now a column on profiles — single-row read, maintained
  // atomically by atomic_deduct_sub_with_cap. `spending_cap_pence` is
  // number | null (null means "no cap", 0 means "hard stop").
  return NextResponse.json({
    plan: profile.plan,
    usage_balance: profile.usage_balance,
    usage_monthly_allowance: profile.usage_monthly_allowance,
    billing_cycle_end: profile.billing_cycle_end,
    overage_enabled: profile.overage_enabled,
    spending_cap_pence: profile.spending_cap_pence,
    spending_this_cycle_pence: profile.spending_this_cycle_pence ?? 0,
    tier_access: tierAccess,
    payg_packs: paygPacks ?? [],
    model_tiers: modelTiers ?? [],
  });
}
