// Header matrix for getClientIp (finding: IP trust in the rate limiter).
// The client can set x-forwarded-for freely, so the derivation must prefer a
// platform-trusted signal and must never key on the leftmost XFF token.
//
// Run on demand from CLI:
//   npx tsx --test tests/get-client-ip.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";

import { getClientIp, clientIpRateLimitId } from "../src/lib/rate-limit";

function req(headers: Record<string, string>): Request {
  return new Request("https://innerzero.com/api/licence/validate", {
    method: "POST",
    headers,
  });
}

test("spoofed leftmost XFF is ignored when x-vercel-forwarded-for is present", () => {
  const ip = getClientIp(
    req({
      "x-forwarded-for": "1.2.3.4, 9.9.9.9",
      "x-vercel-forwarded-for": "203.0.113.7",
      "x-real-ip": "198.51.100.2",
    })
  );
  assert.equal(ip, "203.0.113.7", "must trust the Vercel edge header, not XFF");
});

test("x-real-ip wins over XFF when the Vercel header is absent", () => {
  const ip = getClientIp(
    req({
      "x-forwarded-for": "1.2.3.4, 9.9.9.9",
      "x-real-ip": "198.51.100.2",
    })
  );
  assert.equal(ip, "198.51.100.2");
});

test("XFF only: the RIGHTMOST (trusted-proxy) hop is used, never the leftmost", () => {
  const ip = getClientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8, 203.0.113.9" }));
  assert.equal(ip, "203.0.113.9");
  assert.notEqual(ip, "1.2.3.4", "the leftmost client-set token must not win");
});

test("single-value XFF returns that value", () => {
  assert.equal(getClientIp(req({ "x-forwarded-for": "203.0.113.9" })), "203.0.113.9");
});

test("no trusted headers: deterministic 'unknown' fallback", () => {
  assert.equal(getClientIp(req({})), "unknown");
});

test("empty / whitespace header values fall through to the next source", () => {
  // Empty vercel header must not shadow a real x-real-ip.
  assert.equal(
    getClientIp(req({ "x-vercel-forwarded-for": "   ", "x-real-ip": "198.51.100.2" })),
    "198.51.100.2"
  );
  // Whitespace-only XFF hops are filtered out.
  assert.equal(getClientIp(req({ "x-forwarded-for": " , , " })), "unknown");
});

test("Vercel header with an appended hop still takes its first (Vercel-authored) token", () => {
  assert.equal(
    getClientIp(req({ "x-vercel-forwarded-for": "203.0.113.7, 9.9.9.9" })),
    "203.0.113.7"
  );
});

test("clientIpRateLimitId pseudonymises the IP: never contains the raw address", () => {
  const raw = "203.0.113.7";
  const id = clientIpRateLimitId(req({ "x-vercel-forwarded-for": raw }));
  assert.match(id, /^ip:[0-9a-f]{24}$/, "ip:<hex digest> shape");
  assert.ok(!id.includes(raw), "the raw IP must not appear in the durable key");
});

test("clientIpRateLimitId is deterministic per IP and distinct across IPs", () => {
  const a1 = clientIpRateLimitId(req({ "x-vercel-forwarded-for": "203.0.113.7" }));
  const a2 = clientIpRateLimitId(req({ "x-vercel-forwarded-for": "203.0.113.7" }));
  const b = clientIpRateLimitId(req({ "x-vercel-forwarded-for": "198.51.100.2" }));
  assert.equal(a1, a2, "same IP -> same bucket");
  assert.notEqual(a1, b, "different IPs -> different buckets");
});
