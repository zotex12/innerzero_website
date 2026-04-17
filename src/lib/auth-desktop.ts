import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

/**
 * Authenticate desktop app requests via Authorization: Bearer <token>.
 * Extracts the Supabase access token, validates it, and returns the user.
 *
 * Auth-failure contract (HTTP status always 401; desktop branches on body
 * `error` sub-code):
 *   - "token_missing"  — no Authorization header, or not a Bearer token
 *   - "token_expired"  — Supabase rejected the JWT as expired (refresh-and-retry)
 *   - "token_invalid"  — any other auth error (prompt re-login)
 * Cross-origin browser requests get HTTP 403 with error "Forbidden origin."
 */
export async function getDesktopUser(
  request: Request
): Promise<{ user: User } | { error: NextResponse }> {
  // Defence-in-depth: reject cross-origin browser requests.
  // Desktop app (Python requests) never sends an Origin header, so this
  // only rejects browser traffic. Accepts the canonical domain and, on
  // Vercel preview deploys, the preview URL as well.
  const origin = request.headers.get("origin");
  if (origin) {
    const allowedOrigins = new Set<string>(["https://innerzero.com"]);
    if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
      allowedOrigins.add(`https://${process.env.VERCEL_URL}`);
    }
    if (!allowedOrigins.has(origin)) {
      return {
        error: NextResponse.json(
          { error: "Forbidden origin." },
          { status: 403 }
        ),
      };
    }
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "token_missing" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.slice(7);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    const message = error?.message?.toLowerCase() ?? "";
    const looksExpired =
      message.includes("expired") ||
      message.includes("jwt expired");
    const subCode = looksExpired ? "token_expired" : "token_invalid";
    return {
      error: NextResponse.json(
        { error: subCode },
        { status: 401 }
      ),
    };
  }

  return { user };
}
