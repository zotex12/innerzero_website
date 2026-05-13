// Unit tests for the Business Licence pricing helpers in src/lib/stripe.ts.
//
// Uses Node's built-in node:test + node:assert (no new dependencies). The
// project does not currently have a test runner wired up, so these tests
// are run on demand from the CLI:
//
//   npx tsx --test tests/business-pricing.test.ts
//
// `tsx` (or any other TS loader) is not yet installed; the file is still
// type-checked by `npx tsc --noEmit`. Wiring a runner script into
// package.json is deferred to a follow-up.
//
// Boundary cases per phase brief: 1, 4, 5, 24 seats x { monthly, annual }.
// computeYearlySavings must round to ~37 percent and £90.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  computeBusinessTotal,
  computeYearlySavings,
  TIER1_ANNUAL_PENCE,
  TIER2_ANNUAL_PENCE,
  MONTHLY_PENCE,
  VOLUME_THRESHOLD,
  MAX_SELF_SERVE_SEATS,
  BUSINESS_LICENCE_PRICE_IDS,
  isBusinessLicencePriceId,
} from "../src/lib/stripe";

test("computeBusinessTotal: 1 seat annual uses tier 1 per-seat rate", () => {
  const r = computeBusinessTotal(1, "annual");
  assert.equal(r.perSeatPence, TIER1_ANNUAL_PENCE);
  assert.equal(r.totalPence, TIER1_ANNUAL_PENCE);
  assert.equal(r.isVolume, false);
  assert.equal(r.cadence, "annual");
});

test("computeBusinessTotal: 4 seats annual still tier 1 (threshold is 5)", () => {
  const r = computeBusinessTotal(4, "annual");
  assert.equal(r.perSeatPence, TIER1_ANNUAL_PENCE);
  assert.equal(r.totalPence, TIER1_ANNUAL_PENCE * 4);
  assert.equal(r.isVolume, false);
});

test("computeBusinessTotal: 5 seats annual flips to tier 2 (volume rate)", () => {
  const r = computeBusinessTotal(5, "annual");
  assert.equal(r.perSeatPence, TIER2_ANNUAL_PENCE);
  assert.equal(r.totalPence, TIER2_ANNUAL_PENCE * 5);
  assert.equal(r.isVolume, true);
  assert.equal(VOLUME_THRESHOLD, 5);
});

test("computeBusinessTotal: 24 seats annual is tier 2, total = 24 x £129.99", () => {
  const r = computeBusinessTotal(24, "annual");
  assert.equal(r.perSeatPence, TIER2_ANNUAL_PENCE);
  assert.equal(r.totalPence, TIER2_ANNUAL_PENCE * 24);
  assert.equal(r.isVolume, true);
  assert.equal(MAX_SELF_SERVE_SEATS, 24);
});

test("computeBusinessTotal: 1 seat monthly is flat £19.99", () => {
  const r = computeBusinessTotal(1, "monthly");
  assert.equal(r.perSeatPence, MONTHLY_PENCE);
  assert.equal(r.totalPence, MONTHLY_PENCE);
  assert.equal(r.isVolume, false);
});

test("computeBusinessTotal: 4 seats monthly never volume-tiers", () => {
  const r = computeBusinessTotal(4, "monthly");
  assert.equal(r.perSeatPence, MONTHLY_PENCE);
  assert.equal(r.totalPence, MONTHLY_PENCE * 4);
  assert.equal(r.isVolume, false);
});

test("computeBusinessTotal: 5 seats monthly stays per-seat flat (no volume tier on monthly)", () => {
  const r = computeBusinessTotal(5, "monthly");
  assert.equal(r.perSeatPence, MONTHLY_PENCE);
  assert.equal(r.totalPence, MONTHLY_PENCE * 5);
  assert.equal(r.isVolume, false);
});

test("computeBusinessTotal: 24 seats monthly is 24 x £19.99", () => {
  const r = computeBusinessTotal(24, "monthly");
  assert.equal(r.perSeatPence, MONTHLY_PENCE);
  assert.equal(r.totalPence, MONTHLY_PENCE * 24);
  assert.equal(r.isVolume, false);
});

test("computeBusinessTotal: clamps seats below 1 to 1", () => {
  const r = computeBusinessTotal(0, "annual");
  assert.equal(r.totalPence, TIER1_ANNUAL_PENCE);
});

test("computeBusinessTotal: clamps seats above MAX_SELF_SERVE_SEATS", () => {
  const r = computeBusinessTotal(99, "annual");
  assert.equal(r.totalPence, TIER2_ANNUAL_PENCE * MAX_SELF_SERVE_SEATS);
});

test("computeYearlySavings: returns ~37 percent and ~£90 (tier 1 single-seat)", () => {
  const s = computeYearlySavings();
  // Tier 1 annual £149.99 vs monthly 12 x £19.99 = £239.88. Saving £89.89.
  // That rounds to £90 and 37 percent (8989 / 23988 = 0.3747...).
  assert.equal(s.poundsPerYearRounded, 90);
  assert.equal(s.percent, 37);
});

test("BUSINESS_LICENCE_PRICE_IDS: contains exactly 2 entries", () => {
  assert.equal(BUSINESS_LICENCE_PRICE_IDS.size, 2);
});

test("isBusinessLicencePriceId: accepts known IDs and rejects others", () => {
  const annualId = Array.from(BUSINESS_LICENCE_PRICE_IDS)[0];
  assert.equal(isBusinessLicencePriceId(annualId), true);
  assert.equal(isBusinessLicencePriceId("price_fake_unknown"), false);
  assert.equal(isBusinessLicencePriceId(null), false);
  assert.equal(isBusinessLicencePriceId(undefined), false);
  assert.equal(isBusinessLicencePriceId(""), false);
});
