import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesktopUser } from "@/lib/auth-desktop";
import { deductUsage } from "@/lib/cloud-plans";
import { checkRateLimit } from "@/lib/rate-limit";

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

interface DeductBody {
  model_tier: string;
  provider: string;
  model_id: string;
  request_id?: string;
}

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "cloudDeduct");
  if (rateLimited) return rateLimited;

  const auth = await getDesktopUser(request);
  if ("error" in auth) return auth.error;

  let body: DeductBody;
  try {
    body = (await request.json()) as DeductBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !body.model_tier ||
    !body.provider ||
    !body.model_id ||
    typeof body.model_tier !== "string" ||
    typeof body.provider !== "string" ||
    typeof body.model_id !== "string"
  ) {
    return NextResponse.json(
      { error: "model_tier, provider, and model_id are required." },
      { status: 400 }
    );
  }

  const requestId = body.request_id;
  if (requestId !== undefined) {
    if (typeof requestId !== "string" || !REQUEST_ID_PATTERN.test(requestId)) {
      return NextResponse.json(
        { error: "request_id must be 1-64 alphanumeric/hyphen characters." },
        { status: 400 }
      );
    }
  }

  const admin = createAdminClient();

  // Idempotency: if request_id was already processed, return the cached result
  if (requestId) {
    const { data: existing } = await admin
      .from("usage_transactions")
      .select("amount, balance_after")
      .eq("request_id", requestId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        usage_deducted: Math.abs(existing.amount),
        usage_remaining: existing.balance_after,
        idempotent: true,
      });
    }
  }

  // Look up model tier to get usage_multiplier
  const { data: tier } = await admin
    .from("model_tiers")
    .select("usage_multiplier")
    .eq("name", body.model_tier)
    .eq("active", true)
    .single();

  if (!tier) {
    return NextResponse.json(
      { error: "Unknown or inactive model tier." },
      { status: 400 }
    );
  }

  const cost = tier.usage_multiplier;

  // Get current subscription balance
  const { data: profile } = await admin
    .from("profiles")
    .select("usage_balance")
    .eq("id", auth.user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const subscriptionBalance = profile.usage_balance ?? 0;

  // Try subscription balance first
  if (subscriptionBalance >= cost) {
    await deductUsage(
      auth.user.id,
      cost,
      body.model_tier,
      body.provider,
      body.model_id,
      requestId
    );

    return NextResponse.json({
      success: true,
      usage_deducted: cost,
      usage_remaining: subscriptionBalance - cost,
    });
  }

  // Subscription balance insufficient, try PAYG packs (oldest first, skip expired)
  const { data: paygPacks } = await admin
    .from("usage_packs")
    .select("id, usage_remaining")
    .eq("user_id", auth.user.id)
    .gt("usage_remaining", 0)
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("created_at", { ascending: true });

  const eligiblePack = paygPacks?.find((p) => p.usage_remaining >= cost);

  if (!eligiblePack) {
    return NextResponse.json({
      error: "insufficient_usage",
      usage_balance: subscriptionBalance,
    });
  }

  // Deduct from PAYG pack
  const newPackRemaining = eligiblePack.usage_remaining - cost;
  await admin
    .from("usage_packs")
    .update({ usage_remaining: newPackRemaining })
    .eq("id", eligiblePack.id);

  // Record the transaction (deductUsage updates profiles.usage_balance,
  // but for PAYG we track via the pack; record the transaction for audit)
  await admin.from("usage_transactions").insert({
    user_id: auth.user.id,
    type: "usage",
    amount: -cost,
    balance_after: subscriptionBalance,
    description: `${body.provider}/${body.model_id} (PAYG pack)`,
    model_tier: body.model_tier,
    provider: body.provider,
    model_id: body.model_id,
    ...(requestId ? { request_id: requestId } : {}),
  });

  return NextResponse.json({
    success: true,
    usage_deducted: cost,
    usage_remaining: subscriptionBalance,
    payg_pack_remaining: newPackRemaining,
  });
}
