import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";

// Site-wide URL convention:
//   - Root "/" resolves to `${SITE_URL}/` (with trailing slash)
//   - All other paths resolve to `${SITE_URL}/<path>` (no trailing slash)
//   - Host is always `innerzero.com`; the www variant 308s back to apex
// Rationale: matches what Next.js emits natively with `trailingSlash: false`
// and what the www→non-www redirect lands on. Unifying URL emission
// around this convention stops Google choosing its own canonical when
// openGraph / JSON-LD / alternates drift against each other.
export function absoluteUrl(path: string): string {
  if (!path || path === "/") return `${SITE_URL}/`;
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
