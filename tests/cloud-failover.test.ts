// Contract tests for the B0 managed-model-collapse-v4flash-direct phase:
// failure classification, the direct DeepSeek request body, v4-flash cost
// rows, circuit-breaker candidate selection, the fallback decision matrix,
// and incident email copy rules.
//
// Pure-logic shape checks in this repo's established style (no network,
// no Supabase). Run on demand from CLI:
//   npx tsx --test tests/cloud-failover.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  classifyProviderHttpStatus,
  buildDeepSeekDirectBody,
  ProviderUnavailableError,
  PROVIDER_COSTS,
  estimateCostPence,
} from "../src/lib/cloud-providers";
import {
  B0_PRIMARY,
  B0_FALLBACK,
  selectB0Candidates,
  b0FailureAction,
  buildIncidentEmail,
} from "../src/lib/cloud-failover";

// ── Failure classification (Codex correction c) ───────────────────────

test("auth statuses classify as auth", () => {
  assert.equal(classifyProviderHttpStatus(401), "auth");
  assert.equal(classifyProviderHttpStatus(403), "auth");
});

test("429 is transient (provider-side pressure, retry-safe elsewhere)", () => {
  assert.equal(classifyProviderHttpStatus(429), "transient");
});

test("malformed/content 4xx classify as request and never fall back", () => {
  for (const status of [400, 404, 413, 422]) {
    assert.equal(classifyProviderHttpStatus(status), "request");
  }
});

test("5xx and unknown classify as transient", () => {
  for (const status of [500, 502, 503, 504]) {
    assert.equal(classifyProviderHttpStatus(status), "transient");
  }
});

test("ProviderUnavailableError defaults to transient for legacy callers", () => {
  const err = new ProviderUnavailableError("deepseek", "timeout");
  assert.equal(err.errorClass, "transient");
});

test("reasonCode strips the provider error body (correction d)", () => {
  const err = new ProviderUnavailableError(
    "deepseek",
    '502: {"error":{"message":"upstream body that must never be stored"}}',
    "transient"
  );
  assert.equal(err.reasonCode, "502");
  assert.equal(new ProviderUnavailableError("deepseek", "timeout").reasonCode, "timeout");
  assert.equal(
    new ProviderUnavailableError("deepseek", "connection_error").reasonCode,
    "connection_error"
  );
});

// ── Direct DeepSeek request body (decisions 6, 9; correction b) ───────

test("direct body pins deepseek-v4-flash with thinking disabled", () => {
  const body = buildDeepSeekDirectBody(
    [{ role: "user", content: "hello" }],
    "system here"
  );
  assert.equal(body.model, "deepseek-v4-flash");
  assert.deepEqual(body.thinking, { type: "disabled" });
  assert.equal(body.max_tokens, 2048);
  const messages = body.messages as { role: string; content: string }[];
  assert.equal(messages[0].role, "system");
  assert.equal(messages[0].content, "system here");
  assert.equal(messages[1].role, "user");
});

test("direct body omits system message when no system prompt", () => {
  const body = buildDeepSeekDirectBody([{ role: "user", content: "hi" }]);
  const messages = body.messages as { role: string; content: string }[];
  assert.equal(messages.length, 1);
  assert.equal(messages[0].role, "user");
});

// ── Cost table (decision 10 inputs; official prices re-verified 2026-08-16) ──

test("deepseek-v4-flash cost rows present at official prices", () => {
  const rates = PROVIDER_COSTS["deepseek-v4-flash"];
  assert.ok(rates, "deepseek-v4-flash missing from PROVIDER_COSTS");
  // DeepSeek's V4 peak/off-peak schedule took effect 2026-08-16 16:00 UTC.
  // The single-row table carries the PEAK rate ($0.44/1M in, $1.32/1M out;
  // off-peak is half) at the file's 0.79 GBP convention, rounded up, so the
  // spend caps and plan cost ceilings can only over-protect off-peak, never
  // under-protect peak. The retired 2026-07-17 rates were $0.14/$0.28.
  assert.equal(rates.input_per_1k, 0.0348);
  assert.equal(rates.output_per_1k, 0.1043);
});

