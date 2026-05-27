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
  setInterval(() => {
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
  spendingCap:     { limit: 5,   windowMs: 60_000, store: "spending-cap" },
  cloudAbuse:      { limit: 120, windowMs: 60_000, store: "cloud-abuse" },
  themeRedeem:     { limit: 5,   windowMs: 60_000, store: "theme-redeem" },
  newsletter:      { limit: 3,   windowMs: 3_600_000, store: "newsletter" },
} as const;

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
