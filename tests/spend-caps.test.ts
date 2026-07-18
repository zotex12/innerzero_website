// Contract tests for the B1 cloud-spend-cap-defaults-and-ceiling phase:
// effective-cap semantics (TS mirror of the migration-009 SQL guard) and
// the total-request-size budget.
//
// Run on demand from CLI:
//   npx tsx --test tests/spend-caps.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  effectiveSpendCapPence,
  totalRequestChars,
  MAX_TOTAL_REQUEST_CHARS,
} from "../src/lib/spending-cap";

// Tests run from the repo root (npx tsx --test tests/...), matching the
// documented invocation in every test file header.
const MIGRATION_009 = readFileSync(
  join(process.cwd(), "supabase", "migrations", "009_spend_caps_and_cost_ceiling.sql"),
  "utf8"
);

// ── Effective cap = least(user cap, plan ceiling), NULL-ignoring ──────

test("both caps null means no cap", () => {
  assert.equal(effectiveSpendCapPence(null, null), null);
});

test("user cap alone applies when the plan has no ceiling (PAYG rows)", () => {
  assert.equal(effectiveSpendCapPence(2000, null), 2000);
});

test("plan ceiling alone applies when the user cleared their cap", () => {
  assert.equal(effectiveSpendCapPence(null, 400), 400);
});

test("the smaller of the two wins", () => {
  assert.equal(effectiveSpendCapPence(2000, 400), 400);
  assert.equal(effectiveSpendCapPence(300, 1600), 300);
});

test("user hard-stop cap of 0 beats any ceiling", () => {
  assert.equal(effectiveSpendCapPence(0, 1600), 0);
});

// ── Derived plan ceilings (decision 10: 50 percent of net revenue) ────

test("plan ceilings sit at half of net revenue, pinned IN THE MIGRATION", () => {
  // Pins read the migration FILE, so a silent edit to a seed value fails
  // here (Codex review fold: constants-only pins could not catch that).
  assert.match(
    MIGRATION_009,
    /set provider_cost_ceiling_pence = 400\s+where id = 'starter'/
  );
  assert.match(
    MIGRATION_009,
    /set provider_cost_ceiling_pence = 800\s+where id = 'plus'/
  );
  assert.match(
    MIGRATION_009,
    /set provider_cost_ceiling_pence = 1600\s+where id = 'pro'/
  );
});

test("migration guards use the hard-stop shape for cap and ceiling", () => {
  // A cap or ceiling of exactly 0 must reject even zero-cost requests.
  assert.match(MIGRATION_009, /spending_cap_pence > 0\s+AND spending_this_cycle_pence \+ p_cost_pence <= spending_cap_pence/);
  assert.match(MIGRATION_009, /v_ceiling > 0\s+AND spending_this_cycle_pence \+ p_cost_pence <= v_ceiling/);
});

test("migration sets the 2000p default user cap and backfills NULLs", () => {
  assert.match(MIGRATION_009, /alter column spending_cap_pence set default 2000/);
  assert.match(MIGRATION_009, /set spending_cap_pence = 2000\s+where spending_cap_pence is null/);
});

// ── Total request size budget ─────────────────────────────────────────

test("total chars sums messages and system prompt", () => {
  const chars = totalRequestChars(
    [{ content: "abc" }, { content: "defgh" }],
    "sys"
  );
  assert.equal(chars, 11);
});

test("missing system prompt counts as zero", () => {
  assert.equal(totalRequestChars([{ content: "abcd" }], undefined), 4);
});

test("the budget is 90k chars and below the old worst case", () => {
  assert.equal(MAX_TOTAL_REQUEST_CHARS, 90_000);
  // Old shape caps alone allowed 10 x 50k + 2k = 502k chars.
  assert.ok(MAX_TOTAL_REQUEST_CHARS < 502_000);
  // A single max-size message (50k) plus the max system prompt (2k)
  // still fits: normal desktop traffic is unaffected.
  assert.ok(50_000 + 2_000 <= MAX_TOTAL_REQUEST_CHARS);
});
