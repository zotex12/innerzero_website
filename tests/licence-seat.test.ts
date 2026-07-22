// Contract tests for the atomic licence-seat activation (finding: seat
// over-allocation race). The count -> seat check -> insert used to be
// non-atomic, so concurrent activations with distinct fingerprints could each
// pass `devicesUsed < seats` and insert past the paid seat count.
//
// The behavioural guarantee (N parallel activations for a 1-seat licence ->
// only `seats` succeed) is proven LIVE against the database after migration
// 014 is applied. These static checks pin the invariants that make that
// guarantee hold, mirroring the cloud-voice route/migration contract tests.
//
// Run on demand from CLI:
//   npx tsx --test tests/licence-seat.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8");

const MIGRATION = read("supabase", "migrations", "014_licence_seat_atomic.sql");
const ROUTE = read("src", "app", "api", "licence", "validate", "route.ts");

test("migration serialises on the licences row lock", () => {
  assert.match(MIGRATION, /FROM public\.licences\s+WHERE licence_key = p_licence_key\s+FOR UPDATE/);
});

test("migration serialises the USER-scoped device pool (per-user advisory lock)", () => {
  // Seats are counted by user_id and a user can hold multiple licences, so the
  // licence-row lock alone is not enough; a per-user advisory lock closes the
  // cross-licence race.
  assert.match(MIGRATION, /pg_advisory_xact_lock\(hashtextextended\(v_lic\.user_id::text, 0\)\)/);
});

test("migration refuses a null-owner licence", () => {
  assert.match(MIGRATION, /v_lic\.user_id IS NULL[\s\S]*?'invalid_key'/);
});

test("migration seat-checks reactivation of an inactive device", () => {
  // The existing-device branch must run a seat check when the device was
  // inactive (reactivation consumes a seat).
  assert.match(MIGRATION, /IF NOT v_was_active THEN[\s\S]*?v_used >= v_lic\.seats[\s\S]*?'seat_limit'/);
});

test("audit-log insert is best-effort (fails open, does not roll back activation)", () => {
  // The licence_events insert sits in a sub-block that swallows failures, so an
  // audit-log outage cannot deny a valid activation (matches prior behaviour).
  assert.match(
    MIGRATION,
    /INSERT INTO public\.licence_events[\s\S]*?EXCEPTION WHEN OTHERS THEN[\s\S]*?NULL;[\s\S]*?END;/
  );
});

test("seat check + device insert both live inside the locked function", () => {
  // The seat check must appear before the devices insert, and both must be in
  // the same function body that holds the FOR UPDATE lock.
  const seatCheckIdx = MIGRATION.indexOf("v_used >= v_lic.seats");
  const insertIdx = MIGRATION.indexOf("INSERT INTO public.devices");
  assert.ok(seatCheckIdx > 0, "seat check present");
  assert.ok(insertIdx > seatCheckIdx, "device insert follows the seat check");
});

test("migration is hardened: SECURITY DEFINER, pinned search_path, service_role only", () => {
  assert.match(MIGRATION, /SECURITY DEFINER/);
  assert.match(MIGRATION, /SET search_path = ''/);
  assert.match(MIGRATION, /REVOKE ALL ON FUNCTION public\.validate_licence_device[\s\S]*FROM PUBLIC/);
  assert.match(MIGRATION, /REVOKE ALL ON FUNCTION public\.validate_licence_device[\s\S]*FROM anon/);
  assert.match(MIGRATION, /REVOKE ALL ON FUNCTION public\.validate_licence_device[\s\S]*FROM authenticated/);
  assert.match(MIGRATION, /GRANT EXECUTE ON FUNCTION public\.validate_licence_device[\s\S]*TO service_role/);
});

test("route delegates to the atomic RPC and passes the trusted IP", () => {
  assert.match(ROUTE, /rpc\(\s*"validate_licence_device"/);
  assert.match(ROUTE, /p_ip:\s*ip/);
  assert.match(ROUTE, /getClientIp/);
});

test("route preserves the prior HTTP status contract", () => {
  // Each verdict branch keeps its original status code.
  assert.match(ROUTE, /case "invalid_key":[\s\S]*?status: 401/);
  assert.match(ROUTE, /case "licence_inactive":[\s\S]*?status: 403/);
  assert.match(ROUTE, /case "licence_expired":[\s\S]*?status: 403/);
  assert.match(ROUTE, /case "seat_limit":[\s\S]*?status: 403/);
  assert.match(ROUTE, /case "ok":[\s\S]*?status: 200/);
});

test("route uses the durable shared limiter (finding 3 wiring)", () => {
  assert.match(ROUTE, /checkRateLimitShared\(\s*request,\s*"licence"/);
});
