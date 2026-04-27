import type { NextConfig } from "next";

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

// Phase 7B-2. Content-Security-Policy and Report-To MOVED OUT of this file.
// Both headers are now built per-request in `src/middleware.ts` (Edge
// runtime) so a fresh nonce can be embedded in `script-src`. A static
// next.config.ts header cannot inject per-request nonces, and 'strict-dynamic'
// requires per-request nonces to mean anything. The same middleware also
// forwards `x-nonce` on the request so Next.js auto-applies the nonce to
// streaming hydration scripts, framework bundles, and `<Script>` consumers.
//
// Theme-flash hash maintenance trap (still applies). The script-src
// directive in middleware.ts includes
//   'sha256-f7LAjRiK+uoAyu7rUwSbVvtnehpB2z0d+hr4fBMjsds='
// which covers the inline IIFE in `src/app/layout.tsx`. Any edit to that
// script — even whitespace — invalidates the hash. Regenerate with the
// command in middleware.ts (kept there because middleware now owns the
// constant) and update both files in lockstep.

const nextConfig: NextConfig = {
  // Phase 7A: stop leaking the framework name.
  poweredByHeader: false,
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
          // Phase 7B-2: CSP and Report-To intentionally NOT set here. See
          // src/middleware.ts. Static assets that bypass middleware do not
          // need CSP — they're not HTML and do not execute scripts.
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
