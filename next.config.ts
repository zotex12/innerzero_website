import type { NextConfig } from "next";
import { buildStaticCsp, REPORT_TO } from "./src/lib/csp";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

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

// Phase ai-slug-redirects. A Google Search Console page pull over the full
// 16-month range (requested 2025-06-21 to 2026-10-23, pulled 2026-10-23;
// GSC data lags a few days) showed impressions on /blog URLs that never
// existed, most likely from AI answers or AI-written pages that cite
// invented slugs (a post's title slugified, a near-miss slug, or a doubled
// path).
// Each source below returned 404 on the live site before this phase, so it
// now 308s to the post it was meant to point at.
//
// Mapping rules, applied in order (each row's comment names its rule):
//   A  slugified title: the source is the hyphenated slug of the post's
//      title, or a prefix of it. The title is quoted with the commit it was
//      read at, because posts can be retitled later.
//   B  near slug: the source and the real slug differ by at most 2
//      hyphen-separated tokens, and that slug is the unique nearest of all
//      published slugs.
//   C  doubled path: /blog/<junk>/<real-slug>, the last segment is a real
//      slug.
//   D  topical: the GSC queries for the exact URL and the post content both
//      point to one post. Missing or split evidence means the URL stays 404
//      (left 404 on purpose: /blog/local-ai-hardware-budget-economics, no
//      query data and four posts fit on content alone).
//
// Invariants:
//   - The www host rule stays first in redirects(); these rows come last.
//   - Relative /blog/ destinations only, no has/missing, no patterns (no
//     :param, * or regex), so each row matches one path. Next compares it
//     case-insensitively, and a trailing slash is stripped first by Next's
//     own 308, so those variants reach the row too.
//   - No redirects for garbage URLs (/$, /&, base64 nonce strings), per the
//     gsc-indexing-remediation pre-audit; 404 is the right answer for those.
//   - A published post always wins. Redirects run before the filesystem, so
//     a row whose source later becomes a real post (the blog cron publishes
//     unattended) would hide it. aiInventedBlogRedirects() drops such a row,
//     and any row whose destination is not a published post, at build time.
//
// Maintenance: if a build prints "[ai-slug-redirects] dropped ...", delete
// that row. Keep one row per line; validation scripts parse them.
interface AiInventedBlogRedirect {
  source: `/blog/${string}`;
  destination: `/blog/${string}`;
}

const AI_INVENTED_BLOG_REDIRECTS: readonly AiInventedBlogRedirect[] = [
  { source: "/blog/best-ai-windows-2026", destination: "/blog/best-free-ai-windows-2026" }, // B: drops "free"
  { source: "/blog/best-local-private-voice-ai-assistant-for-pc-in-2026", destination: "/blog/best-local-private-voice-ai-assistant-2026" }, // A: title "Best Local Private Voice AI Assistant for PC in 2026: Ollama, LM Studio, Jan, Whisper, Piper Compared" @ed0b751
  { source: "/blog/best-local-private-voice-ai-assistant-for-pc-in-2026-ollama-lm-studio-jan", destination: "/blog/best-local-private-voice-ai-assistant-2026" }, // A: title "Best Local Private Voice AI Assistant for PC in 2026: Ollama, LM Studio, Jan, Whisper, Piper Compared" @ed0b751
  { source: "/blog/best-local-private-voice-assistant-2026", destination: "/blog/best-local-private-voice-ai-assistant-2026" }, // B: drops "ai"
  { source: "/blog/best-local-voice-ai-assistant-2026", destination: "/blog/best-local-private-voice-ai-assistant-2026" }, // B: drops "private"
  { source: "/blog/how-much-vram-do-you-need-for-local-ai", destination: "/blog/how-much-vram-for-local-ai" }, // A: title "How Much VRAM Do You Need for Local AI? A 2026 Guide" @ed0b751
  { source: "/blog/innerzero-blog/how-much-vram-for-local-ai", destination: "/blog/how-much-vram-for-local-ai" }, // C: doubled path
  { source: "/blog/vram-requirements-for-local-ai", destination: "/blog/how-much-vram-for-local-ai" }, // D: only query "vram for ai models"; the post covers VRAM requirements by model size
  { source: "/blog/self-hosted-ai-assistant-works-apps-compared", destination: "/blog/self-hosted-ai-assistant-works-across-apps-compared" }, // B: drops "across"
  { source: "/blog/innerzero.com/blog/self-hosted-ai-chatbot-zanus-ai-option", destination: "/blog/self-hosted-ai-chatbot-zanus-ai-option" }, // C: doubled path (impressions likely rank-tracker noise)
];

// Published post slugs are the .mdx filename stems in src/content/blog
// (every post pins its frontmatter slug to its filename), read the way
// src/lib/blog.ts reads them. This does not parse frontmatter, so a post
// whose frontmatter slug differs from its filename is not seen here.
// Sources are compared lowercased because Next matches custom route sources
// case-insensitively. Drops rows, never throws: if the directory is missing
// or cannot be read, every row is dropped with a warning (the safe outcome),
// so an unattended auto-publish deploy cannot fail here.
function aiInventedBlogRedirects() {
  const blogDir = path.join(process.cwd(), "src/content/blog");
  let stems: string[] = [];
  try {
    if (existsSync(blogDir)) {
      stems = readdirSync(blogDir)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => file.slice(0, -".mdx".length));
    }
  } catch (err) {
    console.warn(
      `[ai-slug-redirects] could not read ${blogDir}: ${String(err)}`,
    );
  }
  const published = new Set(stems);
  const publishedLower = new Set(stems.map((stem) => stem.toLowerCase()));
  return AI_INVENTED_BLOG_REDIRECTS.filter(({ source, destination }) => {
    if (publishedLower.has(source.slice("/blog/".length).toLowerCase())) {
      console.warn(
        `[ai-slug-redirects] dropped ${source}: a published post owns this slug`,
      );
      return false;
    }
    if (!published.has(destination.slice("/blog/".length))) {
      console.warn(
        `[ai-slug-redirects] dropped ${source}: destination ${destination} is not a published post`,
      );
      return false;
    }
    return true;
  }).map(({ source, destination }) => ({
    source,
    destination,
    permanent: true,
  }));
}

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
      ...aiInventedBlogRedirects(),
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
      // Phase gsc-feed-noindex-headers. Google Search Console listed the
      // RSS feeds, the JSON Feed and a /_next/static font file under
      // "Crawled - currently not indexed". Those are machine resources with
      // no place in a search index, so tell crawlers so explicitly. Feed
      // readers ignore X-Robots-Tag; route handlers inherit next.config
      // headers (WEBCLAUDE architecture note, Phase 7A), so the feed route
      // files need no change. /api/feed 308s to /feed.json and picks the
      // header up there. llms.txt and favicon.ico are deliberately NOT in
      // this list: AI crawlers read llms.txt and some treat noindex as a
      // do-not-use signal, and Google requires favicons to stay crawlable.
      ...["/feed.xml", "/changelog.xml", "/feed.json", "/_next/static/:path*"].map(
        (source) => ({
          source,
          headers: [{ key: "X-Robots-Tag", value: "noindex" }],
        }),
      ),
    ];
  },
};

export default nextConfig;
