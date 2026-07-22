import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimitShared, getClientIp, clientIpRateLimitId } from "@/lib/rate-limit";
import type { ValidateRequest, ValidateResponse, ValidateErrorResponse } from "@/types/licence";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Durable (shared) IP-keyed limiter, keyed on a pseudonymised IP so the
  // shared store never persists a raw address. Behaviourally identical to the
  // in-memory limiter while CLOUD_PROXY_SHARED_RATELIMIT_ENABLED is off.
  const rateLimited = await checkRateLimitShared(
    request,
    "licence",
    clientIpRateLimitId(request),
  );
  if (rateLimited) return rateLimited;

  try {
    const body = (await request.json()) as Partial<ValidateRequest>;

    if (!body.licence_key || !body.device_fingerprint
        || typeof body.licence_key !== "string" || body.licence_key.length > 100
        || typeof body.device_fingerprint !== "string" || body.device_fingerprint.length > 200) {
      return NextResponse.json(
        { valid: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Atomic seat check + device activation (migration 014). The RPC takes the
    // licences row FOR UPDATE, so concurrent activations of the same licence
    // with distinct fingerprints serialise and cannot exceed licence.seats.
    // Cast mirrors the shared-rate-limit / theme-redeem rpc pattern because
    // this function is newer than the generated Supabase types.
    const adminRpc = supabase as unknown as {
      rpc: (
        fn: string,
        args: Record<string, unknown>
      ) => PromiseLike<{
        data: unknown;
        error: { code?: string; message: string } | null;
      }>;
    };
    const { data, error } = await adminRpc.rpc("validate_licence_device", {
      p_licence_key: body.licence_key,
      p_device_fingerprint: body.device_fingerprint,
      p_device_name: body.device_name ?? null,
      p_os: body.os ?? null,
      p_app_version: body.app_version ?? null,
      p_ip: ip,
    });

    if (error) {
      console.error("[licence/validate] rpc failed", {
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        { valid: false, error: "server_error" } satisfies ValidateErrorResponse,
        { status: 500 }
      );
    }

    const verdict = (data ?? {}) as {
      status?: string;
      licence_status?: string;
      licence_type?: string;
      company_name?: string | null;
      seats?: number;
      devices_used?: number;
      expires_at?: string | null;
    };

    switch (verdict.status) {
      case "invalid_key":
        return NextResponse.json(
          { valid: false, error: "invalid_key" } satisfies ValidateErrorResponse,
          { status: 401 }
        );
      case "licence_inactive":
        return NextResponse.json(
          {
            valid: false,
            error: "licence_inactive",
            status: verdict.licence_status,
          } satisfies ValidateErrorResponse,
          { status: 403 }
        );
      case "licence_expired":
        return NextResponse.json(
          {
            valid: false,
            error: "licence_expired",
            expires_at: verdict.expires_at,
          } satisfies ValidateErrorResponse,
          { status: 403 }
        );
      case "seat_limit":
        return NextResponse.json(
          {
            valid: false,
            error: "seat_limit",
            seats: verdict.seats,
            devices_used: verdict.devices_used,
          } satisfies ValidateErrorResponse,
          { status: 403 }
        );
      case "ok": {
        const response: ValidateResponse = {
          valid: true,
          licence_type: verdict.licence_type!,
          company_name: verdict.company_name ?? null,
          seats: verdict.seats!,
          devices_used: verdict.devices_used!,
          expires_at: verdict.expires_at ?? null,
        };
        return NextResponse.json(response, { status: 200 });
      }
      default:
        return NextResponse.json(
          { valid: false, error: "server_error" } satisfies ValidateErrorResponse,
          { status: 500 }
        );
    }
  } catch {
    return NextResponse.json(
      { valid: false, error: "server_error" } satisfies ValidateErrorResponse,
      { status: 500 }
    );
  }
}
