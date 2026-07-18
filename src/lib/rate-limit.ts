/**
 * In-memory token bucket rate limiter.
 * Tracks request timestamps per identifier (typically IP address).
 * Cleanup runs every 60 seconds and prunes timestamps older than each store's
 * own configured window, so it never evicts entries inside an active window.
 */

const stores = new Map<string, Map<string, number[]>>();
// Largest window (ms) seen per store, used by cleanup so a long window (for
// example the 1 hour newsletter limit) is not reset early by a fixed threshold.
const storeWindows = new Map<string, number>();

// Global cleanup interval: removes expired entries from all stores
let cleanupStarted = false;

function startCleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  // unref (when available) so the cleanup timer never holds the process
  // open: irrelevant on serverless, but required for the node:test runner
  // to exit after importing this module (B5 test hang fix).
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [name, store] of stores) {
      const windowMs = storeWindows.get(name) ?? 120_000;
      for (const [key, timestamps] of store) {
        const recent = timestamps.filter((t) => now - t < windowMs);
        if (recent.length === 0) {
          store.delete(key);
        } else {
          store.set(key, recent);
        }
      }
    }
  }, 60_000);
  if (typeof (timer as { unref?: () => void }).unref === "function") {
    (timer as unknown as { unref: () => void }).unref();
  }
}

function getStore(name: string): Map<string, number[]> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  startCleanup();
  return store;
}

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  storeName = "default"
): { success: boolean; remaining: number; retryAfter: number } {
  const store = getStore(storeName);
  storeWindows.set(storeName, Math.max(storeWindows.get(storeName) ?? 0, windowMs));
  const now = Date.now();
  const timestamps = store.get(identifier) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  recent.push(now);
  store.set(identifier, recent);

  if (recent.length > limit) {
    const oldestInWindow = recent[0];
    const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
    return { success: false, remaining: 0, retryAfter: Math.max(1, retryAfter) };
  }

  return { success: true, remaining: limit - recent.length, retryAfter: 0 };
}

/** Extract client IP from request headers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/** Preset rate limiters for common endpoint types. */
export const LIMITS = {
  waitlist:        { limit: 5,   windowMs: 60_000, store: "waitlist" },
  stripeCheckout:  { limit: 10,  windowMs: 60_000, store: "stripe-checkout" },
  stripePortal:    { limit: 10,  windowMs: 60_000, store: "stripe-portal" },
  stripeWebhook:   { limit: 100, windowMs: 60_000, store: "stripe-webhook" },
  licence:         { limit: 30,  windowMs: 60_000, store: "licence" },
  accountDelete:   { limit: 3,   windowMs: 60_000, store: "account-delete" },
  cloudDeduct:     { limit: 10,  windowMs: 60_000, store: "cloud-deduct" },
  cloudProxy:      { limit: 10,  windowMs: 60_000, store: "cloud-proxy" },
  voiceSession:    { limit: 10,  windowMs: 60_000, store: "voice-session" },
  spendingCap:     { limit: 5,   windowMs: 60_000, store: "spending-cap" },
  cloudAbuse:      { limit: 120, windowMs: 60_000, store: "cloud-abuse" },
  themeRedeem:     { limit: 5,   windowMs: 60_000, store: "theme-redeem" },
  newsletter:      { limit: 3,   windowMs: 3_600_000, store: "newsletter" },
  unsubscribe:     { limit: 10,  windowMs: 60_000, store: "unsubscribe" },
} as const;

// ── B5: shared per-user limiter (2026-07-18) ──────────────────────────
// The in-memory limiter above is per serverless instance, so its real cap
// is limit x warm instances. For the MONEY-relevant per-user cloud-proxy
// check, this shared variant counts in Postgres (migration 008) so the
// cap is global. Default OFF via the env kill switch; with the flag off,
// or on ANY rpc error/unexpected shape, it FAILS OPEN to the in-memory
// limiter with a loud log: the limiter is defence-in-depth (billing
// reservation holds are the money gate) and a database blip must never
// take chat down.

const SHARED_RATELIMIT_ENABLED =
  process.env.CLOUD_PROXY_SHARED_RATELIMIT_ENABLED === "true";

// Tiny non-cryptographic hash (djb2, hex) so truncated keys stay
// injective: two long identifiers sharing a 119-char prefix must not
// collide into one bucket (Codex review fold).
function shortHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

// Exported for tests: the shared-counter key namespace. Capped so a
// future call site with a longer identifier cannot grow unbounded rows
// (current identifiers are store constants + a verified UUID, ~60 chars);
// oversized keys keep a distinguishing hash suffix.
export function sharedRateLimitKey(store: string, identifier: string): string {
  const raw = `${store}:${identifier}`;
  if (raw.length <= 128) return raw;
  return `${raw.slice(0, 119)}_${shortHash(raw)}`;
}

function build429(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}

export async function checkRateLimitShared(
  request: Request,
  preset: keyof typeof LIMITS,
  identifier: string
): Promise<Response | null> {
  if (SHARED_RATELIMIT_ENABLED) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient() as unknown as {
        rpc: (
          fn: string,
          args: Record<string, unknown>
        ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
      };
      const { limit, windowMs, store } = LIMITS[preset];
      const { data, error } = await admin.rpc("rate_limit_hit", {
        p_key: sharedRateLimitKey(store, identifier),
        p_limit: limit,
        p_window_ms: windowMs,
      });
      if (!error && data && typeof data === "object") {
        const verdict = data as { allowed?: unknown; retry_after?: unknown };
        // Honour the RPC only on a FULLY well-formed verdict; any shape
        // surprise (including allowed:false with a mangled retry_after)
        // fails OPEN to the in-memory limiter instead of fabricating a
        // block (Codex review fold: strict fail-open contract).
        if (
          verdict.allowed === false &&
          typeof verdict.retry_after === "number" &&
          verdict.retry_after > 0
        ) {
          return build429(verdict.retry_after);
        }
        if (verdict.allowed === true) return null;
      }
      console.error(
        "[rate-limit] shared rpc failed or returned unexpected shape; failing open to in-memory:",
        error?.message ?? "unexpected_shape"
      );
    } catch (err) {
      console.error(
        "[rate-limit] shared limiter threw; failing open to in-memory:",
        err instanceof Error ? err.message : "unknown"
      );
    }
  }
  return checkRateLimit(request, preset, identifier);
}

/** Check rate limit and return 429 response if exceeded, or null if OK.
 *  Pass an explicit `identifier` (for example the verified user id after auth)
 *  to key the bucket on the user; omit to fall back to client IP. */
export function checkRateLimit(
  request: Request,
  preset: keyof typeof LIMITS,
  identifier?: string
): Response | null {
  const id = identifier ?? `ip:${getClientIp(request)}`;
  const { limit, windowMs, store } = LIMITS[preset];
  const result = rateLimit(id, limit, windowMs, store);
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": String(result.retryAfter) },
      }
    );
  }
  return null;
}
