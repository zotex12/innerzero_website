import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe-server";
import {
  MAX_SELF_SERVE_SEATS,
  priceIdForCadence,
  type BusinessCadence,
} from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCloudPlanById } from "@/lib/cloud-plans";

interface CheckoutBody {
  // Cloud subscription / PAYG flow: client sends plan_id, server looks up
  // stripe_price_id in cloud_plans.
  plan_id?: string;
  // Business Licence flow: client sends cadence + quantity. Server resolves
  // cadence to the allowlisted Stripe price ID; the client never sees a
  // Stripe price identifier. quantity is required and must be a positive
  // integer in [1, MAX_SELF_SERVE_SEATS]; everything else returns 400.
  cadence?: unknown;
  quantity?: unknown;
}

function generateCorrelationId(): string {
  return Math.random().toString(36).slice(2, 8);
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
    const admin = createAdminClient();

    // Get or create Stripe customer
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id ?? null;

    if (!customerId) {
      // Create then claim atomically: conditional UPDATE only sets the id if
      // the profile column is still null. If a concurrent request won the
      // claim, delete the orphan customer we just created and re-read.
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });

      const { data: claimed } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", user.id)
        .is("stripe_customer_id", null)
        .select("stripe_customer_id");

      if (claimed && claimed.length > 0) {
        customerId = customer.id;
      } else {
        try {
          await stripe.customers.del(customer.id);
        } catch (delErr) {
          console.error(
            "[checkout] failed to delete orphan Stripe customer:",
            delErr instanceof Error ? delErr.message : "unknown"
          );
        }

        const { data: reread } = await admin
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", user.id)
          .single();

        customerId = reread?.stripe_customer_id ?? null;

        if (!customerId) {
          const ref = generateCorrelationId();
          console.error(
            `[checkout] ${ref}: customer race re-read failed for user ${user.id}`
          );
          return NextResponse.json(
            { message: "Something went wrong. Please try again.", ref },
            { status: 500 }
          );
        }
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";

    // Cloud plan checkout (plan_id provided)
    if (body.plan_id) {
      const cloudPlan = await getCloudPlanById(body.plan_id);

      if (!cloudPlan) {
        return NextResponse.json({ message: "Plan not found or inactive." }, { status: 400 });
      }

      const mode = cloudPlan.plan_type === "subscription" ? "subscription" : "payment";

      const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
        mode,
        customer: customerId,
        client_reference_id: user.id,
        line_items: [{ price: cloudPlan.stripe_price_id, quantity: 1 }],
        success_url: `${siteUrl}/account?checkout=success`,
        cancel_url: `${siteUrl}/pricing`,
        metadata: {
          plan_id: cloudPlan.id,
          user_id: user.id,
          plan_type: cloudPlan.plan_type,
        },
      };

      if (mode === "subscription") {
        sessionParams.subscription_data = {
          metadata: {
            plan_id: cloudPlan.id,
            user_id: user.id,
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      return NextResponse.json({ url: session.url });
    }

    // Business Licence flow. The client sends only { cadence, quantity };
    // the server resolves cadence to the allowlisted Stripe price ID. Cadence
    // and quantity are both strictly validated: anything other than an
    // integer in [1, MAX_SELF_SERVE_SEATS] returns 400 with no silent
    // fallback (round-2 hardening). Defence in depth on top of the UI gates.
    const { cadence, quantity } = body;

    if (cadence !== "annual" && cadence !== "monthly") {
      return NextResponse.json(
        {
          error: "invalid_cadence",
          message: "cadence must be 'annual' or 'monthly'.",
        },
        { status: 400 }
      );
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_SELF_SERVE_SEATS
    ) {
      return NextResponse.json(
        {
          error: "invalid_quantity",
          message: `quantity must be an integer between 1 and ${MAX_SELF_SERVE_SEATS}. Contact sales for ${MAX_SELF_SERVE_SEATS + 1}+ seats.`,
        },
        { status: 400 }
      );
    }

    const priceId = priceIdForCadence(cadence as BusinessCadence);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity }],
      success_url: `${siteUrl}/account?checkout=success`,
      cancel_url: `${siteUrl}/pricing`,
      subscription_data: {
        metadata: { user_id: user.id },
      },
      allow_promotion_codes: false,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const ref = generateCorrelationId();
    console.error(`[checkout] ${ref}:`, error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again.", ref },
      { status: 500 }
    );
  }
}
