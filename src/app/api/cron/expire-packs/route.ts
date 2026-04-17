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

  // Find expired packs that still have remaining usage
  const { data: packs } = await admin
    .from("usage_packs")
    .select("id, user_id, usage_remaining")
    .not("expires_at", "is", null)
    .lt("expires_at", now)
    .gt("usage_remaining", 0);

  if (!packs || packs.length === 0) {
    console.log(JSON.stringify({ event: "cron_expire_packs", expired: 0, already_zero: 0 }));
    return NextResponse.json({ expired: 0 });
  }

  let expired = 0;
  let alreadyZero = 0;

  for (const pack of packs) {
    // atomic_pack_expire uses SELECT FOR UPDATE to serialise concurrent
    // expire + deduct. Returns the amount zeroed (0 if a racing deduction
    // already drained the pack). Does NOT touch profiles.usage_balance —
    // PAYG balances live on usage_packs.
    const { data: zeroedAmount, error: expireError } = await admin.rpc(
      "atomic_pack_expire",
      { p_pack_id: pack.id }
    );

    if (expireError) {
      console.error(
        JSON.stringify({
          event: "cron_expire_packs_error",
          pack_id: pack.id,
          user_id: pack.user_id,
          error: expireError.message,
        })
      );
      continue;
    }

    const amount = zeroedAmount ?? 0;
    if (amount === 0) {
      alreadyZero++;
      console.log(
        JSON.stringify({
          event: "expire_pack_already_zero",
          pack_id: pack.id,
          user_id: pack.user_id,
        })
      );
      continue;
    }

    await admin.from("usage_transactions").insert({
      user_id: pack.user_id,
      type: "expiry",
      amount: -amount,
      balance_after: 0,
      description: "Credit pack expired",
    });

    expired++;
  }

  console.log(JSON.stringify({ event: "cron_expire_packs", expired, already_zero: alreadyZero }));
  return NextResponse.json({ expired });
}
