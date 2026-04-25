import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare, Mic, Brain, Search, FileText, Wrench,
  BookOpen, Palette, Shield, Monitor, Cloud, Volume2,
  ChevronDown,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SYSTEM_REQUIREMENTS } from "@/lib/constants";
import { absoluteUrl, createMetadata } from "@/lib/metadata";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";
import { DownloadCards } from "./DownloadCards";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/download" },
  title: "Download Free | InnerZero: Private AI Assistant",
  description:
    "Download InnerZero for free on Windows, macOS, and Linux. A private AI assistant that runs on your machine with no subscription, no account, and no cloud required.",
  openGraph: {
    title: "Download Free | InnerZero: Private AI Assistant",
    description:
      "Download InnerZero for free on Windows, macOS, and Linux.",
    url: "https://innerzero.com/download",
  },
});

const INCLUDED_FEATURES = [
  { icon: MessageSquare, title: "AI Chat", desc: "Ask anything. Get answers privately on your machine." },
  { icon: Mic, title: "Voice Mode", desc: "Talk to Zero naturally. Speech recognition and spoken responses." },
  { icon: Brain, title: "Persistent Memory", desc: "Zero remembers your conversations and learns over time." },
  { icon: Search, title: "Web Search", desc: "Search the web and summarise pages without tracking." },
  { icon: FileText, title: "Document Q&A", desc: "Upload documents and ask questions about them." },
  { icon: Wrench, title: "30+ Built-in Tools", desc: "Calculator, timers, notes, file tools, text transforms, and more." },
  { icon: BookOpen, title: "Knowledge Packs", desc: "Offline Wikipedia for factual answers without internet." },
  { icon: Palette, title: "6 Themes", desc: "Dark Zero, Light, Classic Carbon, Soft Pink, Dark Teal, and Neon Tokyo." },
  { icon: Shield, title: "100% Private", desc: "No account, no telemetry, no data collection. Ever." },
  { icon: Monitor, title: "Screen Automation", desc: "Read your screen, click, type, and scroll other apps." },
  { icon: Cloud, title: "Optional Cloud AI", desc: "Add your own API keys for GPT-4, Claude, Gemini, and more." },
  { icon: Volume2, title: "Cloud Voice", desc: "Optional OpenAI voices for natural spoken responses." },
];

export default function DownloadPage() {
  return (
    <div className="pt-28 pb-12 md:pt-36 md:pb-20">
      <Container>
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Download InnerZero
          </h1>
          <p className="mt-2 text-xl font-medium text-accent-teal">
            Free. Private. Yours.
          </p>
          <p className="mt-4 text-lg text-text-secondary">
            InnerZero runs entirely on your machine. No account required. No subscription. Download and start chatting in minutes.
          </p>
          <p className="mt-2">
            <Link
              href="/changelog"
              className="text-xs text-text-muted transition-colors hover:text-accent-gold"
            >
              See what&apos;s new in v0.1.5
            </Link>
          </p>
        </div>

        {/* Platform downloads */}
        <DownloadCards />

        {/* Requirements */}
        <ScrollReveal>
          <div className="mx-auto mt-16 grid max-w-2xl gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-border-default bg-bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Minimum Requirements
              </h2>
              <ul className="space-y-2">
                {SYSTEM_REQUIREMENTS.minimum.map((req) => (
                  <li
                    key={req}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border-default bg-bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Recommended
              </h2>
              <ul className="space-y-2">
                {SYSTEM_REQUIREMENTS.recommended.map((req) => (
                  <li
                    key={req}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* What's Included */}
        <ScrollReveal>
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-text-primary">
                What&apos;s Included
              </h2>
              <p className="mt-2 text-text-secondary">
                Everything you need, nothing you don&apos;t.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {INCLUDED_FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-lg border border-border-default bg-bg-card p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-gold hover:shadow-[0_0_16px_rgba(212,168,67,0.04)]"
                >
                  <div className="flex items-start gap-3">
                    <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal" />
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {f.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom links */}
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <p className="mt-4">
            <Link
              href="/pricing"
              className="text-sm text-text-secondary transition-colors hover:text-accent-gold"
            >
              Need cloud AI? See pricing
            </Link>
          </p>
        </div>
      </Container>

      <NewsletterSignup
        source="download_page"
        title="Know when new versions ship"
        subtitle="Get notified about releases, features, and privacy updates. No spam."
      />

      {/* JSON-LD: SoftwareApplication with per-platform offers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "@id": `${absoluteUrl("/")}#software`,
            name: "InnerZero",
            applicationCategory: "UtilitiesApplication",
            applicationSubCategory: "AI Assistant",
            operatingSystem: "Windows, macOS, Linux",
            softwareVersion: "0.1.5",
            description:
              "A free private AI assistant that runs entirely on your PC. No cloud. No tracking. No subscription.",
            url: absoluteUrl("/"),
            downloadUrl: absoluteUrl("/download"),
            publisher: {
              "@type": "Organization",
              "@id": `${absoluteUrl("/")}#organization`,
              name: "InnerZero",
              url: absoluteUrl("/"),
            },
            offers: [
              {
                "@type": "Offer",
                name: "InnerZero for Windows",
                price: "0",
                priceCurrency: "GBP",
                availability: "https://schema.org/InStock",
                url: "https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-Setup-0.1.5.exe",
                operatingSystem: "Windows 10, Windows 11",
              },
              {
                "@type": "Offer",
                name: "InnerZero for macOS",
                price: "0",
                priceCurrency: "GBP",
                availability: "https://schema.org/InStock",
                url: "https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-Setup-0.1.5-mac.dmg",
                operatingSystem: "macOS 12 or later",
              },
              {
                "@type": "Offer",
                name: "InnerZero for Linux",
                price: "0",
                priceCurrency: "GBP",
                availability: "https://schema.org/InStock",
                url: "https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-0.1.5-x86_64.AppImage",
                operatingSystem: "Linux x86_64",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
