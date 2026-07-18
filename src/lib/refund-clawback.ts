/**
 * B3 cloud-refund-chargeback-lifecycle (2026-07-18): claw back managed
 * cloud credits when a payment is refunded or disputed, so a user cannot
 * buy credits, spend or keep them, and take the money back (risk H5).
 *
 * Mapping is PRECISE, never guessed: a charge is clawed only when its
 * payment_intent maps to either a PAYG pack's checkout session or a cloud
 * subscription invoice. Pro, business licence, and unknown payments are
 * never touched. Never logs message content; only ids and amounts.
 */

import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ClawbackTarget =
  | { kind: "payg_pack"; packId: string; userId: string }
  | { kind: "cloud_sub"; userId: string; usageAmount: number }
  | { kind: "none"; reason: string };

// Subscription statuses that must be cancelled when the account is
// deleted (risk H6). canceled / incomplete_expired are already dead.
export function shouldCancelSubStatus(status: string): boolean {
  return status !== "canceled" && status !== "incomplete_expired";
}

// Tiny non-cryptographic hash (djb2, hex) used to keep truncated ids
// injective. Collisions need matching 32-bit hashes AND shared prefixes.
function shortHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

// One claw-back per CHARGE, not per event: charge.refunded and
// charge.dispute.created for the same charge share this marker, and the
// unique index on usage_transactions.request_id backstops races. Charge
// ids have no documented length guarantee, so oversized ids keep a
// distinguishing hash suffix instead of a bare (non-injective) truncation
// (Codex review fold).
export function clawbackRequestId(chargeId: string): string {
  const raw = `clawback_${chargeId}`;
  if (raw.length <= 64) return raw;
  return `${raw.slice(0, 55)}_${shortHash(raw)}`;
}

// Bounded claw amount: never below zero, never more than the plan grant
// the refunded payment bought.
export function boundedClawAmount(balance: number, usageAmount: number): number {
  return Math.max(0, Math.min(balance, usageAmount));
}

function paymentIntentId(charge: Stripe.Charge): string | null {
  const pi = charge.payment_intent;
  if (!pi) return null;
  return typeof pi === "string" ? pi : pi.id;
}

async function profileIdForCustomer(
  admin: SupabaseClient,
  customer: Stripe.Charge["customer"]
): Promise<string | null> {
  const customerId =
    typeof customer === "string" ? customer : customer?.id ?? null;
  if (!customerId) return null;
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

type CloudPlanLookup = (
  priceId: string
) => Promise<{ plan_type: string; usage_amount: number } | null>;

// Resolve what (if anything) a charge's money bought in the cloud
// billing system. Stripe v22 (dahlia) has no Charge.invoice field, so:
// payment_intent -> checkout session (one-time payments: PAYG packs), or
// payment_intent -> invoice payment -> invoice line item (first payment
// AND renewals of cloud subscriptions). The invoice LINE price is the
// authority for classification, never the subscription's CURRENT price:
// a plan change after the refunded payment must not reclassify it (Codex
// review fold; wrong-target/wrong-amount claw prevention). Unresolvable
// classification always SKIPS rather than guessing.
export async function resolveClawbackTarget(
  stripe: Stripe,
  admin: SupabaseClient,
  getCloudPlanByPriceId: CloudPlanLookup,
  charge: Stripe.Charge
): Promise<ClawbackTarget> {
  const pi = paymentIntentId(charge);
  if (!pi) return { kind: "none", reason: "no_payment_intent" };

  // Leg A: one-time checkout session payments (PAYG packs). A session in
  // mode "payment" that maps to no PAYG pack is a non-cloud one-time
  // payment and is never clawed. Any OTHER session mode (subscription /
  // setup) must NOT short-circuit here: a cloud subscription's first
  // charge has both a checkout session and an invoice, and its claw-back
  // resolves through Leg B (review round 1 P1 fix).
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: pi,
    limit: 1,
  });
  const session = sessions.data[0];
  if (session) {
    const { data: pack } = await admin
      .from("usage_packs")
      .select("id, user_id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (pack) {
      return { kind: "payg_pack", packId: pack.id, userId: pack.user_id };
    }
    if (session.mode === "payment") {
      return { kind: "none", reason: "session_not_payg" };
    }
    // subscription/setup-mode session: fall through to Leg B.
  }

  // Leg B: invoice payments (cloud subscription first payment + renewals).
  const invPayments = await stripe.invoicePayments.list({
    payment: { type: "payment_intent", payment_intent: pi },
    limit: 10,
  });
  const invRef = invPayments.data
    .map((p) => p.invoice)
    .find((ref) => ref != null);
  const invoiceId =
    typeof invRef === "string" ? invRef : invRef ? invRef.id : null;
  if (!invoiceId) return { kind: "none", reason: "unmapped_payment" };

  const invoice = await stripe.invoices.retrieve(invoiceId);

  // Scan ALL invoice lines, not just the first: proration/plan-change
  // invoices order pending/proration lines before subscription lines, so
  // lines[0] can be the wrong price (Codex micro-round fold). Negative
  // lines are proration CREDITS, not entitlement-bearing charges, and are
  // excluded before classification: an upgrade invoice carries a negative
  // old-plan credit plus a positive new-plan charge, and must resolve to
  // the new plan rather than skip as ambiguous (Codex round-3 fold).
  // Rule over the remaining charge lines: exactly ONE distinct cloud
  // subscription plan claws that plan; zero means not-cloud; more than
  // one distinct plan is ambiguous and SKIPS. Money decisions never
  // guess.
  const linePrices = new Set<string>();
  for (const line of invoice.lines?.data ?? []) {
    if ((line.amount ?? 0) <= 0) continue;
    const ref = line.pricing?.price_details?.price ?? null;
    const id = typeof ref === "string" ? ref : ref?.id ?? null;
    if (id) linePrices.add(id);
  }
  if (linePrices.size === 0) {
    return { kind: "none", reason: "line_price_unresolved" };
  }

  const matchedPlans = new Map<string, { usage_amount: number }>();
  for (const priceId of linePrices) {
    const plan = await getCloudPlanByPriceId(priceId);
    if (plan && plan.plan_type === "subscription") {
      matchedPlans.set(priceId, { usage_amount: plan.usage_amount });
    }
  }
  if (matchedPlans.size === 0) {
    return { kind: "none", reason: "invoice_not_cloud" };
  }
  if (matchedPlans.size > 1) {
    return { kind: "none", reason: "ambiguous_invoice_lines" };
  }

  const userId = await profileIdForCustomer(admin, charge.customer);
  if (!userId) return { kind: "none", reason: "no_profile_for_customer" };
  const [only] = matchedPlans.values();
  return { kind: "cloud_sub", userId, usageAmount: only.usage_amount };
}

