// Contract tests for the B5 cloud-shared-user-ratelimit phase: key
// namespace, and flag-off equivalence of checkRateLimitShared with the
// in-memory limiter (the env kill switch is unset under test, so the
// shared path must delegate without touching any database).
//
// Run on demand from CLI:
//   npx tsx --test tests/shared-rate-limit.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  sharedRateLimitKey,
  checkRateLimitShared,
  LIMITS,
} from "../src/lib/rate-limit";

test("shared key is namespaced by store then identifier", () => {
  assert.equal(
    sharedRateLimitKey("cloud-proxy", "user:abc"),
    "cloud-proxy:user:abc"
  );
});

test("flag off: shared check delegates to the in-memory limiter", async () => {
  assert.notEqual(
    process.env.CLOUD_PROXY_SHARED_RATELIMIT_ENABLED,
    "true",
    "test requires the kill switch unset"
  );
  const req = new Request("https://example.test/api/cloud/proxy", {
    method: "POST",
  });
  const id = `user:test-${process.pid}`;
  const { limit } = LIMITS.cloudProxy;

  // Under the limit: allowed.
  for (let i = 0; i < limit; i++) {
    const res = await checkRateLimitShared(req, "cloudProxy", id);
    assert.equal(res, null, `request ${i + 1} of ${limit} should pass`);
  }

  // Over the limit: the in-memory limiter answers 429 with Retry-After.
  const blocked = await checkRateLimitShared(req, "cloudProxy", id);
  assert.ok(blocked, "request over the limit should be blocked");
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get("Retry-After")) >= 1);
});

test("flag off: different identifiers do not share a bucket", async () => {
  const req = new Request("https://example.test/api/cloud/proxy", {
    method: "POST",
  });
  const res = await checkRateLimitShared(
    req, "cloudProxy", `user:other-${process.pid}`
  );
  assert.equal(res, null);
});
