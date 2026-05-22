// Unit tests for the InnerZero Pro pricing helpers in src/lib/stripe.ts.
//
// Node's built-in node:test + node:assert (no new dependencies). Run on demand:
//
//   npx tsx --test tests/pro-membership.test.ts
//
// Also type-checked by `npx tsc --noEmit`. Pro is a flat app-membership
// subscription: monthly GBP 4.99, annual GBP 39.99. Mirrors the shape-check
// style of business-pricing.test.ts.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PRO_MONTHLY_PENCE,
  PRO_ANNUAL_PENCE,
  PRO_MONTHLY_PRICE_ID,
  PRO_ANNUAL_PRICE_ID,
  PRO_PRICE_IDS,
  isProPriceId,
  priceIdForProCadence,
  BUSINESS_LICENCE_PRICE_IDS,
} from "../src/lib/stripe";

test("Pro pence constants: monthly 499, annual 3999", () => {
  assert.equal(PRO_MONTHLY_PENCE, 499);
  assert.equal(PRO_ANNUAL_PENCE, 3999);
});

test("PRO_PRICE_IDS: contains exactly the monthly + annual price IDs", () => {
  assert.equal(PRO_PRICE_IDS.size, 2);
  assert.ok(PRO_PRICE_IDS.has(PRO_MONTHLY_PRICE_ID));
  assert.ok(PRO_PRICE_IDS.has(PRO_ANNUAL_PRICE_ID));
});

test("priceIdForProCadence: maps cadence to the matching price ID", () => {
  assert.equal(priceIdForProCadence("monthly"), PRO_MONTHLY_PRICE_ID);
  assert.equal(priceIdForProCadence("annual"), PRO_ANNUAL_PRICE_ID);
});

test("isProPriceId: accepts known Pro IDs, rejects everything else", () => {
  assert.equal(isProPriceId(PRO_MONTHLY_PRICE_ID), true);
  assert.equal(isProPriceId(PRO_ANNUAL_PRICE_ID), true);
  assert.equal(isProPriceId("price_fake_unknown"), false);
  assert.equal(isProPriceId(null), false);
  assert.equal(isProPriceId(undefined), false);
  assert.equal(isProPriceId(""), false);
});

test("Pro and Business Licence price-ID sets do not overlap", () => {
  for (const id of BUSINESS_LICENCE_PRICE_IDS) {
    assert.equal(
      isProPriceId(id),
      false,
      `Pro predicate must not match Business Licence id ${id}`
    );
  }
  for (const id of PRO_PRICE_IDS) {
    assert.equal(
      BUSINESS_LICENCE_PRICE_IDS.has(id),
      false,
      `Business set must not contain Pro id ${id}`
    );
  }
});
