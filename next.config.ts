import type { NextConfig } from "next";
import { buildStaticCsp, REPORT_TO } from "./src/lib/csp";

// Resolved at build time. On preview deploys we allow the preview URL so
// browser testing works; production always uses the canonical domain.
// Desktop clients send no Origin header and are unaffected by CORS at the
// browser layer.
const CLOUD_API_ALLOW_ORIGIN =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://innerzero.com";

// Phase 7A. Empty allowlist `()` blocks the directive; `(self)` allows the
// parent origin only. Unsupported directives are ignored by older browsers,
// so listing emerging ones (interest-cohort, browsing-topics, etc.) is safe.
// Stripe Checkout is redirect-based (not embedded), so payment=() is correct.
//
// Phase 7B-1: separator is comma-only, no OWS. Snyk's parser rejects the
// `, ` (comma-space) form even though Structured Fields permit OWS after a
// comma; the canonical-list form is `,` with no whitespace. Do not add any
// space character anywhere inside this list value (between directives).
//
// Phase 7B-2: PiP/fullscreen regression fix. Phase 7A's `(self)` allowlist
// only delegates to same-origin documents. The VideoEmbed iframe loads
// `https://www.youtube-nocookie.com/embed/...` cross-origin and asks for
// `picture-in-picture` and `fullscreen` (via `allowFullScreen`) in its
// `allow=` attribute. With `(self)` only, the parent permission did not
// reach the iframe and the YouTube player JS reported "picture-in-picture
// is not allowed in this document" in the Phase 7B-1 smoke test. Expanded
// to `(self "https://www.youtube-nocookie.com")` so the cross-origin iframe
// inherits the capability. Inner-allowlist items separate by single space
// per W3C Permissions Policy spec; the outer separator is still `,` with
// no whitespace per the Snyk/RFC8941 fix above.
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

// Phase middleware-matcher-fluid-cpu. CSP ownership is now SPLIT:
//
//   - Public content routes get the STATIC CSP + Report-To from headers()
//     below (source with a negative lookahead excluding /api and the nonce
//     routes). Applied at the routing layer, so serving a cached public page
//     no longer invokes middleware — that per-request invocation was the
//     dominant consumer of the Vercel Hobby Fluid Active CPU allowance.
//   - Auth/account routes get the per-request NONCE CSP from
//     src/middleware.ts, whose matcher is now positive (/api/* + the nonce
//     routes only).
//
// The two policies share every common directive via src/lib/csp.ts (imported
// RELATIVELY here — tsconfig path aliases do not apply to next.config.ts).
// The exclusion list in the CSP source below and the middleware matcher MUST
// stay in lockstep: a route matched by both would get two CSP headers and the
// browser enforces the intersection (breaks Turnstile on auth pages); a route
// matched by neither ships without CSP.
//
// Theme-flash hash maintenance trap: THEME_SCRIPT_HASH lives in src/lib/csp.ts
// with the CSP builders. Any edit to the layout inline script — even
// whitespace — invalidates the hash. Regenerate with the command documented
// there and update both in lockstep.

// Path prefixes excluded from the static CSP because middleware owns them
// (nonce CSP) or they are non-HTML API responses (no CSP). `(?:/|$)` bounds
// each prefix at a segment boundary so e.g. a future /accountant page still
// gets the static CSP.
const STATIC_CSP_EXCLUDED_PREFIXES = [
  "api",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "account",
  "auth",
].join("|");

const nextConfig: NextConfig = {
  // Phase 7A: stop leaking the framework name.
  poweredByHeader: false,
  // Canonical host. The www variant 308s to the apex so the two hosts do
  // not serve duplicate content. Production only: preview deploys run on
  // their own *.vercel.app host and never match www.innerzero.com.
  async redirects() {
    return [
      {
        // Exclude /api/* so API clients and webhooks that might use the
        // www host are never 308-redirected (some clients do not follow
        // redirects on POST). Page routes still canonicalise to the apex.
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "www.innerzero.com" }],
        destination: "https://innerzero.com/:path",
        permanent: true,
      },
      {
        // The pre-launch waitlist page was removed in the security-hardening
        // phase (e12e952) with no redirect, so the URL 404ed while Google
        // still had it indexed (GSC "Not found" report, last crawled
        // 2026-08-02). Send it to /download, the page that superseded it.
        source: "/waitlist",
        destination: "/download",
        permanent: true,
      },
      {
        // The JSON Feed moved off the robots-blocked /api/* namespace to a
        // clean top-level /feed.json (consistent with /feed.xml and
        // /changelog.xml), which cleared the Google Search Console
        // "Indexed, though blocked by robots.txt" warning. This 308 keeps
        // existing feed-reader subscribers on the old /api/feed URL working
        // and lets Googlebot (re-allowed for this one path in robots.txt)
        // follow the redirect and drop the stale blocked-but-indexed entry.
        source: "/api/feed",
        destination: "/feed.json",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
          // Phase 7A: canonicalise HSTS in next.config.ts. Vercel platform
          // currently emits max-age=63072000 (no includeSubDomains, no
          // preload) by default for the custom domain; this overrides it
          // with the preload-eligible value. Submission to hstspreload.org
          // is deferred to a later phase; the directive is the precondition,
          // not the submission.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Phase 7C: Cross-Origin-Opener-Policy. `same-origin` strips the
          // window.opener relationship for any cross-origin window opened
          // from this site (and refuses to expose this site's window
          // handle to a cross-origin opener). Defence-in-depth against
          // tabnabbing-style attacks. The site has no popup-based flows
          // that need cross-origin window communication: Stripe Checkout
          // is a top-level redirect, Turnstile runs in an iframe, and
          // Supabase auth is redirect-based. Static value, no per-request
          // computation needed, so it lives here next to the other static
          // headers rather than in middleware.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        // Phase middleware-matcher-fluid-cpu: static CSP + Report-To for every
        // route middleware no longer touches. The lookahead mirrors the
        // positive middleware matcher — keep the two in lockstep (see the
        // comment block at the top of this file). Matching static assets and
        // feeds too is harmless and deliberate: CSP is inert on non-HTML
        // responses, and one broad source avoids a second drift-prone list.
        source: `/:path((?!(?:${STATIC_CSP_EXCLUDED_PREFIXES})(?:/|$)).*)`,
        headers: [
          { key: "Content-Security-Policy", value: buildStaticCsp() },
          { key: "Report-To", value: REPORT_TO },
        ],
      },
      {
        source: "/api/cloud/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: CLOUD_API_ALLOW_ORIGIN,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "POST, GET, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
