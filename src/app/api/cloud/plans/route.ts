import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();

  const [plansResult, tiersResult] = await Promise.all([
    admin
      .from("cloud_plans")
      .select(
        "id, name, plan_type, usage_amount, price_pence, tier_access, sort_order"
      )
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    admin
      .from("model_tiers")
      .select(
        "id, name, display_name, usage_multiplier, cost_per_request, models, sort_order"
      )
      .eq("active", true)
      .order("sort_order", { ascending: true }),
  ]);

  return NextResponse.json({
    plans: plansResult.data ?? [],
    model_tiers: tiersResult.data ?? [],
  });
}
