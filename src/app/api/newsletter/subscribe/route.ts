import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

// POST /api/newsletter/subscribe
//
// Storage-only newsletter signup endpoint. Email automation, double
// opt-in, and the unsubscribe flow are deferred. The unsubscribe
// token is generated up-front by the DB default so the future
// /unsubscribe route can rely on it without a backfill.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = new Set(["homepage", "download_page"] as const);
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Disposable / temp-mail domain blocklist. Conservative list — easy
// to extend. Catching obvious throwaway services here saves a row in
// the DB and a future bounce on whatever email provider gets wired
// up later.
const DISPOSABLE_DOMAINS = new Set([
  "maildrop.cc",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
]);

type Source = "homepage" | "download_page";

interface SubscribeBody {
  email: string;
  source: Source;
  turnstileToken: string;
}

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

function bad(status: number, message: string) {
  // Generic message shape; never echoes user input back. Avoids
  // accidentally leaking the submitted email into a redirected
  // error log later.
  return NextResponse.json({ ok: false, message }, { status });
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail closed: better to reject submissions than silently skip
    // bot protection. Surface the misconfiguration in server logs
    // so it can be caught immediately rather than after a spam
    // wave.
    console.error(
      "[/api/newsletter/subscribe] TURNSTILE_SECRET_KEY missing; rejecting all submissions until configured.",
    );
    return false;
  }
  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      // No caching on a one-shot verification call.
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as TurnstileVerifyResponse;
    return data.success === true;
  } catch (err) {
    console.warn(
      "[/api/newsletter/subscribe] Turnstile verify failed:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

export async function POST(request: Request) {
  // 1. Rate limit (3 / hour / IP). Returns a 429 Response or null.
  const limited = checkRateLimit(request, "newsletter");
  if (limited) return limited;

  // 2. Body parse.
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return bad(400, "Invalid request body");
  }
  if (!raw || typeof raw !== "object") {
    return bad(400, "Invalid request body");
  }
  const body = raw as Partial<SubscribeBody>;

  // 3. Email format + length + disposable-domain checks.
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 320 || !EMAIL_REGEX.test(email)) {
    return bad(400, "Please enter a valid email");
  }
  const domain = email.slice(email.lastIndexOf("@") + 1);
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return bad(400, "Please use a non-disposable email address");
  }

  // 4. Source whitelist.
  const source = body.source;
  if (
    typeof source !== "string" ||
    !ALLOWED_SOURCES.has(source as Source)
  ) {
    return bad(400, "Invalid source");
  }

  // 5. Turnstile.
  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  if (!turnstileToken) return bad(400, "Verification failed");
  const verified = await verifyTurnstile(turnstileToken);
  if (!verified) return bad(400, "Verification failed");

  // 6. Upsert via service-role client.
  try {
    const supabase = createAdminClient();

    const { data: existing, error: selectError } = await supabase
      .from("newsletter_subscribers")
      .select("id, unsubscribed_at")
      .eq("email", email)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing && existing.unsubscribed_at === null) {
      console.log(
        `[/api/newsletter/subscribe] already subscribed (source=${source})`,
      );
      return NextResponse.json(
        { ok: true, message: "You're already on the list." },
        { status: 200 },
      );
    }

    if (existing && existing.unsubscribed_at !== null) {
      // Resubscribe: clear unsubscribed_at, refresh subscribed_at +
      // source, and rotate the unsubscribe token via crypto.randomUUID
      // so an old unsubscribe link can't suddenly take them off the
      // list again after a re-opt-in.
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          unsubscribed_at: null,
          subscribed_at: new Date().toISOString(),
          source,
          unsubscribe_token: crypto.randomUUID(),
        })
        .eq("id", existing.id);
      if (updateError) throw updateError;
      console.log(
        `[/api/newsletter/subscribe] resubscribed (source=${source})`,
      );
      return NextResponse.json(
        { ok: true, message: "Welcome back. You're on the list." },
        { status: 200 },
      );
    }

    // Fresh insert. unsubscribe_token + subscribed_at default at
    // the DB layer, no client-supplied values.
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source });
    if (insertError) {
      // 23505 = unique violation. Race between the SELECT above and
      // the INSERT below. Treat as already-subscribed rather than 500.
      if ((insertError as { code?: string }).code === "23505") {
        return NextResponse.json(
          { ok: true, message: "You're already on the list." },
          { status: 200 },
        );
      }
      throw insertError;
    }

    console.log(`[/api/newsletter/subscribe] subscribed (source=${source})`);
    return NextResponse.json(
      { ok: true, message: "Subscribed" },
      { status: 200 },
    );
  } catch (err) {
    console.error(
      "[/api/newsletter/subscribe] DB write failed:",
      err instanceof Error ? err.message : err,
    );
    return bad(500, "Something went wrong");
  }
}
