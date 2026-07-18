// Contract tests for the B3 cloud-refund-chargeback-lifecycle phase:
// claw-back bounding, per-charge idempotency key, and the account-delete
// subscription-cancel status matrix.
//
// Pure-logic shape checks in this repo's established style (no network,
// no Supabase, no Stripe). Run on demand from CLI:
//   npx tsx --test tests/refund-clawback.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  shouldCancelSubStatus,
  clawbackRequestId,
  boundedClawAmount,
} from "../src/lib/refund-clawback";

// ── Account-delete cancellation matrix (H6) ───────────────────────────

test("live subscription statuses are cancelled on account deletion", () => {
  for (const status of ["active", "trialing", "past_due", "unpaid", "paused", "incomplete"]) {
    assert.equal(shouldCancelSubStatus(status), true, status);
  }
});

test("already-dead subscription statuses are left alone", () => {
  assert.equal(shouldCancelSubStatus("canceled"), false);
  assert.equal(shouldCancelSubStatus("incomplete_expired"), false);
});

// ── Per-charge idempotency key ────────────────────────────────────────

test("clawback request id is charge-keyed and index-safe", () => {
  const id = clawbackRequestId("ch_3ABCdefGHIjklMNO");
  assert.equal(id, "clawback_ch_3ABCdefGHIjklMNO");
  // Must satisfy the proxy REQUEST_ID_PATTERN (1-64 alphanumeric/_/-)
  assert.match(id, /^[a-zA-Z0-9_-]{1,64}$/);
});

test("clawback request id never exceeds the 64-char index budget", () => {
  const id = clawbackRequestId("ch_" + "x".repeat(100));
  assert.ok(id.length <= 64);
});

test("refund and dispute for the same charge share one marker", () => {
  assert.equal(
    clawbackRequestId("ch_same"),
    clawbackRequestId("ch_same")
  );
});

// ── Claw amount bounding (never negative, never above the grant) ──────

test("claw is bounded by the remaining balance", () => {
  assert.equal(boundedClawAmount(300, 1000), 300);
});

test("claw is bounded by the plan grant the payment bought", () => {
  assert.equal(boundedClawAmount(5000, 1000), 1000);
});

test("zero or negative balance claws nothing", () => {
  assert.equal(boundedClawAmount(0, 1000), 0);
  assert.equal(boundedClawAmount(-50, 1000), 0);
});

test("zero grant claws nothing regardless of balance", () => {
  assert.equal(boundedClawAmount(5000, 0), 0);
});
