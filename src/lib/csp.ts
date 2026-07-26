// Phase middleware-matcher-fluid-cpu. Single source of truth for the two
// Content-Security-Policy variants, shared by:
//
//   - src/middleware.ts       -> buildNonceCsp() for auth/account routes
//                                (per-request nonce + 'strict-dynamic')
//   - next.config.ts          -> buildStaticCsp() for public content routes
//                                (static header, CDN-cacheable, no middleware
//                                invocation per request)
//
// Before this phase both variants lived in middleware.ts and middleware ran on
// every page request just to attach the static variant, which billed a Fluid
// Active CPU invocation for every public page view, bot hit, and RSC segment
// prefetch. The static variant now ships from next.config.ts headers() so the
// middleware matcher can exclude public routes entirely. Keeping every shared
// directive in COMMON_DIRECTIVES prevents the two policies drifting apart —
// only script-src differs between them.
//
// This module must stay Edge-runtime safe (string constants and template
// literals only, no Node APIs) because middleware imports it. next.config.ts
// imports it by relative path — tsconfig path aliases do not apply there.

// THEME-FLASH HASH MAINTENANCE TRAP. Covers the inline IIFE in
// `src/app/layout.tsx`. The hash is computed from the byte content between the
// backticks of the template literal in the `dangerouslySetInnerHTML` block.
// Any edit to that script — even whitespace — invalidates the hash. Regenerate
// (offline, Node) with:
//
//   node -e "const c=require('fs').readFileSync('src/app/layout.tsx','utf8'); \
//     const m=c.match(/__html:\s*\`([\s\S]*?)\`/); \
//     const h=require('crypto').createHash('sha256').update(m[1]).digest('base64'); \
//     console.log('sha256-'+h)"
export const THEME_SCRIPT_HASH =
  "'sha256-f7LAjRiK+uoAyu7rUwSbVvtnehpB2z0d+hr4fBMjsds='";

const SUPABASE_URL_RAW =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://chdsbjydwswtshjflkva.supabase.co";
const SUPABASE_HOST = SUPABASE_URL_RAW.replace(/^https?:\/\//, "").replace(
  /\/$/,
  "",
);

export const REPORT_TO = JSON.stringify({
  group: "csp-endpoint",
  max_age: 10800,
  endpoints: [{ url: "/api/csp-report" }],
});

// Directives shared by both CSP variants. Only script-src differs between the
// nonce (dynamic) and static (cached) builders, so everything else lives here
// to prevent the two policies drifting apart.
const COMMON_DIRECTIVES = [
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
];

// Strong CSP for credential/account routes. Per-request nonce + 'strict-dynamic'
// means CSP3 browsers trust only nonce/hash-tagged scripts and their propagated
// chain. The theme-flash inline script is authorised by THEME_SCRIPT_HASH (it
// does not carry the nonce prop; the layout deliberately never reads headers()).
export function buildNonceCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${THEME_SCRIPT_HASH}`,
    ...COMMON_DIRECTIVES,
  ].join("; ");
}

// Static CSP for public content routes (marketing, blog, /for, /models, etc.).
// No nonce and no 'strict-dynamic', so 'unsafe-inline' actually takes effect
// (a nonce or hash in the same directive would make CSP3 browsers ignore
// 'unsafe-inline'). This is what lets these routes be statically prerendered
// and CDN-cached with the header attached at the routing layer, without any
// middleware invocation. va.vercel-scripts.com is allowed explicitly because,
// without 'strict-dynamic', host allowlists in script-src apply again and the
// Vercel Analytics / Speed Insights script must be permitted.
export function buildStaticCsp(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    ...COMMON_DIRECTIVES,
  ].join("; ");
}
