import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Phase 7B-2. Per-request nonce-based Content-Security-Policy in enforce
// mode. Replaces the static `Content-Security-Policy-Report-Only` header
// that lived in next.config.ts during Phase 7B-1. Composes with the Phase 2
// Supabase auth flow (existing updateSession) — both run on the same
// request because Next.js allows only one middleware function per app.
//
// Architecture:
//   1. Generate a 128-bit cryptographically random nonce per request (Web
//      Crypto, Edge-runtime safe; Node's `crypto` module is not available
//      in Edge).
//   2. Build the CSP string with `'self' 'nonce-X' 'strict-dynamic'
//      <theme-hash>` in script-src. With 'strict-dynamic' present, CSP3
//      browsers IGNORE host-source allowlists in script-src and trust only
//      nonce/hash-tagged scripts plus their propagated chain. The host
//      allowlists previously used by Phase 7B-1 (challenges.cloudflare.com,
//      va.vercel-scripts.com) are dropped from script-src for this reason.
//      They remain in connect-src and frame-src, which 'strict-dynamic'
//      does NOT affect.
//   3. Set `x-nonce` AND the CSP value on the FORWARDED request headers.
//      Next.js App Router reads both of these at SSR time and applies the
//      nonce attribute to:
//        - framework scripts (React runtime, Next.js loader)
//        - page-specific JS bundles
//        - streaming hydration <script> tags (the per-page
//          `self.__next_f.push(...)` chunks that gated Phase 7B-1)
//        - any <Script> component rendered with the nonce prop
//      Confirmed for Next.js 16.2.1 against the Vercel docs at
//      `/vercel/next.js`. Auto-propagation is the current contract; if a
//      future Next.js major changes it, the smoke test on /login will fail
//      first because Turnstile relies on the propagated trust chain.
//   4. Set the CSP and Report-To headers on the response sent to the
//      browser, so it actually enforces.
//   5. The five static headers (X-Content-Type-Options, X-Frame-Options,
//      Referrer-Policy, Permissions-Policy, Strict-Transport-Security)
//      continue to come from next.config.ts:headers() applied to '/(.*)'.
//      They reach static asset responses too — middleware does not.
//
// THEME-FLASH HASH MAINTENANCE TRAP. The script-src includes
//   'sha256-f7LAjRiK+uoAyu7rUwSbVvtnehpB2z0d+hr4fBMjsds='
// which covers the inline IIFE in `src/app/layout.tsx`. The hash is
// computed from the byte content between the backticks of the template
// literal in the `dangerouslySetInnerHTML` block. Any edit to that script —
// even whitespace — invalidates the hash. The hash exists as defence in
// depth: in a CSP3 browser the inline script will load via the auto-applied
// nonce and the hash is unused; on a hypothetical browser without nonce
// support, the hash is the fallback. Regenerate (Edge-safe — Node's crypto
// is for offline use only) with:
//
//   node -e "const c=require('fs').readFileSync('src/app/layout.tsx','utf8'); \
//     const m=c.match(/__html:\\s*\`([\\s\\S]*?)\`/); \
//     const h=require('crypto').createHash('sha256').update(m[1]).digest('base64'); \
//     console.log('sha256-'+h)"
//
// SCOPE: API routes (/api/*) run this middleware so the auth flow can
// touch their session. CSP is suppressed for /api/* — those routes return
// JSON, not HTML, and a script-src directive is meaningless there.

// Phase CSP-split. Routes that handle credentials or user-specific data keep
// the strong per-request nonce CSP and stay dynamically rendered. All other
// (public, content) routes use a static, nonce-less CSP so Next.js can
// prerender them at build time and the CDN can serve cached HTML without
// invoking a render function per request. This is the documented Next.js
// trade-off: nonces require dynamic rendering and disable static/CDN caching
// (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
// "Static vs Dynamic Rendering with CSP"). Public content pages reflect no
// user input, so 'unsafe-inline' on those pages is an acceptable posture; the
// nonce posture is preserved where it matters (auth + account).
//
// Path prefixes that KEEP the nonce CSP and force dynamic rendering. Kept in
// sync with the (auth) and (account) route groups, which set
// `export const dynamic = "force-dynamic"` so the nonce can be injected at
// SSR time. Matching is exact-or-segment-prefixed so "/accountant" never
// matches "/account".
const NONCE_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/account",
  "/auth",
];

