import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "waitlist");
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();

    // Honeypot. A real browser leaves the off-screen "company" field
    // empty. Bots that auto-fill every field trip it. Return a
    // success-shaped response without inserting so the bot does not
    // learn it was filtered.
    if (typeof body.company === "string" && body.company.trim() !== "") {
      return NextResponse.json(
        { success: true, message: "You're on the list!" },
        { status: 200 }
      );
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || email.length > 320 || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check for duplicate
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "This email is already on the waitlist." },
        { status: 409 }
      );
    }

    // Insert new entry
    const { error } = await supabase
      .from("waitlist")
      .insert({ email, source: "website" });

    if (error) {
      // Unique constraint violation (race condition)
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, message: "This email is already on the waitlist." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { success: true, message: "You're on the list!" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
