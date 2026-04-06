import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StatusRequest, StatusResponse } from "@/types/licence";

// In-memory rate limiter: IP -> timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { valid: false, error: "rate_limited" },
        { status: 429 }
      );
    }

    const body = (await request.json()) as Partial<StatusRequest>;

    if (!body.licence_key) {
      return NextResponse.json(
        { valid: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: licence, error: licenceError } = await supabase
      .from("licences")
      .select("status, licence_type, seats, expires_at")
      .eq("licence_key", body.licence_key)
      .single();

    if (licenceError || !licence) {
      return NextResponse.json(
        { valid: false, error: "invalid_key" } satisfies StatusResponse,
        { status: 200 }
      );
    }

    const isExpired =
      licence.expires_at && new Date(licence.expires_at) < new Date();

    const response: StatusResponse = {
      valid: licence.status === "active" && !isExpired,
      status: isExpired ? "expired" : licence.status,
      licence_type: licence.licence_type,
      seats: licence.seats,
      expires_at: licence.expires_at,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { valid: false, error: "server_error" } satisfies StatusResponse,
      { status: 500 }
    );
  }
}
