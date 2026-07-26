import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { buildNonceCsp, REPORT_TO } from "@/lib/csp";

// Phase 7B-2. Per-request nonce-based Content-Security-Policy in enforce
// mode. Composes with the Phase 2 Supabase auth flow (existing updateSession)
// — both run on the same request because Next.js allows only one middleware
// function per app.
//
// Phase CSP-split. Routes that handle credentials or user-specific data keep
// the strong per-request nonce CSP and stay dynamically rendered ((auth) and
// (account) route groups set `export const dynamic = "force-dynamic"` so the
// nonce can be injected at SSR time). All other (public, content) routes use a
// static, nonce-less CSP so Next.js can prerender them at build time and the
// CDN can serve cached HTML without invoking a render function per request.
// This is the documented Next.js trade-off: nonces require dynamic rendering
// and disable static/CDN caching (see
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
// "Static vs Dynamic Rendering with CSP"). Public content pages reflect no
// user input, so 'unsafe-inline' on those pages is an acceptable posture; the
// nonce posture is preserved where it matters (auth + account).
//
// Phase middleware-matcher-fluid-cpu. CSP-split stopped public pages RENDERING
// per request, but middleware still RAN in front of the CDN cache on every
// page request (every visitor, every bot, every RSC `.segments` prefetch) just
// to run updateSession and attach the static CSP header. On Vercel, middleware
// runs before the cache and each invocation bills Fluid Active CPU; that made
// this function the dominant consumer of the account's 4h/month Hobby
// allowance while the API traffic it exists for was negligible. Split resolved:
//
//   - The static CSP + Report-To for public routes now ship from
//     next.config.ts headers() (see the negative-lookahead source there),
//     applied at the routing layer with zero function invocation.
//   - The matcher below is now POSITIVE: middleware runs ONLY on /api/* (auth
//     session refresh) and the nonce routes (per-request CSP + session). A
//     request to any other path never invokes this function.
//   - Session-refresh consequence, accepted deliberately: a logged-in user
//     browsing only public pages no longer gets a server-side token refresh
//     on those requests. The header's auth state comes from the browser
//     Supabase client (self-refreshing), and every route that actually READS
//     the session server-side (/account, /login, /auth/*, /api/*) still runs
//     updateSession here. A user whose refresh token expired mid-browse is
//     redirected to /login on their next /account visit, exactly as if they
//     had arrived cold.
//
// The nonce flow itself is unchanged from Phase 7B-2:
//   1. Generate a 128-bit cryptographically random nonce per request (Web
//      Crypto, Edge-runtime safe).
//   2. Build the CSP with `'self' 'nonce-X' 'strict-dynamic' <theme-hash>` in
//      script-src (builder shared via src/lib/csp.ts). With 'strict-dynamic',
//      CSP3 browsers ignore host allowlists in script-src and trust only
//      nonce/hash-tagged scripts plus their propagated chain (Turnstile on
//      /login relies on that propagation).
//   3. Set `x-nonce` AND the CSP value on the FORWARDED request headers so
//      Next.js applies the nonce to framework scripts, page bundles, and
//      streaming hydration scripts at SSR time.
//   4. Set the CSP and Report-To headers on the response so the browser
//      enforces.
//   5. The six static headers (X-Content-Type-Options, X-Frame-Options,
//      Referrer-Policy, Permissions-Policy, Strict-Transport-Security,
//      Cross-Origin-Opener-Policy) continue to come from
//      next.config.ts:headers() applied to '/:path*'.
//
// THEME-FLASH HASH: THEME_SCRIPT_HASH moved to src/lib/csp.ts with the CSP
// builders. The maintenance trap (regenerate on ANY edit to the layout inline
// script) is documented there.
//
// SCOPE: API routes (/api/*) run this middleware so the auth flow can touch
// their session. CSP is suppressed for /api/* — those routes return JSON, not
// HTML, and a script-src directive is meaningless there.

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    // API routes still need the auth flow but do not need CSP. Skip nonce
    // generation entirely — saves the random-bytes + base64 work on every
    // /api/* request, which dominates the matched traffic for the cloud
    // proxy and licence endpoints.
    return await updateSession(request);
  }

  // Credential/account routes: per-request nonce CSP. Everything the matcher
  // sends here that is not /api/* is a nonce route by construction — keep the
  // matcher below and NONCE_ROUTE_PREFIXES-style additions in lockstep with
  // the exclusion list in next.config.ts headers() so no route ever gets two
  // CSP headers (the browser would enforce the intersection and break
  // Turnstile's strict-dynamic trust chain) or zero.
  const nonce = generateNonce();
  const csp = buildNonceCsp(nonce);

  const extraRequestHeaders = new Headers();
  extraRequestHeaders.set("x-nonce", nonce);
  extraRequestHeaders.set("Content-Security-Policy", csp);

  const response = await updateSession(request, extraRequestHeaders);

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Report-To", REPORT_TO);

  return response;
}

export const config = {
  matcher: [
    /*
     * POSITIVE matcher (Phase middleware-matcher-fluid-cpu). Middleware runs
     * ONLY on:
     *   - /api/*                    auth session refresh, no CSP
     *   - the nonce-CSP routes      /login, /register, /forgot-password,
     *                               /reset-password, /account, /auth
     *
     * `/x/:path*` matches both the bare segment `/x` and every subpath.
     * Public/marketing/blog traffic, static assets, feeds, sitemaps, and RSC
     * `.segments` prefetches never invoke this function; their CSP comes from
     * next.config.ts headers(). If you add a new route that reads the Supabase
     * session server-side or needs the nonce CSP, add it HERE and remove it
     * from the exclusion lookahead in next.config.ts in the same commit.
     */
    "/api/:path*",
    "/login/:path*",
    "/register/:path*",
    "/forgot-password/:path*",
    "/reset-password/:path*",
    "/account/:path*",
    "/auth/:path*",
  ],
};
