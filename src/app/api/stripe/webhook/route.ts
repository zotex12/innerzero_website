import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
import type Stripe from "stripe";

export const runtime = "nodejs";

const BUSINESS_PRICE = process.env.STRIPE_PRICE_BUSINESS_LICENCE!;

function generateLicenceKey(): string {
  return (
    "IZ-BIZ-" +
    crypto.randomUUID().split("-").slice(0, 3).join("").toUpperCase()
  );
}

function mapStripeStatus(
  status: string
): "active" | "past_due" | "cancelled" | "expired" {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "cancelled";
    default:
      return "expired";
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const admin = createAdminClient();
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Retrieve the full subscription to get price, quantity, and period end
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  const quantity = item?.quantity || 1;

  // Find user profile by stripe_customer_id
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) return;

  if (priceId === BUSINESS_PRICE) {
    const licenceKey = generateLicenceKey();
    const email =
      session.customer_details?.email || profile.email;
    const companyName =
      (session.metadata?.company_name as string | undefined) || null;

    // Insert licence row
    await admin.from("licences").insert({
      user_id: profile.id,
      email,
      licence_key: licenceKey,
      licence_type: "business",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: "active",
      seats: quantity,
      company_name: companyName,
      expires_at: new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString(),
    });

    // Update profile
    await admin
      .from("profiles")
      .update({
        business_licence: true,
        licence_key: licenceKey,
        stripe_subscription_id: subscriptionId,
        subscription_status: "active",
        subscription_end: new Date(
          subscription.items.data[0].current_period_end * 1000
        ).toISOString(),
        company_name: companyName,
      })
      .eq("id", profile.id);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = subscription.customer as string;
  const status = mapStripeStatus(subscription.status);
  const quantity = subscription.items.data[0]?.quantity || 1;

  // Update profile
  await admin
    .from("profiles")
    .update({
      subscription_status: status,
      subscription_end: new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  // Update licence
  await admin
    .from("licences")
    .update({ status, seats: quantity })
    .eq("stripe_customer_id", customerId)
    .eq("status", "active");
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = subscription.customer as string;

  await admin
    .from("profiles")
    .update({
      business_licence: false,
      subscription_status: "cancelled",
    })
    .eq("stripe_customer_id", customerId);

  await admin
    .from("licences")
    .update({ status: "cancelled" })
    .eq("stripe_customer_id", customerId)
    .neq("status", "cancelled");
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const admin = createAdminClient();
  const customerId = invoice.customer as string;
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  const updates: Record<string, unknown> = {
    subscription_status: "active",
  };

  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    updates.subscription_end = new Date(
      sub.items.data[0].current_period_end * 1000
    ).toISOString();
  }

  await admin
    .from("profiles")
    .update(updates)
    .eq("stripe_customer_id", customerId);

  await admin
    .from("licences")
    .update({ status: "active" })
    .eq("stripe_customer_id", customerId)
    .neq("status", "cancelled");
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const admin = createAdminClient();
  const customerId = invoice.customer as string;

  await admin
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("stripe_customer_id", customerId);

  await admin
    .from("licences")
    .update({ status: "past_due" })
    .eq("stripe_customer_id", customerId)
    .eq("status", "active");
}

export async function POST(request: Request) {
  // Rate limit webhooks (high limit for Stripe retries)
  const { checkRateLimit } = await import("@/lib/rate-limit");
  const rateLimited = checkRateLimit(request, "stripeWebhook");
  if (rateLimited) return rateLimited;

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { message: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { message: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }

  return NextResponse.json({ received: true });
}
