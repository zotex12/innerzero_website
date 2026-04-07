import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare, Mic, Brain, Search, FileText, Wrench,
  BookOpen, Palette, Shield, Monitor, Cloud, Volume2,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SYSTEM_REQUIREMENTS } from "@/lib/constants";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Download Free | InnerZero: Private AI Assistant",
  description:
    "Download InnerZero for free. A private AI assistant that runs on your PC with no subscription, no account, and no cloud required.",
  openGraph: {
    title: "Download Free | InnerZero: Private AI Assistant",
    description:
      "Download InnerZero for free. A private AI assistant that runs on your PC.",
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
  { icon: Palette, title: "5 Themes", desc: "Dark Zero, Light, Classic Carbon, Soft Pink, and Dark Teal." },
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
            InnerZero runs entirely on your PC. No account required. No subscription. Download and start chatting in minutes.
          </p>

          <div className="mt-8">
            <Button href="https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-Setup-0.1.1.exe">Download for Windows</Button>
            <p className="mt-3 text-sm text-text-muted">
              v0.1.1 · ~265 MB · Windows 10/11 64-bit
            </p>
            <p className="mt-1">
              <Link
                href="/changelog"
                className="text-xs text-text-muted transition-colors hover:text-accent-gold"
              >
                See what&apos;s new in v0.1.1
              </Link>
            </p>
          </div>
        </div>

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

        {/* SmartScreen notice */}
        <div className="mx-auto mt-6 max-w-2xl text-center">
          <p className="text-xs text-text-muted">
            Windows may show a SmartScreen warning on first install. Click &quot;More info&quot; then &quot;Run anyway&quot;. Code signing is coming soon.
          </p>
        </div>

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
          <p className="text-sm text-text-muted">
            macOS and Linux versions are planned for the future.
          </p>
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
    </div>
  );
}