function isNonceRoute(pathname: string): boolean {
  return NONCE_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

const THEME_SCRIPT_HASH = "'sha256-f7LAjRiK+uoAyu7rUwSbVvtnehpB2z0d+hr4fBMjsds='";

const SUPABASE_URL_RAW =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://chdsbjydwswtshjflkva.supabase.co";
const SUPABASE_HOST = SUPABASE_URL_RAW.replace(/^https?:\/\//, "").replace(/\/$/, "");

const REPORT_TO = JSON.stringify({
  group: "csp-endpoint",
  max_age: 10800,
  endpoints: [{ url: "/api/csp-report" }],
});

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

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
// no longer carries the nonce prop after the layout stopped reading headers()).
function buildCsp(nonce: string): string {
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
// and CDN-cached. va.vercel-scripts.com is allowed explicitly because, without
// 'strict-dynamic', host allowlists in script-src apply again and the Vercel
// Analytics / Speed Insights script must be permitted.
function buildStaticCsp(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    ...COMMON_DIRECTIVES,
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  if (isApiRoute) {
    // API routes still need the auth flow but do not need CSP. Skip nonce
    // generation entirely — saves the random-bytes + base64 work on every
    // /api/* request, which dominates the matched traffic for the cloud
    // proxy and licence endpoints.
    return await updateSession(request);
  }

  // Public content routes: static, nonce-less CSP so the page can be
  // prerendered and CDN-cached. No nonce work, no forwarded request headers,
  // so the downstream render is not pushed into dynamic mode by middleware.
  if (!isNonceRoute(request.nextUrl.pathname)) {
    const response = await updateSession(request);
    response.headers.set("Content-Security-Policy", buildStaticCsp());
    response.headers.set("Report-To", REPORT_TO);
    return response;
  }

  // Credential/account routes: per-request nonce CSP. These route groups pin
  // themselves to dynamic rendering (force-dynamic) so Next.js injects the
  // nonce at SSR time.
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  // Forward x-nonce and the CSP value on the request so Next.js auto-
  // propagates the nonce to streaming hydration scripts and framework
  // bundles. The CSP value on the request is what Next.js parses to
  // extract the nonce — this is the contract Vercel documents for App
  // Router CSP integration.
  const extraRequestHeaders = new Headers();
  extraRequestHeaders.set("x-nonce", nonce);
  extraRequestHeaders.set("Content-Security-Policy", csp);

  const response = await updateSession(request, extraRequestHeaders);

  // Set CSP and Report-To on the outbound response so the browser
  // enforces. The five static headers (X-Frame-Options etc.) continue to
  // come from next.config.ts:headers() — middleware does not touch them.
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Report-To", REPORT_TO);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation files)
     * - favicon.ico, robots.txt, sitemap files, og images, banner image,
     *   /public/images/*
     * - llms.txt, llms-full.txt (AI-discovery feeds)
     * - feed.xml, changelog.xml, feed.json (feed routes — they are SSG'd
     *   XML/JSON and do not need session cookies or CSP)
     *
     * Static assets that bypass middleware:
     *   - keep CDN cache hits (no edge-function invocation per request)
     *   - still receive the five static headers from next.config.ts
     *     headers() because that array applies to '/(.*)'
     *   - do NOT receive CSP — they are not HTML and do not execute
     */
    "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap.*\\.xml|og-.*\\.png|banner\\.png|images/|llms.*\\.txt|feed\\.xml|feed\\.json|changelog\\.xml).*)",
  ],
};
