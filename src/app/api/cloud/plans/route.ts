import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// This endpoint is intentionally public and MUST stay read-only.
// It uses the anon Supabase key — SELECT policies on cloud_plans and
// model_tiers permit `active = true` reads for the anon role. Never
// reintroduce the service-role client here.

export async function GET() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [plansResult, tiersResult] = await Promise.all([
    supabase
      .from("cloud_plans")
      .select(
        "id, name, plan_type, usage_amount, price_pence, tier_access, sort_order"
      )
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("model_tiers")
      .select("id, name, usage_multiplier, models, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (plansResult.error) {
    console.error("[cloud/plans] cloud_plans query error:", plansResult.error.message);
  }
  if (tiersResult.error) {
    console.error("[cloud/plans] model_tiers query error:", tiersResult.error.message);
  }

  return NextResponse.json({
    plans: plansResult.data ?? [],
    model_tiers: tiersResult.data ?? [],
  });
}
