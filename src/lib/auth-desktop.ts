import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

/**
 * Authenticate desktop app requests via Authorization: Bearer <token>.
 * Extracts the Supabase access token, validates it, and returns the user.
 * Returns a 401 NextResponse if authentication fails.
 */
export async function getDesktopUser(
  request: Request
): Promise<{ user: User } | { error: NextResponse }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid Authorization header." },
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
    return {
      error: NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 401 }
      ),
    };
  }

  return { user };
}
