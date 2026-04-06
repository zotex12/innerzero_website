import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ValidateRequest, ValidateResponse, ValidateErrorResponse } from "@/types/licence";

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

    const body = (await request.json()) as Partial<ValidateRequest>;

    if (!body.licence_key || !body.device_fingerprint) {
      return NextResponse.json(
        { valid: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Look up licence
    const { data: licence, error: licenceError } = await supabase
      .from("licences")
      .select("*")
      .eq("licence_key", body.licence_key)
      .single();

    if (licenceError || !licence) {
      return NextResponse.json(
        { valid: false, error: "invalid_key" } satisfies ValidateErrorResponse,
        { status: 401 }
      );
    }

    // Check status
    if (licence.status !== "active") {
      return NextResponse.json(
        {
          valid: false,
          error: "licence_inactive",
          status: licence.status,
        } satisfies ValidateErrorResponse,
        { status: 403 }
      );
    }

    // Check expiry
    if (licence.expires_at && new Date(licence.expires_at) < new Date()) {
      return NextResponse.json(
        {
          valid: false,
          error: "licence_expired",
          expires_at: licence.expires_at,
        } satisfies ValidateErrorResponse,
        { status: 403 }
      );
    }

    // Count active devices for this user
    const { count: activeDeviceCount } = await supabase
      .from("devices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", licence.user_id)
      .eq("is_active", true);

    const devicesUsed = activeDeviceCount ?? 0;

    // Check if device already exists for this user
    const { data: existingDevice } = await supabase
      .from("devices")
      .select("id")
      .eq("user_id", licence.user_id)
      .eq("device_fingerprint", body.device_fingerprint)
      .single();

    let deviceId: string;
    let eventType: string;

    if (existingDevice) {
      // Revalidation: update existing device
      deviceId = existingDevice.id;
      eventType = "validation";

      await supabase
        .from("devices")
        .update({
          last_validated: new Date().toISOString(),
          app_version: body.app_version ?? null,
          device_name: body.device_name ?? null,
          os: body.os ?? null,
          is_active: true,
        })
        .eq("id", deviceId);
    } else {
      // New device: check seat limit
      if (devicesUsed >= licence.seats) {
        return NextResponse.json(
          {
            valid: false,
            error: "seat_limit",
            seats: licence.seats,
            devices_used: devicesUsed,
          } satisfies ValidateErrorResponse,
          { status: 403 }
        );
      }

      // Insert new device
      const { data: newDevice, error: insertError } = await supabase
        .from("devices")
        .insert({
          user_id: licence.user_id,
          device_fingerprint: body.device_fingerprint,
          device_name: body.device_name ?? null,
          os: body.os ?? null,
          app_version: body.app_version ?? null,
        })
        .select("id")
        .single();

      if (insertError || !newDevice) {
        return NextResponse.json(
          { valid: false, error: "server_error" } satisfies ValidateErrorResponse,
          { status: 500 }
        );
      }

      deviceId = newDevice.id;
      eventType = "activation";
    }

    // Log event
    await supabase.from("licence_events").insert({
      user_id: licence.user_id,
      device_id: deviceId,
      event_type: eventType,
      metadata: {
        app_version: body.app_version ?? null,
        ip,
      },
    });

    // Recount after possible insert
    const { count: finalCount } = await supabase
      .from("devices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", licence.user_id)
      .eq("is_active", true);

    const response: ValidateResponse = {
      valid: true,
      licence_type: licence.licence_type,
      company_name: licence.company_name,
      seats: licence.seats,
      devices_used: finalCount ?? devicesUsed,
      expires_at: licence.expires_at,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { valid: false, error: "server_error" } satisfies ValidateErrorResponse,
      { status: 500 }
    );
  }
}
