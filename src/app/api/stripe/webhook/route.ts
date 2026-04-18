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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, eventId: string) {
  const admin = createAdminClient();
  const customerId = session.customer as string;
  const clientReferenceId = session.client_reference_id;

  // Prefer client_reference_id (set by our checkout route) — this avoids the
  // dependency on the stripe_customer_id lookup when a concurrent checkout
  // race may have created an orphan customer. Fall back to the legacy lookup
  // for sessions created before this change.
  let profile: { id: string; email: string } | null = null;

  if (clientReferenceId) {
    const { data } = await admin
      .from("profiles")
      .select("id, email")
      .eq("id", clientReferenceId)
      .single();
    profile = data;
  }

  if (!profile) {
    const { data } = await admin
      .from("profiles")
      .select("id, email")
      .eq("stripe_customer_id", customerId)
      .single();
    profile = data;
  }

  if (!profile) return;

  // Single Stripe round-trip: expand line_items and subscription on the
  // session so we avoid two extra listLineItems + subscriptions.retrieve
  // calls later in this handler.
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items", "subscription"],
  });
  const priceId = fullSession.line_items?.data[0]?.price?.id;
  if (!priceId) return;

  const expandedSubscription =
    fullSession.subscription && typeof fullSession.subscription !== "string"
      ? fullSession.subscription
      : null;

  // Check if this is a business licence purchase
  if (priceId === BUSINESS_PRICE) {
    const subscriptionId = session.subscription as string;
    if (!expandedSubscription) return;
    const subscription = expandedSubscription;
    const quantity = subscription.items.data[0]?.quantity || 1;

    const licenceKey = generateLicenceKey();

    // Prefer Stripe's checkout email first. If that's missing, fetch the
    // current email directly from auth.users (source of truth) so the licence
    // goes to the user's live login address even if profiles.email is stale.
    // Fall back to profile.email last so licence creation never blocks on a
    // transient admin read.
    let email: string | null = session.customer_details?.email ?? null;
    if (!email) {
      try {
        const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
        email = authUser?.user?.email ?? null;
      } catch (err) {
        console.error(
          "[webhook] auth.admin.getUserById failed:",
          err instanceof Error ? err.message : "unknown"
        );
      }
    }
    if (!email) {
      email = profile.email;
    }

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
    if (!expandedSubscription) return;
    const subscription = expandedSubscription;
    const periodEnd = new Date(
      subscription.items.data[0].current_period_end * 1000
    ).toISOString();

    // Non-reset fields (plan, allowance, status, stripe_subscription_id) go
    // in a separate UPDATE. The RPC owns usage_balance / billing_cycle_end /
    // usage_alerts_sent. `subscription` is the expanded Stripe.Subscription
    // object (not a string) — we narrowed at the start of this branch.
    await admin
      .from("profiles")
      .update({
        plan: cloudPlan.id,
        usage_monthly_allowance: cloudPlan.usage_amount,
        subscription_status: "active",
        stripe_subscription_id: subscription.id,
      })
      .eq("id", profile.id);

    const resetRequestId = `reset_${profile.id}_${periodEnd.slice(0, 10)}`;
    const { data: resetResult, error: resetError } = await admin.rpc(
      "atomic_cycle_reset",
      {
        p_user_id: profile.id,
        p_allowance: cloudPlan.usage_amount,
        p_new_cycle_end: periodEnd,
        p_request_id: resetRequestId,
      }
    );
    if (resetError) throw resetError;
    const resetRow = resetResult?.[0];
    if (resetRow && !resetRow.applied) {
      console.log(
        JSON.stringify({
          event: "cycle_reset_dedup_skip",
          source: "checkout.session.completed",
          user_id: profile.id,
          request_id: resetRequestId,
        })
      );
    }
  } else if (cloudPlan.plan_type === "payg") {
    // PAYG credits live ONLY in usage_packs. The subscription balance
    // (profiles.usage_balance) MUST NOT be touched here — doing so would
    // double-grant, since the deduct path draws from packs when subscription
    // is insufficient. Historical bug: this branch used grantUsage() which
    // also incremented usage_balance via atomic_grant_subscription, giving
    // every PAYG buyer 2x the credits they paid for.
    // PAYG credits expire 12 months after purchase (industry standard —
    // OpenAI, Anthropic, Google). Set both timestamps explicitly so they
    // stay in lockstep regardless of any future column-default change.
    // setFullYear(+1) preserves calendar semantics across leap years —
    // don't swap for a ms-arithmetic shortcut.
    const purchasedAt = new Date();
    const expiresAt = new Date(purchasedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await admin.from("usage_packs").insert({
      user_id: profile.id,
      plan_id: cloudPlan.id,
      usage_granted: cloudPlan.usage_amount,
      usage_remaining: cloudPlan.usage_amount,
      purchased_at: purchasedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    // Read the current balance for an accurate (unchanged) balance_after on
    // the audit row. This is not a RMW — we never write usage_balance here.
    const { data: balProfile } = await admin
      .from("profiles")
      .select("usage_balance")
      .eq("id", profile.id)
      .single();
    const balanceAfter = balProfile?.usage_balance ?? 0;

    // Idempotency: UNIQUE index on usage_transactions.request_id blocks
    // replays — 23505 on conflict means another handler already processed
    // this Stripe event, so no-op. Same pattern as grantUsage().
    const { error: txInsertError } = await admin
      .from("usage_transactions")
      .insert({
        user_id: profile.id,
        type: "payg_purchase",
        amount: cloudPlan.usage_amount,
        balance_after: balanceAfter,
        description: `${cloudPlan.name} credit pack purchased`,
        stripe_session_id: session.id,
        request_id: eventId,
      });
    if (txInsertError && txInsertError.code !== "23505") {
      throw txInsertError;
    }
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  eventId: string
) {
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
      .select("id, plan, usage_monthly_allowance, subscription_status, cancel_at_period_end")
      .eq("stripe_customer_id", customerId)
      .single();

    if (!profile) return;

    // Always mirror Stripe's cancel_at_period_end bit. Handles BOTH directions:
    // a fresh cancellation (false → true) and an un-cancel from the portal
    // (true → false). Written before the idempotency short-circuit below so
    // the flag still flips even when plan/status/allowance are unchanged
    // (the common cancel-at-period-end case where only this bit moves).
    const cancelAtPeriodEnd = subscription.cancel_at_period_end === true;
    if (profile.cancel_at_period_end !== cancelAtPeriodEnd) {
      await admin
        .from("profiles")
        .update({ cancel_at_period_end: cancelAtPeriodEnd })
        .eq("id", profile.id);
    }

    // Idempotency: skip if state already matches (same plan, same status).
    // Cancel-at-period-end keeps plan/status/allowance unchanged (the sub is
    // still active through billing_cycle_end), so the cancel flag is handled
    // above — this short-circuit then correctly no-ops the rest.
    if (
      profile.plan === cloudPlan.id &&
      profile.subscription_status === status &&
      profile.usage_monthly_allowance === cloudPlan.usage_amount
    ) {
      return;
    }

    const isUpgrade = cloudPlan.usage_amount > (profile.usage_monthly_allowance ?? 0);

    if (isUpgrade) {
      // Mid-cycle upgrade: atomic delta grant preserves concurrent deductions.
      // RPC bumps usage_balance by difference, sets allowance + plan, clears
      // usage_alerts_sent, inserts upgrade_grant transaction. Idempotent via request_id.
      const difference =
        cloudPlan.usage_amount - (profile.usage_monthly_allowance ?? 0);
      const upgradeRequestId = `upgrade_${subscription.id}_${eventId}`;
      const { data: upgradeResult, error: upgradeError } = await admin.rpc(
        "atomic_upgrade_grant",
        {
          p_user_id: profile.id,
          p_added_amount: difference,
          p_new_allowance: cloudPlan.usage_amount,
          p_new_plan: cloudPlan.id,
          p_request_id: upgradeRequestId,
        }
      );
      if (upgradeError) throw upgradeError;
      const upgradeRow = upgradeResult?.[0];
      if (upgradeRow && !upgradeRow.applied) {
        console.log(
          JSON.stringify({
            event: "upgrade_grant_dedup_skip",
            user_id: profile.id,
            request_id: upgradeRequestId,
          })
        );
      }

      // subscription_status is outside the RPC's scope.
      await admin
        .from("profiles")
        .update({ subscription_status: status })
        .eq("id", profile.id);
    } else {
      // Downgrade or same-size change: no balance grant. Absolute writes are safe here.
      await admin
        .from("profiles")
        .update({
          plan: cloudPlan.id,
          usage_monthly_allowance: cloudPlan.usage_amount,
          subscription_status: status,
        })
        .eq("id", profile.id);
    }

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
      .select("id, plan, subscription_status")
      .eq("stripe_customer_id", customerId)
      .single();

    if (!profile) return;

    // Idempotency: skip if already cancelled (prevents corruption on replay
    // if the user has since resubscribed)
    if (profile.plan === "free" && profile.subscription_status === "cancelled") {
      return;
    }

    // Set plan to free, zero allowance, keep usage_balance, and clear the
    // cancel_at_period_end flag — the countdown is over, the flag would be
    // stale on a now-free account.
    await admin
      .from("profiles")
      .update({
        plan: "free",
        usage_monthly_allowance: 0,
        subscription_status: "cancelled",
        cancel_at_period_end: false,
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
  // Idempotency: only update if not already cancelled
  const { data: bizProfile } = await admin
    .from("profiles")
    .select("subscription_status")
    .eq("stripe_customer_id", customerId)
    .single();

  if (bizProfile?.subscription_status === "cancelled") return;

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

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, eventId: string) {
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

      // subscription_status is outside the RPC's scope.
      await admin
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", profile.id);

      const resetRequestId = `reset_${profile.id}_${periodEnd.slice(0, 10)}`;
      const { data: resetResult, error: resetError } = await admin.rpc(
        "atomic_cycle_reset",
        {
          p_user_id: profile.id,
          p_allowance: cloudPlan.usage_amount,
          p_new_cycle_end: periodEnd,
          p_request_id: resetRequestId,
        }
      );
      if (resetError) throw resetError;
      const resetRow = resetResult?.[0];
      if (resetRow && !resetRow.applied) {
        console.log(
          JSON.stringify({
            event: "cycle_reset_dedup_skip",
            source: "invoice.payment_succeeded",
            user_id: profile.id,
            request_id: resetRequestId,
          })
        );
      }

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

  // Idempotency: skip if already past_due
  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_status")
    .eq("stripe_customer_id", customerId)
    .single();

  if (profile?.subscription_status === "past_due") return;

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
  // Signature verification runs FIRST, before rate limiting. A rate limiter
  // that runs before verification can be flooded by hostile senders to 429
  // legitimate Stripe retries.
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
      { message: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Now that the sender is verified, rate-limit keyed by event.type so a
  // single event category being retried in bulk does not crowd out other
  // event types. Stripe signs, so this is a courtesy throttle, not a gate.
  const { rateLimit, LIMITS } = await import("@/lib/rate-limit");
  const { limit, windowMs, store } = LIMITS.stripeWebhook;
  const rl = rateLimit(event.type, limit, windowMs, store);
  if (!rl.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        retryAfter: rl.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rl.retryAfter),
        },
      }
    );
  }

  // Idempotency: check if this event has already been processed.
  // Events that grant usage credits use request_id in usage_transactions.
  // Check the existing unique index on request_id for deduplication.
  const admin = createAdminClient();
  const { data: existingTx } = await admin
    .from("usage_transactions")
    .select("id")
    .eq("request_id", event.id)
    .limit(1)
    .maybeSingle();

  if (existingTx) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        event.id
      );
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, event.id);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, event.id);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }

  return NextResponse.json({ received: true });
}
