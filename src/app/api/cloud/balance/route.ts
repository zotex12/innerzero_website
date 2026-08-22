import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesktopUser } from "@/lib/auth-desktop";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Cheap in-memory pre-auth IP guard: caps a flood BEFORE the auth verification,
  // and deliberately NOT the shared/DB limiter here - a Postgres write on the
  // unauthenticated path would let a flood hammer the same database auth and
  // billing rely on. Global capping across instances is an edge / firewall
  // rate-limit rule (infra), not this guard.
  const rateLimited = checkRateLimit(request, "cloudBalance");
  if (rateLimited) return rateLimited;

  const auth = await getDesktopUser(request);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select(
      "plan, usage_balance, usage_monthly_allowance, billing_cycle_end, overage_enabled, spending_cap_pence, spending_this_cycle_pence, cancel_at_period_end, subscription_end, business_licence, pro"
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

  // Get active PAYG packs.
  // Schema has purchased_at, not created_at — regression guard. Ordering
  // by a non-existent column makes PostgREST return 42703 with data=null,
  // which silently coalesced to [] and masked every pack in production
  // until a dev DIAG surfaced it.
  const { data: paygPacks, error: packsError } = await admin
    .from("usage_packs")
    .select("id, usage_granted, usage_remaining, expires_at")
    .eq("user_id", auth.user.id)
    .gt("usage_remaining", 0)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("purchased_at", { ascending: true });
  if (packsError) {
    console.error("[balance] usage_packs query failed", {
      user_id: auth.user.id,
      code: packsError.code,
      message: packsError.message,
    });
  }

  // Get all active model tiers.
  // Select real columns only — same regression guard as usage_packs above.
  // This previously asked for `display_name` and `cost_per_request`, which
  // have never existed on model_tiers (see migration 007). PostgREST answered
  // 42703, data came back null, and `?? []` below silently turned every
  // response into `model_tiers: []`. The tier list the desktop actually uses
  // comes from /api/cloud/plans, so nothing downstream broke, which is
  // exactly why it went unnoticed. Display label is `name`.
  const { data: modelTiers, error: tiersError } = await admin
    .from("model_tiers")
    .select("id, name, usage_multiplier, models")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (tiersError) {
    console.error("[balance] model_tiers query failed", {
      code: tiersError.code,
      message: tiersError.message,
    });
  }

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
    cancel_at_period_end: profile.cancel_at_period_end ?? false,
    subscription_end: profile.subscription_end ?? null,
    // InnerZero Pro app-membership entitlement flags. pro is the direct Pro
    // membership column, set by the Stripe Pro webhook branch (P2);
    // business_licence is the real profiles column. The desktop derives
    // effective Pro as (pro OR business_licence OR local licence), so a
    // Business Licence holder unlocks Pro without a direct Pro subscription.
    pro: profile.pro ?? false,
    business_licence: profile.business_licence ?? false,
    tier_access: tierAccess,
    // null (not []) when the query actually failed, so clients can
    // distinguish a read error from a genuinely empty pack list.
    payg_packs: packsError ? null : (paygPacks ?? []),
    model_tiers: modelTiers ?? [],
  });
}
