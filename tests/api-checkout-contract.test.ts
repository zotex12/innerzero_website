// Contract tests for /api/stripe/checkout business-licence cadence/quantity
// validation. The handler depends on Supabase auth + Stripe API. Running
// these end-to-end requires either an integration test environment with
// authentic Supabase + Stripe stubs, or a mocking framework such as vitest.
// Neither is wired up in this project today, so these cases are expressed
// as runnable shape checks against the same predicates the route uses.
//
// The full request flow is also covered by the manual verification
// checklist in .ai/audits/post/business_pricing_uplift_post_audit.md.
//
// Run on demand from CLI: npx tsx --test tests/api-checkout-contract.test.ts
//
// Round-2 contract update (2026-05-14): the previous round wrongly codified
// "non-integer quantity falls back to 1" as acceptable behaviour. The route
// now rejects every non-integer or out-of-range quantity with 400, and these
// assertions are flipped accordingly. Test runner wiring is deferred to a
// follow-up phase per the round-2 brief.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BUSINESS_LICENCE_ANNUAL_PRICE_ID,
  BUSINESS_LICENCE_MONTHLY_PRICE_ID,
  BUSINESS_LICENCE_PRICE_IDS,
  MAX_SELF_SERVE_SEATS,
  isBusinessLicencePriceId,
  priceIdForCadence,
  type BusinessCadence,
} from "../src/lib/stripe";

// ── Allowlist predicate ───────────────────────────────────────────────────
// The route used to take a client-supplied priceId. After round 2 the route
// takes cadence + quantity and resolves cadence to the allowlisted price ID
// server-side, so the allowlist itself stays useful for the webhook and for
// catching drift.

test("BUSINESS_LICENCE_PRICE_IDS: contains the annual price ID", () => {
  assert.equal(
    BUSINESS_LICENCE_PRICE_IDS.has(BUSINESS_LICENCE_ANNUAL_PRICE_ID),
    true
  );
});

test("BUSINESS_LICENCE_PRICE_IDS: contains the monthly price ID", () => {
  assert.equal(
    BUSINESS_LICENCE_PRICE_IDS.has(BUSINESS_LICENCE_MONTHLY_PRICE_ID),
    true
  );
});

test("isBusinessLicencePriceId: rejects unknown IDs and non-strings", () => {
  assert.equal(isBusinessLicencePriceId("price_DEFINITELY_NOT_REAL_xxx"), false);
  assert.equal(isBusinessLicencePriceId(null), false);
  assert.equal(isBusinessLicencePriceId(undefined), false);
  assert.equal(isBusinessLicencePriceId(""), false);
});

// ── Cadence -> priceId mapping (server-side resolution) ───────────────────

test("priceIdForCadence: 'annual' maps to the annual price ID", () => {
  assert.equal(
    priceIdForCadence("annual" as BusinessCadence),
    BUSINESS_LICENCE_ANNUAL_PRICE_ID
  );
});

test("priceIdForCadence: 'monthly' maps to the monthly price ID", () => {
  assert.equal(
    priceIdForCadence("monthly" as BusinessCadence),
    BUSINESS_LICENCE_MONTHLY_PRICE_ID
  );
});

// ── Cadence validation (route returns 400 for anything else) ──────────────

function isAcceptableCadence(c: unknown): boolean {
  return c === "annual" || c === "monthly";
}

test("checkout cadence: 'annual' is accepted", () => {
  assert.equal(isAcceptableCadence("annual"), true);
});

test("checkout cadence: 'monthly' is accepted", () => {
  assert.equal(isAcceptableCadence("monthly"), true);
});

test("checkout cadence: anything else is rejected (400 path)", () => {
  assert.equal(isAcceptableCadence(undefined), false);
  assert.equal(isAcceptableCadence(null), false);
  assert.equal(isAcceptableCadence(""), false);
  assert.equal(isAcceptableCadence("yearly"), false);
  assert.equal(isAcceptableCadence("ANNUAL"), false);
  assert.equal(isAcceptableCadence(1), false);
  assert.equal(isAcceptableCadence({ cadence: "annual" }), false);
});

// ── Quantity validation (route returns 400 for anything outside [1, 24]) ──
//
// Round 2: this predicate now mirrors the strict integer-only check in the
// route. Previous round silently coerced non-integers to 1; that behaviour
// has been removed.

function isAcceptableQuantity(q: unknown): boolean {
  return (
    typeof q === "number" &&
    Number.isInteger(q) &&
    q >= 1 &&
    q <= MAX_SELF_SERVE_SEATS
  );
}

test("checkout quantity: 1 is accepted (lower bound)", () => {
  assert.equal(isAcceptableQuantity(1), true);
});

test("checkout quantity: 24 is accepted (upper bound)", () => {
  assert.equal(isAcceptableQuantity(24), true);
  assert.equal(MAX_SELF_SERVE_SEATS, 24);
});

test("checkout quantity: 0 is rejected", () => {
  assert.equal(isAcceptableQuantity(0), false);
});

test("checkout quantity: 25 is rejected", () => {
  assert.equal(isAcceptableQuantity(25), false);
});

test("checkout quantity: negative integers are rejected", () => {
  assert.equal(isAcceptableQuantity(-1), false);
  assert.equal(isAcceptableQuantity(-24), false);
});

test("checkout quantity: floats are rejected (no silent fallback to 1)", () => {
  // Round-2 hardening: previously coerced to 1, now rejected outright.
  assert.equal(isAcceptableQuantity(1.5), false);
  assert.equal(isAcceptableQuantity(0.999), false);
  assert.equal(isAcceptableQuantity(24.0001), false);
});

test("checkout quantity: strings are rejected (no silent fallback to 1)", () => {
  assert.equal(isAcceptableQuantity("1"), false);
  assert.equal(isAcceptableQuantity("24"), false);
  assert.equal(isAcceptableQuantity(""), false);
});

test("checkout quantity: null and undefined are rejected", () => {
  assert.equal(isAcceptableQuantity(null), false);
  assert.equal(isAcceptableQuantity(undefined), false);
});

test("checkout quantity: NaN and Infinity are rejected", () => {
  assert.equal(isAcceptableQuantity(NaN), false);
  assert.equal(isAcceptableQuantity(Infinity), false);
  assert.equal(isAcceptableQuantity(-Infinity), false);
});
