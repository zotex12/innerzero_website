import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Find expired packs that still have remaining usage
  const { data: packs } = await admin
    .from("usage_packs")
    .select("id, user_id, usage_remaining")
    .not("expires_at", "is", null)
    .lt("expires_at", now)
    .gt("usage_remaining", 0);

  if (!packs || packs.length === 0) {
    console.log(JSON.stringify({ event: "cron_expire_packs", expired: 0 }));
    return NextResponse.json({ expired: 0 });
  }

  let expired = 0;

  for (const pack of packs) {
    // Zero out the pack
    await admin
      .from("usage_packs")
      .update({ usage_remaining: 0 })
      .eq("id", pack.id);

    // Subtract expired amount from profile balance
    const { data: profile } = await admin
      .from("profiles")
      .select("usage_balance")
      .eq("id", pack.user_id)
      .single();

    const currentBalance = profile?.usage_balance ?? 0;
    const newBalance = Math.max(0, currentBalance - pack.usage_remaining);

    await admin
      .from("profiles")
      .update({ usage_balance: newBalance })
      .eq("id", pack.user_id);

    // Record the expiry transaction
    await admin.from("usage_transactions").insert({
      user_id: pack.user_id,
      type: "expiry",
      amount: -pack.usage_remaining,
      balance_after: newBalance,
      description: "Credit pack expired",
    });

    expired++;
  }

  console.log(JSON.stringify({ event: "cron_expire_packs", expired }));
  return NextResponse.json({ expired });
}
