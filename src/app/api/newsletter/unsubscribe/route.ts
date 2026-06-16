import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

// POST /api/newsletter/unsubscribe
//
// Removes a subscriber from the newsletter list. The token is the
// per-subscriber unsubscribe_token (a random UUID) generated when they
// signed up, so the URL is an unguessable capability link.
//
// Two callers:
//  1. The /unsubscribe confirmation page (a fetch with the token).
//  2. Inbox providers doing one-click unsubscribe (RFC 8058): a POST to
//     this URL with the token in the query string and a
//     "List-Unsubscribe=One-Click" form body.
//
// The token is accepted from the query string first (one-click header
// links), then from a JSON or form body. The response never reveals
// whether the token matched, to avoid leaking which tokens are valid.

function readTokenFromQuery(request: Request): string | null {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    return token && token.length <= 100 ? token : null;
  } catch {
    return null;
  }
}

async function readTokenFromBody(request: Request): Promise<string | null> {
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { token?: unknown };
      return typeof body.token === "string" ? body.token : null;
    }
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await request.formData();
      const token = form.get("token");
      return typeof token === "string" ? token : null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: Request) {
  // Rate limit (10 / minute / IP) to blunt token brute-forcing.
  const limited = checkRateLimit(request, "unsubscribe");
  if (limited) return limited;

  let token = readTokenFromQuery(request);
  if (!token) token = await readTokenFromBody(request);

  // Validate shape before touching the DB. Tokens are UUIDs, but stay
  // permissive on format and just cap the length.
  if (!token || token.length < 8 || token.length > 100) {
    // Generic OK-shaped response: do not confirm or deny the token.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const supabase = createAdminClient();
    // Only flip rows that are still subscribed; idempotent for repeats.
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .is("unsubscribed_at", null);

    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(
      "[/api/newsletter/unsubscribe] DB write failed:",
      err instanceof Error ? err.message : err,
    );
    // Still return a generic success shape to the page; the operator
    // sees the real error in server logs.
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
