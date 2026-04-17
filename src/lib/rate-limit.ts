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

/**
 * Preferred rate-limit identifier.
 * If the request carries an Authorization: Bearer <jwt> header whose middle
 * segment decodes to JSON with a string `sub` claim, return "user:<sub>".
 * Otherwise fall back to "ip:<ip>". Signature is NOT verified here — Supabase
 * verifies later in auth-desktop. Any parse failure silently falls through.
 */
export function getRateLimitKey(request: Request): string {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const parts = token.split(".");
      if (parts.length === 3) {
        // Base64url → base64
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
        const payload = JSON.parse(
          Buffer.from(padded, "base64").toString("utf8")
        );
        if (payload && typeof payload.sub === "string" && payload.sub.length > 0) {
          return `user:${payload.sub}`;
        }
      }
    }
  } catch {
    // fall through to IP
  }
  return `ip:${getClientIp(request)}`;
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
  themeRedeem:     { limit: 5,   windowMs: 60_000, store: "theme-redeem" },
} as const;

/** Check rate limit and return 429 response if exceeded, or null if OK.
 *  Pass an explicit `identifier` to key the bucket on user_id (preferred for
 *  authenticated cloud routes via getRateLimitKey); omit to fall back to IP. */
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
