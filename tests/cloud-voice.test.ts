// Contract tests for the C1 server-managed-voice-proxy phase: locked
// decision-13 pricing pins, the ephemeral client-secret request shape,
// mint-error classification, the migration-011 access model, and the
// money-ordering invariants (secret only after a landed deduction, kill
// switch before any work).
//
// Run on demand from CLI:
//   npx tsx --test tests/cloud-voice.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildVoiceClientSecretRequest,
  classifyMintStatus,
  voiceMinuteRequestId,
  VOICE_EST_COST_PENCE_PER_MINUTE,
  VOICE_LEASE_WINDOW_SECONDS,
  VOICE_MAX_SESSION_MINUTES,
  VOICE_MAX_SESSIONS_PER_WINDOW,
  VOICE_MODEL_ID,
  VOICE_RENEW_EARLY_GRACE_SECONDS,
  VOICE_RENEW_INTERVAL_SECONDS,
  VOICE_STALE_SECONDS,
  VOICE_TOKEN_TTL_SECONDS,
  VOICE_UNITS_PER_MINUTE,
} from "../src/lib/cloud-voice";

const read = (...parts: string[]) =>
  readFileSync(join(process.cwd(), ...parts), "utf8");

const MIGRATION_011 = read(
  "supabase",
  "migrations",
  "011_managed_voice_sessions.sql"
);
const LIB_SOURCE = read("src", "lib", "cloud-voice.ts");
const SESSION_ROUTE = read(
  "src", "app", "api", "cloud", "voice", "session", "route.ts"
);
const RENEW_ROUTE = read(
  "src", "app", "api", "cloud", "voice", "renew", "route.ts"
);
const END_ROUTE = read(
  "src", "app", "api", "cloud", "voice", "end", "route.ts"
);
const ROUTES = [SESSION_ROUTE, RENEW_ROUTE, END_ROUTE];

// ── Locked decision 13: 15 units per started minute ───────────────────

test("voice rate and guards match locked decision 13", () => {
  assert.equal(VOICE_UNITS_PER_MINUTE, 15);
  assert.equal(VOICE_MAX_SESSION_MINUTES, 30);
  assert.equal(VOICE_RENEW_INTERVAL_SECONDS, 60);
  assert.equal(VOICE_MODEL_ID, "gpt-realtime-2.1-mini");
});

test("worst-case cost sits under the decision-13 rate-raise trigger", () => {
  // Decision 13: if the verified worst case moves above ~5.3p/min the
  // unit rate must rise. Prices were re-verified 2026-07-18 unchanged
  // ($10/$20 per 1M audio in/out), keeping the worst case ~4p.
  assert.ok(VOICE_EST_COST_PENCE_PER_MINUTE <= 5.3);
});

test("decision-10 floor holds on every plan at the worst case", () => {
  // Net revenue per unit after ~20 percent VAT and Stripe fees
  // (decision-13 figures): Starter 0.79p, Plus 0.63p, Pro 0.53p.
  const netPencePerUnit = { starter: 0.79, plus: 0.63, pro: 0.53 };
  for (const [plan, net] of Object.entries(netPencePerUnit)) {
    const revenuePerMinute = VOICE_UNITS_PER_MINUTE * net;
    const ratio = revenuePerMinute / VOICE_EST_COST_PENCE_PER_MINUTE;
    // Pro lands at 7.95p vs 4p worst case = 1.99x, recorded in the
    // locked decision as the 2.0x floor holding; pin at >= 1.98 so a
    // silent constant change that actually breaks the floor fails here.
    assert.ok(
      ratio >= 1.98,
      `${plan}: ${revenuePerMinute}p per minute is under the floor`
    );
  }
});

// ── Ephemeral client-secret request shape ─────────────────────────────

test("client secret TTL is short and inside the documented API range", () => {
  assert.equal(VOICE_TOKEN_TTL_SECONDS, 90);
  assert.ok(VOICE_TOKEN_TTL_SECONDS >= 10 && VOICE_TOKEN_TTL_SECONDS <= 7200);
  // The stale window must exceed the renewal cadence (a healthy session
  // renews every 60s) but stay tight enough that an abandoned session
  // frees the concurrency slot quickly.
  assert.ok(VOICE_STALE_SECONDS > VOICE_RENEW_INTERVAL_SECONDS);
  assert.ok(VOICE_STALE_SECONDS <= 300);
});

