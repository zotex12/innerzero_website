import type { NextConfig } from "next";

// Resolved at build time. On preview deploys we allow the preview URL so
// browser testing works; production always uses the canonical domain.
// Desktop clients send no Origin header and are unaffected by CORS at the
// browser layer.
const CLOUD_API_ALLOW_ORIGIN =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://innerzero.com";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