test("v4-flash estimate uses its own rows, not the opus fallback", () => {
  const pence = estimateCostPence("deepseek-v4-flash", 1000, 1000);
  assert.ok(Math.abs(pence - (0.0348 + 0.1043)) < 1e-9);
});

test("legacy deepseek-chat rows still present for the flag-off path", () => {
  assert.ok(PROVIDER_COSTS["deepseek-chat"]);
  assert.ok(PROVIDER_COSTS["gemini-2.5-flash-lite"]);
});

// ── Server-owned routing pair (decisions 6, 11) ───────────────────────

test("primary is direct deepseek v4-flash, fallback is gemini flash-lite", () => {
  assert.deepEqual(B0_PRIMARY, {
    provider: "deepseek",
    modelId: "deepseek-v4-flash",
  });
  assert.deepEqual(B0_FALLBACK, {
    provider: "google",
    modelId: "gemini-2.5-flash-lite",
  });
});

// ── Candidate selection matrix ────────────────────────────────────────

test("closed circuit with fallback enabled: primary then fallback", () => {
  const sel = selectB0Candidates("closed", true);
  assert.deepEqual(sel.candidates, [B0_PRIMARY, B0_FALLBACK]);
  assert.equal(sel.probe, false);
});

test("closed circuit with fallback disabled: primary only", () => {
  const sel = selectB0Candidates("closed", false);
  assert.deepEqual(sel.candidates, [B0_PRIMARY]);
});

test("probe keeps the primary first and flags the probe", () => {
  const sel = selectB0Candidates("probe", true);
  assert.deepEqual(sel.candidates, [B0_PRIMARY, B0_FALLBACK]);
  assert.equal(sel.probe, true);
});

test("open circuit with fallback enabled routes straight to gemini", () => {
  const sel = selectB0Candidates("open", true);
  assert.deepEqual(sel.candidates, [B0_FALLBACK]);
  assert.equal(sel.probe, false);
});

test("open circuit with fallback disabled yields no candidates (fast-fail)", () => {
  const sel = selectB0Candidates("open", false);
  assert.deepEqual(sel.candidates, []);
});

// ── Failure decision matrix (correction c: never resend request 4xx) ──

test("request-class primary failure never falls back", () => {
  assert.equal(b0FailureAction("request", "deepseek", true), "stop");
});

test("transient and auth primary failures fall back when a leg exists", () => {
  assert.equal(b0FailureAction("transient", "deepseek", true), "fallback");
  assert.equal(b0FailureAction("auth", "deepseek", true), "fallback");
});

test("primary failure without a next candidate stops", () => {
  assert.equal(b0FailureAction("transient", "deepseek", false), "stop");
});

test("fallback provider failure always stops (no third leg, ever)", () => {
  assert.equal(b0FailureAction("transient", "google", true), "stop");
  assert.equal(b0FailureAction("request", "google", false), "stop");
});

// ── Incident email copy (decision 11 alert state machine) ─────────────

test("incident emails exist for open, summary, and recovered", () => {
  for (const kind of ["open", "summary", "recovered"] as const) {
    const mail = buildIncidentEmail(kind, "deepseek", "502: upstream error");
    assert.ok(mail.subject.length > 0);
    assert.ok(mail.html.length > 0);
    assert.ok(mail.subject.includes("InnerZero Cloud"));
  }
});

test("incident email copy contains no em or en dashes", () => {
  for (const kind of ["open", "summary", "recovered"] as const) {
    const mail = buildIncidentEmail(kind, "deepseek", "timeout");
    assert.ok(!mail.subject.includes("—"), "em dash in subject");
    assert.ok(!mail.html.includes("—"), "em dash in html");
    assert.ok(!mail.subject.includes("–"), "en dash in subject");
    assert.ok(!mail.html.includes("–"), "en dash in html");
  }
});

test("incident email detail is truncated, never unbounded", () => {
  const long = "x".repeat(5000);
  const mail = buildIncidentEmail("open", "deepseek", long);
  assert.ok(mail.html.length < 1500);
});
