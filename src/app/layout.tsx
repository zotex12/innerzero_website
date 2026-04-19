import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
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
      </body>
    </html>
  );
}
