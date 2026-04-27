import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { DEFAULT_METADATA } from "@/lib/metadata";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// Phase 7B-2. Reading the request headers() in the root layout is what
// opts the entire app into dynamic rendering — Next.js's nonce
// auto-propagation only applies during SSR, so static pages cannot carry
// the per-request nonce that the CSP middleware emits. The trade-off is
// SSG → Edge SSR for marketing pages; HTML edge-cache hits go away, asset
// cache is unaffected. Reading the nonce here also lets us pass it to the
// theme-flash inline script as a defence-in-depth path alongside the
// SHA-256 hash already in script-src.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                }
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
        {/* Feed discovery for RSS readers, aggregators, and LLM crawlers */}
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/feed.xml"
          title="InnerZero Blog"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/changelog.xml"
          title="InnerZero Changelog"
        />
        <link
          rel="alternate"
          type="application/feed+json"
          href="/api/feed"
          title="InnerZero Blog JSON"
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-sans antialiased transition-colors duration-200">
        <a
          href="#main-content"
          className="skip-to-content"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
