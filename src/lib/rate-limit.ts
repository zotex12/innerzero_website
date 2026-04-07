/**
 * In-memory token bucket rate limiter.
 * Tracks request timestamps per identifier (typically IP address).
 * Automatic cleanup of expired entries every 60 seconds.
 */

const stores = new Map<string, Map<string, number[]>>();

// Global cleanup interval: removes expired entries from all stores
let cleanupStarted = false;

function startCleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [, store] of stores) {
      for (const [key, timestamps] of store) {
        const recent = timestamps.filter((t) => now - t < 120_000);
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
} as const;

/** Check rate limit and return 429 response if exceeded, or null if OK. */
export function checkRateLimit(
  request: Request,
  preset: keyof typeof LIMITS
): Response | null {
  const ip = getClientIp(request);
  const { limit, windowMs, store } = LIMITS[preset];
  const result = rateLimit(ip, limit, windowMs, store);
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
