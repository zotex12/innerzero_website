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
// fullscreen and picture-in-picture stay self-only — VideoEmbed's YouTube
// iframe is cross-origin so it would only receive these if explicitly
// delegated; current iframe `allow` attribute does not request fullscreen.
//
// Phase 7B-1: separator is comma-only, no OWS. Snyk's parser rejects the
// `, ` (comma-space) form even though Structured Fields permit OWS after a
// comma; the canonical-list form is `,` with no whitespace. Do not add any
// space character anywhere inside this list value.
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

// Phase 7B-1. Content-Security-Policy in Report-Only mode. Smoke-test for
// 24-48h, fix any real-resource violations, then Phase 7B-2 flips the
// header name to `Content-Security-Policy` (no -Report-Only) to enforce.
//
// THEME-FLASH HASH MAINTENANCE TRAP. The script-src directive includes a
// SHA-256 hash that covers the inline theme-flash script in
// `src/app/layout.tsx` (the `dangerouslySetInnerHTML` block at the top of
// <head>). The hash is computed from the byte content between the
// backticks of the template literal, so any edit to that script — even
// whitespace — invalidates it. Regenerate with:
//
//   node -e "const c=require('fs').readFileSync('src/app/layout.tsx','utf8'); \
//     const m=c.match(/__html:\\s*\`([\\s\\S]*?)\`/); \
//     const h=require('crypto').createHash('sha256').update(m[1]).digest('base64'); \
//     console.log('sha256-'+h)"
//
// Or use the Python equivalent during a Phase 7C+ rotation.
//
// Audit findings (justification for every host below):
// - challenges.cloudflare.com: Turnstile script + iframe + verify callbacks.
//   Used in Login, Register, ForgotPassword, ResetPassword, NewsletterSignup.
// - va.vercel-scripts.com: Vercel Analytics debug script. Production loads
//   `/_vercel/insights/script.js` same-origin, but the package conditionally
//   falls back to va.vercel-scripts.com on preview/debug builds and we need
//   that to not block during the smoke window.
// - chdsbjydwswtshjflkva.supabase.co: REST + Realtime (https + wss) for
//   the single Supabase project this site is bound to.
// - formspree.io: ContactForm POSTs via fetch (connect-src). Form `action`
//   is not used so form-action stays self.
// - www.youtube-nocookie.com: VideoEmbed lazy iframe (frame-src).
// - i.ytimg.com: VideoEmbed thumbnail (img-src). Covered by `https:` so no
//   explicit entry.
// - Stripe: redirect-only flow (PricingSection.tsx fetches /api/stripe/checkout
//   and does `window.location.href = session.url`). No @stripe/stripe-js,
//   no js.stripe.com, no embedded element. Top-level navigation is not gated
//   by CSP, so no Stripe directive is needed.
//
// `style-src 'unsafe-inline'` is a known accepted compromise — Tailwind v4
// emits style attributes for some utilities and several components use
// inline `style={...}` props (Hero.tsx, CloudUsageCard.tsx). Locking down
// styles via hash or nonce would require a refactor outside this phase. XSS
// via style is a much narrower vector than via script.
//
// `img-src https:` is intentional: marketing site has many image origins
// (YouTube thumbnails, blog images, social previews) and images cannot
// execute. CSP3 image-src wildcard is widely considered acceptable.
const THEME_SCRIPT_HASH = "'sha256-f7LAjRiK+uoAyu7rUwSbVvtnehpB2z0d+hr4fBMjsds='";

const SUPABASE_URL_RAW =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://chdsbjydwswtshjflkva.supabase.co";
const SUPABASE_HOST = SUPABASE_URL_RAW.replace(/^https?:\/\//, "").replace(/\/$/, "");

const CSP_DIRECTIVES = [
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

// Report-To header value. Group name `csp-endpoint` is referenced from the
// CSP `report-to` directive. max_age=10800 (3 hours) so browsers do not
// cache this endpoint past the smoke window.
const REPORT_TO = JSON.stringify({
  group: "csp-endpoint",
  max_age: 10800,
  endpoints: [{ url: "/api/csp-report" }],
});

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
          // Phase 7B-1. Report-only mode — observe without blocking. Phase
          // 7B-2 will flip the header name to `Content-Security-Policy`.
          {
            key: "Content-Security-Policy-Report-Only",
            value: CSP_DIRECTIVES,
          },
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
