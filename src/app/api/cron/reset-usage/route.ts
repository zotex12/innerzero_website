import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Find profiles that missed their renewal reset
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, usage_monthly_allowance, billing_cycle_end")
    .neq("plan", "free")
    .gt("usage_monthly_allowance", 0)
    .lt("billing_cycle_end", now);

  if (!profiles || profiles.length === 0) {
    console.log(JSON.stringify({ event: "cron_reset_usage", resets: 0 }));
    return NextResponse.json({ resets: 0 });
  }

  let resets = 0;

  for (const profile of profiles) {
    // Calculate next billing cycle end (add 1 month)
    const oldEnd = new Date(profile.billing_cycle_end!);
    const newEnd = new Date(oldEnd);
    newEnd.setMonth(newEnd.getMonth() + 1);

    // Reset usage balance and advance billing cycle
    await admin
      .from("profiles")
      .update({
        usage_balance: profile.usage_monthly_allowance,
        billing_cycle_end: newEnd.toISOString(),
      })
      .eq("id", profile.id);

    // Record the grant
    await admin.from("usage_transactions").insert({
      user_id: profile.id,
      type: "monthly_grant",
      amount: profile.usage_monthly_allowance,
      balance_after: profile.usage_monthly_allowance,
      description: "Monthly usage reset (cron safety net)",
    });

    resets++;
  }

  console.log(JSON.stringify({ event: "cron_reset_usage", resets }));
  return NextResponse.json({ resets });
}
