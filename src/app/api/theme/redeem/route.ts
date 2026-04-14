import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

interface RedeemBody {
  code: string;
  device_fingerprint: string;
}

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "themeRedeem");
  if (rateLimited) return rateLimited;

  let body: RedeemBody;
  try {
    body = (await request.json()) as RedeemBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Validate inputs
  if (
    typeof body.code !== "string" ||
    body.code.length < 1 ||
    body.code.length > 100
  ) {
    return NextResponse.json(
      { error: "code must be a string of 1-100 characters." },
      { status: 400 }
    );
  }

  if (
    typeof body.device_fingerprint !== "string" ||
    body.device_fingerprint.length < 1 ||
    body.device_fingerprint.length > 256
  ) {
    return NextResponse.json(
      { error: "device_fingerprint must be a string of 1-256 characters." },
      { status: 400 }
    );
  }

  // Optional auth: extract user_id if bearer token is present
  let userId: string | null = null;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    } catch {
      // Invalid token — proceed without user_id
    }
  }

  const admin = createAdminClient();

  // Hash the code
  const codeHash = createHash("sha256").update(body.code).digest("hex");

  // Look up theme_codes by code_hash
  const { data: themeCode } = await admin
    .from("theme_codes")
    .select("id, theme_id, label, max_uses, uses, expires_at")
    .eq("code_hash", codeHash)
    .single();

  if (!themeCode) {
    return NextResponse.json({ error: "Invalid code." }, { status: 404 });
  }

  // Check expiry
  if (themeCode.expires_at && new Date(themeCode.expires_at) < new Date()) {
    return NextResponse.json({ error: "Code expired." }, { status: 410 });
  }

  // Check max uses
  if (themeCode.uses >= themeCode.max_uses) {
    return NextResponse.json({ error: "Code fully redeemed." }, { status: 410 });
  }

  // Check if device already redeemed this code
  const { data: existing } = await admin
    .from("theme_redemptions")
    .select("id")
    .eq("code_id", themeCode.id)
    .eq("device_fingerprint", body.device_fingerprint)
    .single();

  if (existing) {
    return NextResponse.json({
      error: "Already redeemed on this device.",
      theme_id: themeCode.theme_id,
      label: themeCode.label,
      unlocked: true,
    }, { status: 409 });
  }

  // Insert redemption
  await admin.from("theme_redemptions").insert({
    code_id: themeCode.id,
    user_id: userId,
    device_fingerprint: body.device_fingerprint,
  });

  // Increment uses
  await admin
    .from("theme_codes")
    .update({ uses: themeCode.uses + 1 })
    .eq("id", themeCode.id);

  return NextResponse.json({
    theme_id: themeCode.theme_id,
    label: themeCode.label,
    unlocked: true,
  });
}
