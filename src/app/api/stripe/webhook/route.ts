import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCloudPlanByPriceId, grantUsage } from "@/lib/cloud-plans";
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

  // Find user profile by stripe_customer_id
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) return;

  // Retrieve line items to get the price ID
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 1,
  });
  const priceId = lineItems.data[0]?.price?.id;
  if (!priceId) return;

  // Check if this is a business licence purchase
  if (priceId === BUSINESS_PRICE) {
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const quantity = subscription.items.data[0]?.quantity || 1;

    const licenceKey = generateLicenceKey();
    const email = session.customer_details?.email || profile.email;
    const companyName =
      (session.metadata?.company_name as string | undefined) || null;

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

    return;
  }

  // Look up cloud plan by price ID
  const cloudPlan = await getCloudPlanByPriceId(priceId);
  if (!cloudPlan) return;

  if (cloudPlan.plan_type === "subscription") {
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const periodEnd = new Date(
      subscription.items.data[0].current_period_end * 1000
    ).toISOString();

    await admin
      .from("profiles")
      .update({
        plan: cloudPlan.id,
        usage_balance: cloudPlan.usage_amount,
        usage_monthly_allowance: cloudPlan.usage_amount,
        billing_cycle_end: periodEnd,
        subscription_status: "active",
      })
      .eq("id", profile.id);

    await grantUsage(
      profile.id,
      cloudPlan.usage_amount,
      "monthly_grant",
      `${cloudPlan.name} subscription started`,
      session.id
    );
  } else if (cloudPlan.plan_type === "payg") {
    await admin.from("usage_packs").insert({
      user_id: profile.id,
      plan_id: cloudPlan.id,
      usage_granted: cloudPlan.usage_amount,
      usage_remaining: cloudPlan.usage_amount,
    });

    await grantUsage(
      profile.id,
      cloudPlan.usage_amount,
      "payg_purchase",
      `${cloudPlan.name} credit pack purchased`,
      session.id
    );
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = subscription.customer as string;
  const status = mapStripeStatus(subscription.status);
  const priceId = subscription.items.data[0]?.price?.id;

  // Check if this is a cloud plan subscription
  const cloudPlan = priceId ? await getCloudPlanByPriceId(priceId) : null;

  if (cloudPlan && cloudPlan.plan_type === "subscription") {
    // Cloud subscription update
    const { data: profile } = await admin
      .from("profiles")
      .select("id, plan, usage_balance, usage_monthly_allowance")
      .eq("stripe_customer_id", customerId)
      .single();

    if (!profile) return;

    const updates: Record<string, unknown> = {
      plan: cloudPlan.id,
      usage_monthly_allowance: cloudPlan.usage_amount,
      subscription_status: status,
    };

    // If upgrade mid-cycle: add the difference in usage_amount
    // If downgrade mid-cycle: do NOT reduce usage_balance
    if (cloudPlan.usage_amount > (profile.usage_monthly_allowance ?? 0)) {
      const difference =
        cloudPlan.usage_amount - (profile.usage_monthly_allowance ?? 0);
      updates.usage_balance = (profile.usage_balance ?? 0) + difference;
    }

    await admin
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    return;
  }

  // Business licence subscription update (existing behaviour)
  const quantity = subscription.items.data[0]?.quantity || 1;

  await admin
    .from("profiles")
    .update({
      subscription_status: status,
      subscription_end: new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  await admin
    .from("licences")
    .update({ status, seats: quantity })
    .eq("stripe_customer_id", customerId)
    .eq("status", "active");
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price?.id;

  // Check if this is a cloud plan subscription
  const cloudPlan = priceId ? await getCloudPlanByPriceId(priceId) : null;

  if (cloudPlan && cloudPlan.plan_type === "subscription") {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (!profile) return;

    // Set plan to free, zero allowance, but keep usage_balance
    await admin
      .from("profiles")
      .update({
        plan: "free",
        usage_monthly_allowance: 0,
        subscription_status: "cancelled",
      })
      .eq("id", profile.id);

    await grantUsage(
      profile.id,
      0,
      "adjustment",
      "Subscription cancelled"
    );

    return;
  }

  // Business licence cancellation (existing behaviour)
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
  const billingReason = invoice.billing_reason;

  // Handle cloud plan renewal (subscription_cycle only, not first payment)
  if (billingReason === "subscription_cycle" && subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = sub.items.data[0]?.price?.id;
    const cloudPlan = priceId ? await getCloudPlanByPriceId(priceId) : null;

    if (cloudPlan && cloudPlan.plan_type === "subscription") {
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (!profile) return;

      const periodEnd = new Date(
        sub.items.data[0].current_period_end * 1000
      ).toISOString();

      // Reset balance to plan amount and update cycle end
      await admin
        .from("profiles")
        .update({
          usage_balance: cloudPlan.usage_amount,
          billing_cycle_end: periodEnd,
          subscription_status: "active",
          usage_alerts_sent: [],
        })
        .eq("id", profile.id);

      await grantUsage(
        profile.id,
        cloudPlan.usage_amount,
        "monthly_grant",
        `${cloudPlan.name} monthly renewal`
      );

      return;
    }
  }

  // Business licence renewal (existing behaviour)
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

  // Set profile to past_due (applies to both cloud and business)
  // Do NOT remove plan or usage immediately (Stripe retries)
  await admin
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("stripe_customer_id", customerId);

  // Update business licences to past_due
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
