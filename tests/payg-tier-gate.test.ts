// Contract tests for the payg-tier-gate-server-side phase: plan-free
// managed-cloud users (PAYG packs or a retained balance) are tier-gated
// at the proxy trust boundary by the union of the ACTIVE payg cloud_plans
// rows' tier_access, failing CLOSED, and the balance route reports the
// same set so the desktop picker and the gate agree.
//
// Run on demand from CLI:
//   npx tsx --test tests/payg-tier-gate.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPaygTierAccess, isTierAllowed } from "../src/lib/cloud-plans";

const PROXY_ROUTE = readFileSync(
  join(process.cwd(), "src", "app", "api", "cloud", "proxy", "route.ts"),
  "utf8"
);
const BALANCE_ROUTE = readFileSync(
  join(process.cwd(), "src", "app", "api", "cloud", "balance", "route.ts"),
  "utf8"
);
const MIGRATION_007 = readFileSync(
  join(process.cwd(), "supabase", "migrations", "007_billing_schema_baseline.sql"),
  "utf8"
);

type Row = { tier_access: string[] | null };
type Seen = { table?: string; select?: string; filters: [string, unknown][] };

// Stub of admin.from("cloud_plans").select("tier_access").eq("plan_type","payg").eq("active",true)
// The chain is a thenable like supabase-js; `reject` makes the await throw.
function stubAdmin(
  rows: Row[] | null,
  error: { message: string } | null = null,
  seen: Seen = { filters: [] },
  reject: Error | null = null
): SupabaseClient {
  const chain = {
    select: (cols: string) => {
      seen.select = cols;
      return chain;
    },
    eq: (col: string, val: unknown) => {
      seen.filters.push([col, val]);
      return chain;
    },
    then: (
      resolve: (v: { data: Row[] | null; error: unknown }) => void,
      rej?: (e: unknown) => void
    ) => (reject && rej ? rej(reject) : resolve({ data: rows, error })),
  };
  return {
    from: (table: string) => {
      seen.table = table;
      return chain;
    },
  } as unknown as SupabaseClient;
}

// ── Pure predicate ───────────────────────────────────────────────────

test("isTierAllowed is a plain membership check", () => {
  assert.equal(isTierAllowed(["auto", "budget", "standard"], "standard"), true);
  assert.equal(isTierAllowed(["auto", "budget", "standard"], "premium"), false);
  assert.equal(isTierAllowed(["auto", "budget", "standard"], "ultra"), false);
});

test("an empty allowed set refuses every tier, including auto (fail closed)", () => {
  assert.equal(isTierAllowed([], "auto"), false);
});

// ── PAYG allowed set resolution ──────────────────────────────────────

test("payg set is the union of the active payg rows, deduplicated", async () => {
  const seen: Seen = { filters: [] };
  const admin = stubAdmin(
    [
      { tier_access: ["auto", "budget", "standard"] },
      { tier_access: ["auto", "budget", "standard"] },
      { tier_access: ["standard", "auto"] },
    ],
    null,
    seen
  );
  const set = await getPaygTierAccess(admin);
  assert.deepEqual([...set].sort(), ["auto", "budget", "standard"]);
  // Reads the live rows, scoped to ACTIVE payg plans only.
  assert.equal(seen.table, "cloud_plans");
  assert.equal(seen.select, "tier_access");
  assert.deepEqual(
    seen.filters.sort(),
    [["active", true], ["plan_type", "payg"]].sort()
  );
});

test("a widened pack row widens the set (live rows, not a constant)", async () => {
  const admin = stubAdmin([
    { tier_access: ["auto", "budget", "standard"] },
    { tier_access: ["auto", "budget", "standard", "premium"] },
  ]);
  const set = await getPaygTierAccess(admin);
  assert.equal(isTierAllowed(set, "premium"), true);
  assert.equal(isTierAllowed(set, "ultra"), false);
});

test("a read error resolves to the empty set (refuse, never throw)", async () => {
  const set = await getPaygTierAccess(stubAdmin(null, { message: "boom" }));
  assert.deepEqual(set, []);
});

test("a query that throws (rejecting thenable) resolves to the empty set", async () => {
  const set = await getPaygTierAccess(
    stubAdmin(null, null, { filters: [] }, new Error("network down"))
  );
  assert.deepEqual(set, []);
});

