/**
 * Phase 7A — defence-in-depth security headers for routes that build their
 * own response objects. Mirrors the next.config.ts:headers() values for
 * source "/:path*" so a custom Response is indistinguishable from a default
 * one at the response layer.
 *
 * Phase 7B-1 additions: Content-Security-Policy-Report-Only and Report-To.
 * Same justification — must match the next.config.ts values byte-for-byte
 * so the report endpoint groups violations consistently regardless of which
 * code path emitted the response.
 *
 * Append-only: existing CORS, Content-Type, Cache-Control, Retry-After, and
 * X-* application headers are never touched. Headers that are already set
 * (e.g. by next.config.ts inheritance) are left in place via the `if (!has)`
 * check, so we never duplicate or fight existing values.
 *
 * Status, body, and signature-verification paths are out of scope here.
 *
 * MAINTENANCE: any change to PERMISSIONS_POLICY, the CSP directive set, or
 * the theme-script hash here MUST be mirrored in next.config.ts (and vice
 * versa). The two values are intentionally duplicated rather than imported
 * because next.config.ts runs in the Node config phase while this file runs
 * inside route handlers — keeping them as plain string constants in each
 * place avoids cross-runtime import gotchas.
 */

// Phase 7B-1: comma-only separator. No OWS anywhere in the value. See
// next.config.ts for the rationale (Snyk parser rejects `, ` form).
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
].join(",");

// Phase 7B-1. Mirror of next.config.ts. Theme-script hash covers the inline
// script in src/app/layout.tsx. See next.config.ts for the regen command.
const THEME_SCRIPT_HASH = "'sha256-f7LAjRiK+uoAyu7rUwSbVvtnehpB2z0d+hr4fBMjsds='";

const SUPABASE_URL_RAW =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://chdsbjydwswtshjflkva.supabase.co";
const SUPABASE_HOST = SUPABASE_URL_RAW.replace(/^https?:\/\//, "").replace(/\/$/, "");

const CSP_REPORT_ONLY = [
  "default-src 'self'",
  `script-src 'self' ${THEME_SCRIPT_HASH} https://challenges.cloudflare.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://challenges.cloudflare.com https://formspree.io https://va.vercel-scripts.com`,
  "frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
  "report-uri /api/csp-report",
  "report-to csp-endpoint",
].join("; ");

const REPORT_TO = JSON.stringify({
  group: "csp-endpoint",
  max_age: 10800,
  endpoints: [{ url: "/api/csp-report" }],
});

const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", PERMISSIONS_POLICY],
  ["Content-Security-Policy-Report-Only", CSP_REPORT_ONLY],
  ["Report-To", REPORT_TO],
];

/**
 * Append the Phase 7A + 7B-1 security headers to a Response, in place.
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
