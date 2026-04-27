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
