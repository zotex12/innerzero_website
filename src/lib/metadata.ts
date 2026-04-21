import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";

// Site-wide URL convention: NO trailing slash anywhere, including root.
//   - Root resolves to `${SITE_URL}` bare (e.g. https://innerzero.com)
//   - Sub-paths resolve to `${SITE_URL}/<path>` with no trailing slash
//   - Host is always `innerzero.com`; the www variant 308s back to apex
//
// Why no slash on root: Next.js 14+ auto-strips the trailing slash from
// `<link rel="canonical">` and `<meta property="og:url">` for the root
// URL, regardless of how we configure `alternates.canonical` or
// `metadataBase`. This is framework-level normalisation we cannot
// override cleanly (even async `generateMetadata` workarounds stopped
// working on Next 15.5.6+, per Vercel-answered discussion #65323;
// tracked issue #54070). We're on Next 16.2.1 — stripping is in effect.
// JSON-LD / llms.txt / any raw string must match what Next emits, so
// everything converges on the no-slash form. Google treats both forms
// as equivalent for canonical purposes; internal consistency is what
// matters, and this helper is the single source of truth.
export function absoluteUrl(path: string): string {
  if (!path || path === "/") return SITE_URL;
  const withLead = path.startsWith("/") ? path : `/${path}`;
  const trimmed =
    withLead.length > 1 && withLead.endsWith("/")
      ? withLead.slice(0, -1)
      : withLead;
  return `${SITE_URL}${trimmed}`;
}

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "InnerZero: Private AI Assistant That Runs on Your PC",
    template: "%s | InnerZero: Private AI Assistant",
  },
  description:
    "InnerZero is a free private AI assistant that runs entirely on your PC. No cloud. No tracking. Your AI, your machine, your data.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: "InnerZero",
    title: "InnerZero: Private AI Assistant That Runs on Your PC",
    description:
      "InnerZero is a private AI assistant that runs entirely on your PC. No cloud. No tracking. Your AI, your machine, your data.",
    images: [
      {
        url: `${SITE_URL}/banner.png`,
        width: 1536,
        height: 1024,
        alt: "InnerZero: Private AI Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InnerZero: Private AI Assistant That Runs on Your PC",
    description:
      "InnerZero is a private AI assistant that runs entirely on your PC. No cloud. No tracking. Your AI, your machine, your data.",
    images: [`${SITE_URL}/banner.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Optional `path` is a convenience that fills in alternates.canonical
// (as a relative path) and openGraph.url (absolute via absoluteUrl).
// Precedence is explicit caller > path-derived > undefined — i.e. if
// the caller passes `alternates.canonical` or `openGraph.url`, their
// value always wins over whatever `path` would have produced. This
// keeps existing callers unchanged while giving new callers a single
// field to keep the two URL representations in lockstep.
export function createMetadata(
  overrides: Metadata & { path?: string },
): Metadata {
  const { path, ...rest } = overrides;

  const canonicalFromPath = path;
  const ogUrlFromPath = path ? absoluteUrl(path) : undefined;

  const hasAlternates = canonicalFromPath || rest.alternates;

  return {
    ...rest,
    ...(hasAlternates
      ? {
          alternates: {
            ...(canonicalFromPath ? { canonical: canonicalFromPath } : {}),
            ...rest.alternates,
          },
        }
      : {}),
    openGraph: {
      ...DEFAULT_METADATA.openGraph,
      ...(ogUrlFromPath ? { url: ogUrlFromPath } : {}),
      ...rest.openGraph,
    },
    twitter: {
      ...DEFAULT_METADATA.twitter,
      ...rest.twitter,
    },
  };
}
