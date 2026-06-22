import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

// Phase CSP-split. The root layout deliberately does NOT read headers() any
// more. Reading the per-request nonce here previously forced the ENTIRE app
// into dynamic rendering (Next.js applies nonces only during SSR), which
// disabled static generation and CDN caching for every public page and drove
// up Fluid Active CPU. The theme-flash inline script below no longer carries a
// nonce; it is authorised by its SHA-256 hash in the middleware nonce CSP
// (auth/account routes) and by 'unsafe-inline' in the static CSP (public
// routes). Keeping this layout free of dynamic APIs lets marketing/blog pages
// prerender. Auth and account route groups opt back into dynamic rendering
// locally via `export const dynamic = "force-dynamic"` so their nonce still
// injects. See src/middleware.ts for the per-route CSP split.
//
// THEME-SCRIPT HASH TRAP: the inline script below is covered by
// 'sha256-f7LAjRiK+uoAyu7rUwSbVvtnehpB2z0d+hr4fBMjsds=' in src/middleware.ts.
// Any edit to its bytes (even whitespace) invalidates the hash and breaks the
// theme script on auth/account routes. Regenerate the hash if you touch it.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
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
        <SpeedInsights />
      </body>
    </html>
  );
}