test("session config pins the model and disables tools", () => {
  const body = buildVoiceClientSecretRequest();
  assert.equal(body.expires_after.anchor, "created_at");
  assert.equal(body.expires_after.seconds, VOICE_TOKEN_TTL_SECONDS);
  assert.equal(body.session.type, "realtime");
  assert.equal(body.session.model, "gpt-realtime-2.1-mini");
  assert.deepEqual(body.session.output_modalities, ["audio"]);
  assert.deepEqual(body.session.tools, []);
});

// ── Mint-error classification (B0 failure-matrix mirror) ──────────────

test("401/403 classify as auth (our key, not an outage)", () => {
  assert.equal(classifyMintStatus(401), "auth");
  assert.equal(classifyMintStatus(403), "auth");
});

test("timeout-ish and server-side statuses classify as transient", () => {
  for (const s of [408, 429, 500, 502, 503]) {
    assert.equal(classifyMintStatus(s), "transient", `status ${s}`);
  }
});

test("other 4xx classify as request and never feed the circuit", () => {
  for (const s of [400, 404, 413, 422]) {
    assert.equal(classifyMintStatus(s), "request", `status ${s}`);
  }
  // The failure-response helper only reports non-request classes.
  assert.match(
    LIB_SOURCE,
    /providerErrorClass !== "request"[\s\S]{0,200}reportProviderFailure/
  );
});

// ── Per-minute billing request ids ────────────────────────────────────

test("voice minute request ids are unique per minute and fit request_id", () => {
  const sid = "3f9d2c1a-1111-4222-8333-444455556666";
  const m1 = voiceMinuteRequestId(sid, 1);
  const m2 = voiceMinuteRequestId(sid, 2);
  assert.notEqual(m1, m2);
  assert.equal(m1, `voice_${sid}_m1`);
  // usage_transactions request_id pattern budget (1-64 chars).
  assert.ok(voiceMinuteRequestId(sid, VOICE_MAX_SESSION_MINUTES).length <= 64);
});

// ── Money-ordering invariants (structural pins) ───────────────────────

