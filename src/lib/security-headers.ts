/**
 * Phase 7A — defence-in-depth security headers for routes that build their
 * own response objects. Mirrors the next.config.ts:headers() values for
 * source "/:path*" so a custom Response is indistinguishable from a default
 * one at the response layer.
 *
 * Phase 7B-2: CSP and Report-To REMOVED from this helper. CSP carries a
 * per-request nonce and is now owned exclusively by `src/middleware.ts`;
 * an append-only static helper cannot inject per-request nonces and must
 * not ship a nonceless CSP that would override the middleware-issued one.
 * The five static headers below remain — they are per-host, not per-request,
 * and are safe to duplicate from a static helper.
 *
 * Append-only: existing CORS, Content-Type, Cache-Control, Retry-After, and
 * X-* application headers are never touched. Headers that are already set
 * (e.g. by next.config.ts inheritance) are left in place via the `if (!has)`
 * check, so we never duplicate or fight existing values.
 *
 * Status, body, and signature-verification paths are out of scope here.
 *
 * MAINTENANCE: any change to PERMISSIONS_POLICY or HSTS here MUST be
 * mirrored in next.config.ts (and vice versa). The two values are
 * intentionally duplicated rather than imported because next.config.ts runs
 * in the Node config phase while this file runs inside route handlers —
 * keeping them as plain string constants in each place avoids cross-runtime
 * import gotchas.
 */

// Phase 7B-1: comma-only separator. No OWS anywhere in the value. See
// next.config.ts for the rationale (Snyk parser rejects `, ` form).
//
// Phase 7B-2: PiP/fullscreen expand to allow delegation to the
// youtube-nocookie iframe — see next.config.ts for the diagnosis.
const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "usb=()",
  "bluetooth=()",
  "serial=()",
  "hid=()",
  "midi=()",
  "accelerometer=()",
  "gyroscope=()",
  "magnetometer=()",
  "ambient-light-sensor=()",
  "payment=()",
  "autoplay=()",
  "clipboard-read=()",
  "clipboard-write=()",
  "display-capture=()",
  "encrypted-media=()",
  "web-share=()",
  "screen-wake-lock=()",
  "idle-detection=()",
  "interest-cohort=()",
  "browsing-topics=()",
  "attribution-reporting=()",
  "run-ad-auction=()",
  "join-ad-interest-group=()",
  'fullscreen=(self "https://www.youtube-nocookie.com")',
  'picture-in-picture=(self "https://www.youtube-nocookie.com")',
].join(",");

const HSTS_VALUE = "max-age=63072000; includeSubDomains; preload";

const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", PERMISSIONS_POLICY],
  ["Strict-Transport-Security", HSTS_VALUE],
];

/**
 * Append the Phase 7A security headers (plus HSTS) to a Response, in place.
 * Returns the same Response so call sites can `return applySecurityHeaders(res)`.
 *
 * Phase 7B-2: this helper no longer touches CSP or Report-To. Those are
 * middleware-only because the nonce in script-src must rotate per request.
 */
export function applySecurityHeaders<T extends Response>(response: T): T {
  for (const [key, value] of SECURITY_HEADERS) {
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }
  return response;
}