test("no active payg rows resolves to the empty set", async () => {
  assert.deepEqual(await getPaygTierAccess(stubAdmin([])), []);
  assert.deepEqual(await getPaygTierAccess(stubAdmin(null)), []);
});

test("a null tier_access on one row does not poison the union", async () => {
  const admin = stubAdmin([
    { tier_access: null },
    { tier_access: ["auto", "budget"] },
  ]);
  assert.deepEqual([...(await getPaygTierAccess(admin))].sort(), ["auto", "budget"]);
});

// ── Source pins on the routes ────────────────────────────────────────
// The bug was that the gate lived ONLY inside `if (hasPlan)`. These pins
// read the route source so a refactor that quietly moves the plan-free
// branch back under hasPlan fails here.

test("proxy: the tier gate has a plan-free branch that uses the payg set", () => {
  assert.match(PROXY_ROUTE, /getPaygTierAccess\(admin\)/);
  // The gate is a single if/else on hasPlan ending in ONE shared refusal.
  const gate = PROXY_ROUTE.match(
    /if \(hasPlan\) \{[\s\S]*?\} else \{[\s\S]*?getPaygTierAccess\(admin\)[\s\S]*?\}[\s\S]*?if \(!isTierAllowed\(tierAccess, requestedTier\)\)/
  );
  assert.ok(gate, "expected if (hasPlan) {...} else { payg set } then one isTierAllowed refusal");
  // The refusal is still a 403 and precedes EVERY billing / provider side
  // effect (Codex round-1 fold: pinning only `const cost` let a refactor
  // hoist a reservation, deduction, cap check or provider call above the
  // gate unnoticed). Each side-effect identifier must exist in the route
  // and its FIRST occurrence must sit after the refusal.
  const refusalIdx = PROXY_ROUTE.indexOf("if (!isTierAllowed(tierAccess, requestedTier))");
  assert.ok(refusalIdx > 0, "refusal site present");
  const costIdx = PROXY_ROUTE.indexOf("const cost = tier.usage_multiplier;");
  assert.ok(costIdx > refusalIdx, "refusal must run before cost");
  assert.match(PROXY_ROUTE.slice(refusalIdx, costIdx), /\{ status: 403 \}/);
  for (const sideEffect of [
    "checkSpendingCap(",
    "reserveCloudRequest(",
    "finalizeCloudRequest(",
    "deductUsage(",
    "atomic_deduct",
    "routeToProvider(",
    "callDeepSeekDirect(",
    "selectB0Candidates(",
  ]) {
    const idx = PROXY_ROUTE.indexOf(sideEffect);
    assert.ok(idx > 0, `${sideEffect} present in the route`);
    assert.ok(idx > refusalIdx, `${sideEffect} must come after the tier refusal`);
  }
});

test("proxy: the subscription branch still reads the user's own plan row", () => {
  // hasPlan=true must be byte-identical in behaviour: it reads
  // cloud_plans by profile.plan, never the payg set.
  assert.match(
    PROXY_ROUTE,
    /if \(hasPlan\) \{\s*const \{ data: cloudPlan \} = await admin\s*\.from\("cloud_plans"\)\s*\.select\("tier_access"\)\s*\.eq\("id", profile\.plan!\)\s*\.single\(\);\s*tierAccess = cloudPlan\?\.tier_access \?\? \[\];/
  );
});

test("balance: plan-free users with credits report the payg set", () => {
  // The call must be the assignment to tierAccess inside the !hasPlan
  // spendable-credits guard, not merely present somewhere (Codex fold).
  assert.match(
    BALANCE_ROUTE,
    /if \(\s*!hasPlan &&\s*\(\(paygPacks\?\.length \?\? 0\) > 0 \|\| \(profile\.usage_balance \?\? 0\) > 0\)\s*\) \{\s*tierAccess = await getPaygTierAccess\(admin\);\s*\}/
  );
  // And tier_access in the response is that variable.
  assert.match(BALANCE_ROUTE, /tier_access: tierAccess,/);
});

// ── Seed pin ─────────────────────────────────────────────────────────

test("migration 007 seeds every payg pack with auto/budget/standard only", () => {
  for (const id of ["payg_200", "payg_600", "payg_1500"]) {
    const row = MIGRATION_007.split(/\r?\n/).find((l) => l.includes("('" + id + "',"));
    assert.ok(row, `seed row for ${id}`);
    assert.match(row!, /ARRAY\['auto','budget','standard'\]/);
  }
});
