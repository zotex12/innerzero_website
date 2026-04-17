import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";

function generateCorrelationId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "stripePortal");
  if (rateLimited) return rateLimited;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { message: "No billing account found. Purchase a plan first." },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const ref = generateCorrelationId();
    console.error(`[portal] ${ref}:`, error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again.", ref },
      { status: 500 }
    );
  }
}
