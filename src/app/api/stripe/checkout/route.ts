import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";

// Whitelist of allowed Stripe price IDs from environment
const ALLOWED_PRICES = new Set(
  [process.env.STRIPE_PRICE_BUSINESS_LICENCE, process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_LICENCE]
    .filter(Boolean)
);

interface CheckoutBody {
  priceId: string;
  quantity?: number;
}

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "stripeCheckout");
  if (rateLimited) return rateLimited;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    const body = (await request.json()) as CheckoutBody;
    const { priceId, quantity } = body;

    if (!priceId || !ALLOWED_PRICES.has(priceId)) {
      return NextResponse.json({ message: "Invalid price." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Get or create Stripe customer
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: quantity || 1 }],
      success_url: `${siteUrl}/account?checkout=success`,
      cancel_url: `${siteUrl}/pricing`,
      subscription_data: {
        metadata: { user_id: user.id },
      },
      allow_promotion_codes: false,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
