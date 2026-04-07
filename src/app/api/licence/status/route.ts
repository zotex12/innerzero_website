import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import type { StatusRequest, StatusResponse } from "@/types/licence";

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, "licence");
  if (rateLimited) return rateLimited;

  try {
    const body = (await request.json()) as Partial<StatusRequest>;

    if (!body.licence_key || typeof body.licence_key !== "string" || body.licence_key.length > 100) {
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
