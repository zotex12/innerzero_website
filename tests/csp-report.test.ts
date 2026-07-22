// Behavioural tests for the hardened /api/csp-report sink (finding: the
// endpoint was open, unthrottled, unbounded, and logged the full attacker
// body). Verifies: oversized body -> 413, flood -> 429, valid -> 204, and the
// logged line is truncated.
//
// Each test uses a DISTINCT client IP (x-vercel-forwarded-for) so the
// per-IP rate-limit buckets do not collide across tests in this file.
//
// Run on demand from CLI:
//   npx tsx --test tests/csp-report.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";

import { POST } from "../src/app/api/csp-report/route";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_LOG_CHARS = 2048;

function report(body: unknown, ip: string, contentType = "application/csp-report"): Request {
  return new Request("https://innerzero.com/api/csp-report", {
    method: "POST",
    headers: {
      "content-type": contentType,
      "x-vercel-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("oversized string body is rejected with 413", async () => {
  // A body comfortably over the 16KB cap. Rejected by the byte/stream cap
  // regardless of whether the runtime attached a Content-Length header.
  const huge = { "csp-report": { "blocked-uri": "x".repeat(MAX_BODY_BYTES + 5000) } };
  const res = await POST(report(huge, "203.0.113.10"));
  assert.equal(res.status, 413);
});

test("oversized chunked body with NO content-length is capped mid-stream (413)", async () => {
  // A streamed body has no Content-Length, so the declared-length guard cannot
  // fire; the streaming reader must abort once accumulated bytes exceed the cap.
  const chunk = new Uint8Array(4096).fill(120); // 'x'
  let sent = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= MAX_BODY_BYTES + 8192) {
        controller.close();
        return;
      }
      controller.enqueue(chunk);
      sent += chunk.byteLength;
    },
  });
  const req = new Request("https://innerzero.com/api/csp-report", {
    method: "POST",
    headers: {
      "content-type": "application/csp-report",
      "x-vercel-forwarded-for": "203.0.113.20",
    },
    body: stream,
    // @ts-expect-error duplex is required for a streaming request body in undici
    duplex: "half",
  });
  const res = await POST(req);
  assert.equal(res.status, 413);
});

test("valid small report returns 204", async () => {
  const res = await POST(
    report({ "csp-report": { "violated-directive": "script-src", "blocked-uri": "inline" } }, "203.0.113.11")
  );
  assert.equal(res.status, 204);
});

test("flood from one IP is throttled to 429", async () => {
  const ip = "203.0.113.12";
  // cspReport preset is 30/min. Drive 30 accepted hits, then expect 429.
  let last = 0;
  for (let i = 0; i < 30; i++) {
    const res = await POST(report({ "csp-report": { n: i } }, ip));
    last = res.status;
    assert.notEqual(last, 429, `request ${i + 1} should be accepted, not throttled`);
  }
  const blocked = await POST(report({ "csp-report": { n: 99 } }, ip));
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get("Retry-After")) >= 1);
});

test("logged payload is truncated to the cap", async () => {
  const ip = "203.0.113.13";
  // Payload large enough that the serialised log line exceeds MAX_LOG_CHARS,
  // but the whole body stays under MAX_BODY_BYTES so it is accepted (204).
  const big = { "csp-report": { "blocked-uri": "y".repeat(4000) } };

  const original = console.log;
  const lines: string[] = [];
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    // Sampling logs ~1 in 5; among 5 consecutive accepted reports at least
    // one is logged regardless of the module counter's starting offset.
    for (let i = 0; i < 5; i++) {
      const res = await POST(report(big, ip));
      assert.equal(res.status, 204);
    }
  } finally {
    console.log = original;
  }

  const cspLines = lines.filter((l) => l.includes("csp_report"));
  assert.ok(cspLines.length >= 1, "at least one report should have been logged");
  for (const line of cspLines) {
    assert.ok(
      line.endsWith("...[truncated]"),
      "a large report's log line must be truncated"
    );
    assert.ok(
      line.length <= MAX_LOG_CHARS + "...[truncated]".length,
      "truncated line must not exceed the cap plus the marker"
    );
  }
});
