import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimitShared, clientIpRateLimitId } from "@/lib/rate-limit";

interface RedeemBody {
  code: string;
  device_fingerprint: string;
}

export async function POST(request: Request) {
  // Durable (shared) IP-keyed limiter, keyed on a pseudonymised IP. Behaviourally
  // identical to the in-memory limiter while CLOUD_PROXY_SHARED_RATELIMIT_ENABLED
  // is off; global cap when on.
  const rateLimited = await checkRateLimitShared(
    request,
    "themeRedeem",
    clientIpRateLimitId(request),
  );
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

  // Hash the code before use; only the hash is ever stored or queried.
  const codeHash = createHash("sha256").update(body.code).digest("hex");

  // Atomic redeem (migration 013). The RPC takes the theme_codes row FOR UPDATE
  // so concurrent redeems of the same code serialise and the uses check +
  // increment cannot race past max_uses. Cast mirrors the shared-rate-limit rpc
  // pattern because this function is newer than the generated Supabase types.
  const adminRpc = admin as unknown as {
    rpc: (
      fn: string,
      args: Record<string, unknown>
    ) => PromiseLike<{
      data: unknown;
      error: { code?: string; message: string } | null;
    }>;
  };
  const { data, error } = await adminRpc.rpc("redeem_theme_code", {
    p_code_hash: codeHash,
    p_device_fingerprint: body.device_fingerprint,
    p_user_id: userId,
  });

  if (error) {
    console.error("[theme-redeem] rpc failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json({ error: "Redemption failed." }, { status: 500 });
  }

  const verdict = (data ?? {}) as {
    status?: string;
    theme_id?: string;
    label?: string;
  };

  switch (verdict.status) {
    case "invalid":
      return NextResponse.json({ error: "Invalid code." }, { status: 404 });
    case "expired":
      return NextResponse.json({ error: "Code expired." }, { status: 410 });
    case "exhausted":
      return NextResponse.json({ error: "Code fully redeemed." }, { status: 410 });
    case "already_redeemed":
      return NextResponse.json(
        {
          error: "Already redeemed on this device.",
          theme_id: verdict.theme_id,
          label: verdict.label,
          unlocked: true,
        },
        { status: 409 }
      );
    case "redeemed":
      return NextResponse.json({
        theme_id: verdict.theme_id,
        label: verdict.label,
        unlocked: true,
      });
    default:
      return NextResponse.json({ error: "Redemption failed." }, { status: 500 });
  }
}