// Execute the claw-back at-most-once per charge. The marker transaction
// row is checked and written BEFORE the deduction: a crash between
// marker and deduction UNDER-claws (logged loudly for manual
// reconciliation) rather than ever double-clawing a paying customer on
// webhook retry. Returns a short outcome string for logging.
export async function performClawback(
  admin: SupabaseClient,
  target: ClawbackTarget,
  chargeId: string,
  source: "refund" | "dispute"
): Promise<string> {
  if (target.kind === "none") return `skip:${target.reason}`;

  const requestId = clawbackRequestId(chargeId);
  const { data: existing } = await admin
    .from("usage_transactions")
    .select("id")
    .eq("request_id", requestId)
    .maybeSingle();
  if (existing) return "skip:already_clawed";

  const userId = target.userId;
  const description =
    target.kind === "payg_pack"
      ? `Claw-back (${source}): PAYG pack expired`
      : `Claw-back (${source}): subscription credits removed`;

  // Marker first (at-most-once). A 23505 race means another instance won.
  // The PENDING suffix distinguishes a crash-orphaned marker (claw never
  // completed; reconcile manually) from a completed zero-balance claw:
  // amount is NOT NULL in the schema, so 0 alone cannot carry that signal
  // (review round 1 P2 fix). The suffix is replaced on completion below.
  const { error: markerError } = await admin.from("usage_transactions").insert({
    user_id: userId,
    type: "refund",
    amount: 0,
    balance_after: null,
    description: `${description} [PENDING]`,
    request_id: requestId,
  });
  if (markerError) {
    console.error("[refund-clawback] marker insert failed:", {
      charge_id: chargeId,
      code: markerError.code,
      message: markerError.message,
    });
    return "skip:marker_failed";
  }

  // Marker-finalize contract (Codex review fold): if a completion update
  // below fails, the CLAW HAS LANDED but the ledger row stays [PENDING].
  // The loud log is the reconciliation truth: never re-claw a PENDING row
  // manually without first checking whether the balance/pack change
  // already happened.
  const finalizeMarker = async (
    patch: Record<string, unknown>,
    landed: string
  ): Promise<void> => {
    const { error } = await admin
      .from("usage_transactions")
      .update(patch)
      .eq("request_id", requestId);
    if (error) {
      console.error(
        "[refund-clawback] CLAW LANDED but marker finalize FAILED; row stays [PENDING]; do not re-claw without checking balances:",
        { charge_id: chargeId, landed, message: error.message }
      );
    }
  };

  if (target.kind === "payg_pack") {
    const { data: zeroed, error } = await admin.rpc("atomic_pack_expire", {
      p_pack_id: target.packId,
    });
    if (error) {
      console.error("[refund-clawback] pack expire failed (marker already written, manual reconciliation needed):", {
        charge_id: chargeId,
        pack_id: target.packId,
        message: error.message,
      });
      return "error:pack_expire_failed";
    }
    await finalizeMarker(
      {
        amount: -(typeof zeroed === "number" ? zeroed : 0),
        description,
      },
      `pack_zeroed:${zeroed ?? 0}`
    );
    return `clawed:pack:${zeroed ?? 0}`;
  }

  // cloud_sub: deduct min(balance, usageAmount), bounded retry because a
  // concurrent spend can invalidate the conditional deduct.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: profile } = await admin
      .from("profiles")
      .select("usage_balance")
      .eq("id", userId)
      .maybeSingle();
    const balance = profile?.usage_balance ?? 0;
    const claw = boundedClawAmount(balance, target.usageAmount);
    if (claw === 0) {
      await finalizeMarker({ description }, "zero_balance_noop");
      return "clawed:sub:0";
    }

    const { data: newBalance, error } = await admin.rpc(
      "atomic_deduct_subscription",
      { p_user_id: userId, p_amount: claw }
    );
    if (error) {
      console.error("[refund-clawback] sub deduct failed (marker already written, manual reconciliation needed):", {
        charge_id: chargeId,
        user_id: userId,
        message: error.message,
      });
      return "error:sub_deduct_failed";
    }
    if (newBalance !== null) {
      await finalizeMarker(
        { amount: -claw, balance_after: newBalance, description },
        `sub_deducted:${claw}`
      );
      return `clawed:sub:${claw}`;
    }
    // Conditional update did not apply (balance moved); re-read and retry.
  }
  console.error("[refund-clawback] sub deduct exhausted retries (marker already written, manual reconciliation needed):", {
    charge_id: chargeId,
    user_id: userId,
  });
  return "error:sub_deduct_retries_exhausted";
}
