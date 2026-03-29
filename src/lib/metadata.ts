import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "InnerZero — Private AI Assistant That Runs on Your PC",
    template: "%s | InnerZero — Private AI Assistant",
  },
  description:
    "InnerZero is a private AI assistant that runs entirely on your PC. No cloud. No tracking. Your AI, your machine, your data.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: "InnerZero",
    title: "InnerZero — Private AI Assistant That Runs on Your PC",
    description:
      "InnerZero is a private AI assistant that runs entirely on your PC. No cloud. No tracking. Your AI, your machine, your data.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "InnerZero — Private AI Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InnerZero — Private AI Assistant That Runs on Your PC",
    description:
      "InnerZero is a private AI assistant that runs entirely on your PC. No cloud. No tracking. Your AI, your machine, your data.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function createMetadata(overrides: Metadata): Metadata {
  return {
    ...overrides,
    openGraph: {
      ...DEFAULT_METADATA.openGraph,
      ...overrides.openGraph,
    },
    twitter: {
      ...DEFAULT_METADATA.twitter,
      ...overrides.twitter,
    },
  };
}
