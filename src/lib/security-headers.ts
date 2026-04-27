/**
 * Phase 7A — defence-in-depth security headers for routes that build their
 * own response objects. Mirrors the four header values declared in
 * next.config.ts:headers() for source "/:path*" so a custom Response is
 * indistinguishable from a default one at the response layer.
 *
 * Append-only: existing CORS, Content-Type, Cache-Control, Retry-After, and
 * X-* application headers are never touched. Headers that are already set
 * (e.g. by next.config.ts inheritance) are left in place via the `if (!has)`
 * check, so we never duplicate or fight existing values.
 *
 * Status, body, and signature-verification paths are out of scope here.
 */

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
  "fullscreen=(self)",
  "picture-in-picture=(self)",
].join(", ");

const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", PERMISSIONS_POLICY],
];

/**
 * Append the four Phase 7A security headers to a Response, in place.
 * Returns the same Response so call sites can `return applySecurityHeaders(res)`.
 */
export function applySecurityHeaders<T extends Response>(response: T): T {
  for (const [key, value] of SECURITY_HEADERS) {
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }
  return response;
}
