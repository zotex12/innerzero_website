import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimitShared, clientIpRateLimitId } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe-server";
import { shouldCancelSubStatus } from "@/lib/refund-clawback";

export async function POST(request: Request) {
  // Durable (shared) IP-keyed limiter, keyed on a pseudonymised IP. Behaviourally
  // identical to the in-memory limiter while CLOUD_PROXY_SHARED_RATELIMIT_ENABLED
  // is off; global cap when on.
  const rateLimited = await checkRateLimitShared(
    request,
    "accountDelete",
    clientIpRateLimitId(request),
  );
  if (rateLimited) return rateLimited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 }
    );
  }

  const admin = createAdminClient();
  const errors: string[] = [];

  // 0. Cancel live Stripe subscriptions BEFORE any row deletion (B3, risk
  // H6: deletion used to remove the data but leave Stripe billing the
  // card forever). Read the customer id now because step 8 deletes the
  // profile row. A Stripe failure never blocks the GDPR deletion: it is
  // recorded in partial_errors and logged loudly for manual follow-up.
  try {
    const { data: prof } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    const stripeCustomerId = prof?.stripe_customer_id ?? null;
    if (stripeCustomerId) {
      // for-await auto-paginates past the page size, so >100 subscriptions
      // cannot leave live billing behind (review round 1 P2 fix).
      for await (const sub of stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        limit: 100,
      })) {
        if (!shouldCancelSubStatus(sub.status)) continue;
        try {
          await stripe.subscriptions.cancel(sub.id);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "failed";
          errors.push(`stripe_cancel ${sub.id}: ${msg}`);
          console.error("[account/delete] stripe subscription cancel failed", {
            user_id: user.id,
            subscription_id: sub.id,
            message: msg,
          });
        }
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "failed";
    errors.push(`stripe_cancel: ${msg}`);
    console.error("[account/delete] stripe cancellation step failed", {
      user_id: user.id,
      message: msg,
    });
  }

  // 1. Delete proxy cost log (no FKs to other public tables)
  try {
    await admin.from("proxy_cost_log").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`proxy_cost_log: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 2. Delete usage transactions
  try {
    await admin.from("usage_transactions").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`usage_transactions: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 3. Delete usage packs
  try {
    await admin.from("usage_packs").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`usage_packs: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 4. Delete theme redemptions
  try {
    await admin.from("theme_redemptions").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`theme_redemptions: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 5. Delete licence events
  try {
    await admin.from("licence_events").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`licence_events: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 6. Delete devices
  try {
    await admin.from("devices").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`devices: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 7. Delete licences
  try {
    await admin.from("licences").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`licences: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 8. Delete profile
  try {
    await admin.from("profiles").delete().eq("id", user.id);
  } catch (e) {
    errors.push(`profiles: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 9. Delete waitlist entry (by email)
  try {
    if (user.email) {
      await admin.from("waitlist").delete().eq("email", user.email);
    }
  } catch (e) {
    errors.push(`waitlist: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 10. Delete auth user
  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    errors.push(`auth: ${authError.message}`);
  }

  if (authError) {
    // Auth deletion failed, which is critical: the account still exists,
    // so this must never report success. (Pre-existing bug fixed in B3
    // review round 1: the old gate required data-deletion errors AS WELL,
    // so a clean data pass with a failed auth delete returned success.)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fully delete account. Please contact support.",
        errors,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Your account and all associated data have been permanently deleted.",
    ...(errors.length > 0 ? { partial_errors: errors } : {}),
  });
}
