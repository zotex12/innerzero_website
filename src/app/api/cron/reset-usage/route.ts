import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
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
    console.log(JSON.stringify({ event: "cron_reset_usage", resets: 0, dedup_skips: 0 }));
    return NextResponse.json({ resets: 0 });
  }

  let resets = 0;
  let dedupSkips = 0;

  for (const profile of profiles) {
    // Calculate next billing cycle end (add 1 month)
    const oldEnd = new Date(profile.billing_cycle_end!);
    const newEnd = new Date(oldEnd);
    newEnd.setMonth(newEnd.getMonth() + 1);
    const newEndIso = newEnd.toISOString();

    // Deterministic request_id shared with the webhook reset path.
    // If the Stripe webhook fired first with the same key, the RPC returns
    // applied=false and we log a dedup skip.
    const resetRequestId = `reset_${profile.id}_${newEndIso.slice(0, 10)}`;
    const { data: resetResult, error: resetError } = await admin.rpc(
      "atomic_cycle_reset",
      {
        p_user_id: profile.id,
        p_allowance: profile.usage_monthly_allowance,
        p_new_cycle_end: newEndIso,
        p_request_id: resetRequestId,
      }
    );
    if (resetError) {
      console.error(
        JSON.stringify({
          event: "cron_reset_usage_error",
          user_id: profile.id,
          error: resetError.message,
        })
      );
      continue;
    }

    const row = resetResult?.[0];
    if (row && row.applied) {
      resets++;
    } else {
      dedupSkips++;
      console.log(
        JSON.stringify({
          event: "cycle_reset_dedup_skip",
          source: "cron.reset-usage",
          user_id: profile.id,
          request_id: resetRequestId,
        })
      );
    }
  }

  console.log(JSON.stringify({ event: "cron_reset_usage", resets, dedup_skips: dedupSkips }));
  return NextResponse.json({ resets });
}