test("the secret is minted before the deduction and withheld on failure", () => {
  const charge = LIB_SOURCE.slice(
    LIB_SOURCE.indexOf("export async function chargeVoiceMinute")
  );
  const mintAt = charge.indexOf("mintVoiceClientSecret()");
  const deductAt = charge.indexOf("deductVoiceMinute(");
  assert.ok(mintAt > 0 && deductAt > 0);
  assert.ok(mintAt < deductAt, "mint must run before the deduction");
  // A failed deduction ends the session and returns a non-ok outcome;
  // the secret value only escapes on the ok path.
  assert.match(charge, /if \(!deducted\.ok\) \{[\s\S]{0,1600}return \{ ok: false/);
  const okReturn = charge.indexOf("clientSecret: secret.value");
  assert.ok(okReturn > deductAt, "the secret is only released after deduction");
});

test("the secret value is never logged", () => {
  for (const src of [LIB_SOURCE, ...ROUTES]) {
    assert.doesNotMatch(src, /console\.[a-z]+\([^)]*secret\.value/);
    assert.doesNotMatch(src, /console\.[a-z]+\([^)]*clientSecret/);
  }
  // The structured log builder carries ids and counters only.
  assert.doesNotMatch(LIB_SOURCE, /client_secret:[\s\S]{0,80}console/);
});

test("every voice route checks the kill switch before any other work", () => {
  for (const src of ROUTES) {
    const flagAt = src.indexOf("CLOUD_VOICE_MANAGED_ENABLED");
    const disabledAt = src.indexOf("voice_managed_disabled");
    const authAt = src.indexOf("getDesktopUser(");
    assert.ok(flagAt > 0 && disabledAt > 0 && authAt > 0);
    assert.ok(disabledAt < authAt, "flag rejection must precede auth");
  }
});

test("billing reuses the existing atomic deduct paths, 15 units at 4p", () => {
  assert.match(LIB_SOURCE, /deductUsage\(\s*userId,\s*VOICE_UNITS_PER_MINUTE/);
  assert.match(LIB_SOURCE, /atomic_deduct_pack/);
  assert.match(LIB_SOURCE, /VOICE_EST_COST_PENCE_PER_MINUTE\b/);
  // No reservation integration (recorded packet deviation 2): voice has
  // no billable provider action before its deduction.
  assert.doesNotMatch(LIB_SOURCE, /reserveCloudRequest|cloud-reservations/);
});

// ── Migration 011 access model ────────────────────────────────────────

test("registry table is RLS-enabled deny-all with client grants revoked", () => {
  assert.match(
    MIGRATION_011,
    /alter table public\.cloud_voice_sessions enable row level security/
  );
  assert.match(
    MIGRATION_011,
    /revoke all on table public\.cloud_voice_sessions from anon, authenticated/
  );
  assert.doesNotMatch(MIGRATION_011, /create policy/i);
});

test("all three RPCs are hardened service-role-only SECURITY DEFINER", () => {
  for (const fn of [
    "voice_session_start",
    "voice_session_renew",
    "voice_session_end",
  ]) {
    const defAt = MIGRATION_011.indexOf(
      `create or replace function public.${fn}`
    );
    assert.ok(defAt > 0, `${fn} defined`);
    const block = MIGRATION_011.slice(defAt);
    assert.match(block, /security definer/, `${fn} security definer`);
    assert.match(block, /set search_path = ''/, `${fn} empty search_path`);
    const revoke = new RegExp(
      `revoke all on function public\\.${fn}\\([^)]*\\)\\s+from public, anon, authenticated`
    );
    const grant = new RegExp(
      `grant execute on function public\\.${fn}\\([^)]*\\)\\s+to service_role`
    );
    assert.match(MIGRATION_011, revoke, `${fn} revoked`);
    assert.match(MIGRATION_011, grant, `${fn} service-role only`);
  }
});

test("the registry stores lifecycle bookkeeping only, never content", () => {
  const tableAt = MIGRATION_011.indexOf("create table");
  const tableEnd = MIGRATION_011.indexOf(");", tableAt);
  const tableBlock = MIGRATION_011.slice(tableAt, tableEnd);
  for (const banned of ["transcript", "prompt", "message", "content"]) {
    assert.ok(
      !tableBlock.includes(banned),
      `table must not carry a ${banned} column`
    );
  }
  assert.match(tableBlock, /minutes_charged integer not null default 0/);
  assert.match(
    tableBlock,
    /check \(status in \('active', 'ended', 'expired'\)\)/
  );
});

test("start enforces one concurrent session and renew enforces the max", () => {
  assert.match(MIGRATION_011, /'concurrent_session'/);
  assert.match(MIGRATION_011, /'max_minutes'/);
  // ALL THREE lifecycle RPCs serialise behind the profile row lock
  // (uniform lock order with the atomic deduct RPCs; end included per
  // the Codex round-1 P2 fold, closing the end/renew interleave race).
  const locks = MIGRATION_011.match(
    /perform 1 from public\.profiles where id = p_user_id for update/g
  );
  assert.ok(
    (locks ?? []).length >= 3,
    "profile row lock in start, renew, AND end"
  );
  // Renew's counter advance is additionally conditioned on the row
  // still being active, with the row count checked.
  assert.match(
    MIGRATION_011,
    /and status = 'active';\s*get diagnostics v_updated = row_count/
  );
});

// ── Codex round-1 P1 folds: lease quota + renewal cadence ─────────────

test("session starts are quota-bound inside a rolling lease window", () => {
  // The window covers the provider's max realtime session lifetime
  // (60 minutes, no server-side kill) PLUS the maximum delayed
  // connection start a minted secret allows (TTL + skew = 210s) plus
  // margin, so at most 3 provider sessions can be alive concurrently
  // even when a client delays connecting until the secret's last
  // moment (Codex round-3 fold).
  assert.equal(VOICE_LEASE_WINDOW_SECONDS, 3900);
  assert.ok(
    VOICE_LEASE_WINDOW_SECONDS >= 3600 + VOICE_TOKEN_TTL_SECONDS + 120,
    "lease window must cover provider lifetime + max delayed start"
  );
  assert.equal(VOICE_MAX_SESSIONS_PER_WINDOW, 3);
  assert.match(MIGRATION_011, /'session_quota'/);
  // Ended/expired sessions still consume quota (a client-controlled
  // release cannot kill the provider connection); only never-released
  // 'aborted' rows are exempt.
  assert.match(
    MIGRATION_011,
    /status = 'active' or ended_reason is distinct from 'aborted'/
  );
  assert.match(SESSION_ROUTE, /voice_session_quota/);
});

test("renewals are cadence-gated server-side, anchored to started_at", () => {
  // Anchored boundaries (round-2 fold): minute N+1 is due at
  // started_at + N*60 minus a small one-time grace, so early renewals
  // cannot compound into extra charged minutes.
  assert.equal(VOICE_RENEW_EARLY_GRACE_SECONDS, 5);
  assert.ok(VOICE_RENEW_EARLY_GRACE_SECONDS < 15, "grace must stay one-time small");
  assert.match(MIGRATION_011, /'too_early'/);
  assert.match(MIGRATION_011, /minutes_charged >= 1/);
  assert.match(
    MIGRATION_011,
    /extract\(epoch from \(now\(\) - v_row\.started_at\)\)/
  );
  assert.match(
    MIGRATION_011,
    /\(v_row\.minutes_charged \* 60\)::numeric - p_early_grace_seconds/
  );
  // The too_early rejection happens BEFORE the counter advance, the
  // mint, and the deduction: no mint/deduct code precedes it in the lib
  // flow (renew RPC is the first call in chargeVoiceMinute).
  const charge = LIB_SOURCE.slice(
    LIB_SOURCE.indexOf("export async function chargeVoiceMinute")
  );
  const renewAt = charge.indexOf("renewVoiceSessionMinute(");
  const mintAt = charge.indexOf("mintVoiceClientSecret()");
  assert.ok(renewAt > 0 && mintAt > 0 && renewAt < mintAt);
  // Route surface: 429 with a Retry-After hint.
  assert.match(LIB_SOURCE, /renew_too_early/);
  assert.match(LIB_SOURCE, /"Retry-After"/);
});

test("minute-1 failures abort without consuming quota", () => {
  // The session route passes isStart=true; the lib maps every minute-1
  // failure to the 'aborted' end reason (no secret was ever released).
  assert.match(SESSION_ROUTE, /chargeVoiceMinute\(admin, userId, sessionId, true\)/);
  assert.match(LIB_SOURCE, /isStart \? "aborted"/);
});

test("mint validates expires_at bounds before any charge", () => {
  assert.match(LIB_SOURCE, /bad_expiry/);
  // Upper bound: never longer-lived than requested TTL plus skew.
  assert.match(
    LIB_SOURCE,
    /expiresAt > nowEpoch \+ VOICE_TOKEN_TTL_SECONDS \+ 120/
  );
  // Lower bound (round-2 fold): enough remaining lifetime to survive
  // deduction and delivery, not merely "in the future".
  assert.match(LIB_SOURCE, /expiresAt < nowEpoch \+ 30/);
});

test("PAYG deduction stops at the first ambiguous RPC error", () => {
  // A lost atomic_deduct_pack response may have landed; trying another
  // pack could charge twice for one minute (round-2 P1 fold). The
  // error branch must return deduct_error, never continue the loop.
  const packBranch = LIB_SOURCE.slice(
    LIB_SOURCE.indexOf('"atomic_deduct_pack"')
  );
  const errBlock = packBranch.slice(
    packBranch.indexOf("if (rpcError)"),
    packBranch.indexOf("if (remaining !== null)")
  );
  assert.match(errBlock, /cloud_voice_deduct_ambiguous/);
  assert.match(errBlock, /return \{ ok: false, reason: "deduct_error" \}/);
  assert.doesNotMatch(errBlock, /continue/);
});

test("an ambiguous renewal deduct keeps the session alive", () => {
  // Round-2 P2 fold: ending the session on an ambiguous (possibly
  // landed) charge would convert the ambiguity into a confirmed
  // customer loss. Only definite rejections end the session mid-call.
  const charge = LIB_SOURCE.slice(
    LIB_SOURCE.indexOf("export async function chargeVoiceMinute")
  );
  assert.match(charge, /deducted\.reason !== "deduct_error"/);
  assert.match(charge, /\} else if \(definite\) \{/);
});

test("end reasons are allow-listed in SQL and typed in TS", () => {
  assert.match(MIGRATION_011, /else 'other'/);
  for (const reason of [
    "'client_end'",
    "'credits_exhausted'",
    "'spending_cap_exceeded'",
    "'provider_error'",
    "'deduct_failed'",
    "'max_minutes'",
    "'stale'",
    "'aborted'",
  ]) {
    assert.ok(
      MIGRATION_011.includes(reason),
      `${reason} in the SQL allow-list`
    );
  }
  assert.match(LIB_SOURCE, /export type VoiceEndReason/);
});

// ── Copy rules ────────────────────────────────────────────────────────

test("no em dashes in customer-facing route strings", () => {
  for (const src of ROUTES) {
    for (const match of src.matchAll(/"([^"]*)"/g)) {
      assert.ok(
        !match[1].includes("—"),
        `em dash in string: ${match[1]}`
      );
    }
  }
});
