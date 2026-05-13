import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare, Zap, History, Brain as BrainIcon, Settings2,
  Mic, AudioLines, Volume2, Timer, Cloud,
  Heart, BookOpen, FileText, Wrench, Calculator,
  Search, Clipboard, FileEdit, StickyNote,
  Monitor, MousePointer, Power, Lock,
  Key, Eye, Router, Send,
  Palette, Sparkles, ToggleLeft, FolderOpen, Cpu,
  ShieldAlert, ShieldCheck, UserCheck, User,
  Rocket, Code, PenTool, Package, Cog,
  Shield, List, LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HardwareTable } from "@/components/sections/HardwareTable";
import { absoluteUrl, createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/features" },
  // Absolute title bypasses the "%s | InnerZero..." template in
  // src/lib/metadata.ts. Without absolute, the brand appears twice in
  // the rendered <title> because this page's title already contains
  // "InnerZero". Same pattern as the home page and /about.
  title: {
    absolute: "Features | InnerZero: Private AI Assistant",
  },
  description:
    "Explore everything InnerZero can do. AI chat, voice, memory, 30+ tools, knowledge packs, screen automation, cloud AI, and more. All free, all private, all on your PC.",
  openGraph: {
    title: "Features | InnerZero: Private AI Assistant",
    description:
      "AI chat, voice, memory, 30+ tools, knowledge packs, screen automation, and more. All free and private.",
    url: "https://innerzero.com/features",
  },
});

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  comingSoon?: boolean;
}

interface FeatureSection {
  title: string;
  subtitle: string;
  items: FeatureItem[];
  bg?: "primary" | "secondary";
  lead?: string;
}

const SECTIONS: FeatureSection[] = [
  {
    title: "AI Chat",
    subtitle: "Ask anything. Get answers privately.",
    items: [
      { icon: Lock, title: "Private conversations", desc: "All AI processing on your hardware. Nothing sent anywhere." },
      { icon: Zap, title: "Streaming responses", desc: "See answers appear word by word. Cancel anytime mid-generation." },
      { icon: History, title: "Persistent chat", desc: "Your conversation history survives app restarts. Clear it whenever you want." },
      { icon: Settings2, title: "Multiple thinking modes", desc: "Quick for fast answers, Thorough for deeper reasoning." },
      { icon: FileEdit, title: "Markdown rendering", desc: "Formatted responses with code blocks, lists, tables, and more." },
      { icon: MessageSquare, title: "Slash commands", desc: "Type / in chat for built-in commands like /help and /clear. Deterministic routing, not AI-interpreted." },
    ],
  },
  {
    title: "Voice",
    subtitle: "Talk naturally. Zero listens and responds.",
    bg: "secondary",
    items: [
      { icon: Mic, title: "Full voice mode", desc: "Press mic and talk. Zero responds with natural speech." },
      { icon: AudioLines, title: "Local speech recognition", desc: "Your voice is transcribed on your machine. No audio leaves your PC." },
      { icon: Volume2, title: "Local text-to-speech", desc: "Natural spoken responses via Kokoro TTS. No internet needed." },
      { icon: Timer, title: "Voice shortcuts", desc: "Ask the time, set a timer, or do quick math instantly by voice." },
      { icon: Cloud, title: "Cloud voice (optional)", desc: "Enable OpenAI voices for premium spoken responses. 13 voice options." },
    ],
  },
  {
    title: "Memory",
    subtitle: "Zero remembers you.",
    items: [
      { icon: BrainIcon, title: "Persistent memory", desc: "Zero learns from every conversation and remembers across sessions." },
      { icon: User, title: "Core profile", desc: "Store personal facts (name, preferences, work) that Zero always knows." },
      { icon: Heart, title: "Sleep and reflection", desc: "Overnight processing extracts facts, prunes duplicates, and strengthens important memories." },
      { icon: Clipboard, title: "Memory import", desc: "Paste text or upload files to teach Zero about you or your work." },
      { icon: FolderOpen, title: "Project scoping", desc: "Organise memory by project so Zero stays focused on what matters." },
      { icon: List, title: "Source provenance", desc: "Every memory tracks where it came from (chat, voice, document, Gmail, calendar) so Zero knows the source of what it remembers." },
    ],
  },
  {
    title: "Tools",
    subtitle: "30+ built-in tools. No plugins needed.",
    bg: "secondary",
    items: [
      { icon: Search, title: "Web search", desc: "Search and summarise web pages without tracking." },
      { icon: FileText, title: "Document Q&A", desc: "Upload .txt, .md, .pdf, .docx, .xlsx, .csv files and ask questions." },
      { icon: Calculator, title: "Calculator", desc: "Accurate arithmetic, math functions, and unit awareness." },
      { icon: FileEdit, title: "File operations", desc: "Write, read, rename, delete files in a sandboxed output folder." },
      { icon: Timer, title: "Calendar", desc: "Month, Week, Day, and Agenda views with two-way Google Calendar sync. Zero can also create, find, and update events directly from chat." },
      { icon: Send, title: "Gmail integration", desc: "Read-only Gmail with metadata only (sender, subject, snippet). Message bodies are never fetched or stored." },
      { icon: LayoutDashboard, title: "Live tasks queue", desc: "Background work shown as a kanban with progress, ETAs, and resource lane coordination." },
      { icon: Timer, title: "Timers, alarms, reminders", desc: "Set countdowns, alarms with custom sounds, and timed reminders." },
      { icon: StickyNote, title: "Notes", desc: "Quick timestamped notes saved locally." },
      { icon: BookOpen, title: "Dictionary", desc: "Word definitions, synonyms, and examples." },
      { icon: Wrench, title: "Text transforms", desc: "Uppercase, word count, sort, deduplicate, bullet formatting, and more." },
      { icon: Cpu, title: "System info", desc: "Check CPU, RAM, disk, GPU status from chat." },
    ],
  },
  {
    title: "Specialists",
    subtitle: "Agents with their own model, dedicated to one kind of work.",
    lead:
      "Specialists are dedicated agent personas with their own model, separate from the main assistant. Each one is purpose-built for a specific kind of work, with approval gates around the actions it can take.",
    items: [
      { icon: Code, title: "Coding Specialist", desc: "Live. Hands code tasks to a separate model and asks before any file changes." },
      { icon: Rocket, title: "Automation Specialist", desc: "Live in v0.1.6. Routes automation tasks to a small local model, your main assistant, or a dedicated cloud model." },
      { icon: Sparkles, title: "Art Specialist", desc: "A specialist for image and creative work.", comingSoon: true },
    ],
  },
  {
    title: "Proactive Assistant",
    subtitle: "Briefings and reminders that arrive when you want them.",
    bg: "secondary",
    lead:
      "Schedule briefings, daily summaries, and reminders. Optional and off by default. Composed locally from your memory, connected mail, and knowledge packs.",
    items: [
      { icon: Timer, title: "Natural-language scheduling", desc: "Type \"remind me at 5pm tomorrow\" in chat or use Quick Add. Zero parses the phrase and schedules the reminder." },
      { icon: FileText, title: "Smart briefings", desc: "A higher-quality briefing mode that pulls from your memory, mail, and knowledge packs as needed." },
      { icon: Power, title: "Quiet hours", desc: "Pause briefings during set windows of the day. They resume automatically when the window ends." },
      { icon: Send, title: "Multi-channel notifications", desc: "Desktop chat, system notification, and an optional Telegram bridge if you want briefings on your phone." },
      { icon: ToggleLeft, title: "Off by default", desc: "The Proactive Assistant only runs once you turn it on. Schedules and channels are yours to configure." },
    ],
  },
  {
    title: "Knowledge Packs",
    subtitle: "Offline Wikipedia in your AI.",
    items: [
      { icon: BookOpen, title: "Offline reference", desc: "Download Wikipedia articles for factual answers without internet." },
      { icon: Package, title: "Two packs available", desc: "Best of Wikipedia (95K articles) and Simple English (280K articles)." },
      { icon: ShieldCheck, title: "AI cross-referencing", desc: "Zero checks its answers against real articles to reduce hallucinations." },
    ],
  },
  {
    title: "Screen Automation",
    subtitle: "Control your PC with AI.",
    bg: "secondary",
    items: [
      { icon: Monitor, title: "Screen reading", desc: "Zero can read what's on your screen and identify interactive elements." },
      { icon: MousePointer, title: "Click, type, scroll", desc: "Direct AI-powered interaction with other applications." },
      { icon: Power, title: "Emergency stop", desc: "Press Escape anytime to halt all automation immediately." },
      { icon: Lock, title: "Disabled by default", desc: "Opt-in only. You control when it's active." },
    ],
  },
  {
    title: "Cloud AI (Optional)",
    subtitle: "Add cloud power when you need it.",
    items: [
      { icon: Key, title: "BYO API keys", desc: "Add your own keys for 7 providers: DeepSeek, OpenAI, Anthropic, Google AI, xAI Grok, Qwen, and Kimi. Zero markup." },
      { icon: Eye, title: "Private by default", desc: "Cloud mode is off until you turn it on. Clearly labelled when active." },
      { icon: Router, title: "Smart routing", desc: "Auto-routes to the best engine based on task complexity." },
      { icon: Send, title: "Only the prompt is sent", desc: "Your memory database, files, and history stay local. Only the current message goes to the provider." },
      { icon: Volume2, title: "Cloud voice Standard mode", desc: "Split reasoning and TTS for roughly 15x lower cost than Premium bundled mode." },
      { icon: Shield, title: "Privacy blacklist", desc: "Scrub sensitive terms (names, addresses, company info) from cloud messages before they leave your machine. Reversed on response." },
      { icon: List, title: "Connection log", desc: "See every outbound connection InnerZero makes. Filterable inline log with daily rotation." },
      { icon: LayoutDashboard, title: "My Privacy page", desc: "Centralised privacy dashboard. Toggle Offline, Private, or Cloud mode. Manage blacklist, view connections, see privacy stats." },
    ],
  },
  {
    title: "Customisation",
    subtitle: "Make it yours.",
    bg: "secondary",
    items: [
      { icon: Palette, title: "6 themes", desc: "Dark Zero, Light Zero, Classic Carbon, Soft Pink, Dark Teal, and Neon Tokyo (exclusive)." },
      { icon: Sparkles, title: "AI personality", desc: "Professional, Friendly, Concise, or create your own custom personality." },
      { icon: ToggleLeft, title: "Tool preferences", desc: "Enable or disable individual tools." },
      { icon: FolderOpen, title: "Configurable output folder", desc: "Choose where Zero saves files." },
      { icon: Cog, title: "Hardware profiles", desc: "Auto-detected or manually overridden." },
    ],
  },
  {
    title: "Unrestricted Mode",
    subtitle: "Full control for adults.",
    items: [
      { icon: ShieldAlert, title: "Uncensored models", desc: "Swap to abliterated models from Hugging Face for unfiltered responses." },
      { icon: UserCheck, title: "18+ verification", desc: "Age gate, 6 acknowledgements, typed confirmation. Not accessible to minors." },
      { icon: ShieldCheck, title: "Safety preserved", desc: "CSAM hard block, file approval, and screen control gates remain active regardless." },
      { icon: User, title: "Your responsibility", desc: "You control your AI on your machine." },
    ],
  },
  {
    title: "Coming Soon",
    subtitle: "What's next.",
    bg: "secondary",
    items: [
      { icon: Code, title: "Mac notarisation", desc: "The macOS installer is signed with Developer ID and runs under hardened runtime. On first launch, right-click the app and select Open, then click Open again to bypass Gatekeeper. Notarisation returns in a future release." },
      { icon: BookOpen, title: "More knowledge packs", desc: "Science, history, and specialised reference databases." },
      { icon: PenTool, title: "More connectors", desc: "Outlook, Discord, and LinkedIn on the same connector framework that powers Gmail and Google Calendar." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              Everything you need. Nothing you don&apos;t.
            </h1>
            <p className="mt-4 text-lg text-text-secondary">
              InnerZero is a complete AI assistant that runs on your PC. Here&apos;s what&apos;s inside.
            </p>
          </div>
        </Container>
      </section>

      {/* Feature sections */}
      {SECTIONS.map((section) => (
        <Fragment key={section.title}>
          <section
            className={`py-12 md:py-16 ${section.bg === "secondary" ? "bg-bg-secondary" : ""}`}
          >
            <Container>
              <ScrollReveal>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-text-primary">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-text-secondary">
                    {section.subtitle}
                  </p>
                  {section.lead && (
                    <p className="mt-3 max-w-2xl text-sm text-text-secondary leading-relaxed">
                      {section.lead}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-lg border border-border-default bg-bg-card p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-gold hover:shadow-[0_0_16px_rgba(212,168,67,0.04)]"
                    >
                      <div className="flex items-start gap-3">
                        <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal" />
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary">
                            {item.title}
                            {item.comingSoon && (
                              <span className="ml-2 inline-flex items-center rounded-full border border-border-default px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                                Coming soon
                              </span>
                            )}
                          </h3>
                          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </Container>
          </section>

          {/* Personality screenshot, paired visually with the
              Customisation section that introduces "AI personality"
              as a feature card. Static framing matches the
              homepage HeroScreenshots pattern (dark frame, 19:10
              inner aspect, object-contain). No lightbox here since
              the features page is deep-content; the image is
              supporting evidence, not a gallery. */}
          {section.title === "Customisation" && (
            <section
              aria-label="Personality settings screenshot"
              className={`py-10 md:py-14 ${section.bg === "secondary" ? "bg-bg-secondary" : ""}`}
            >
              <Container>
                <div className="mx-auto max-w-5xl">
                  <div className="overflow-hidden rounded-xl border border-border-default bg-[#0a0a0f] p-3 md:p-4">
                    <div className="relative aspect-19/10 overflow-hidden rounded-md">
                      <Image
                        src="/images/appsettingspersonalitypage.png"
                        alt="InnerZero personality settings with Professional, Friendly, and Concise presets plus a custom personality creation form"
                        fill
                        sizes="(max-width: 1024px) 100vw, 80vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-center text-sm text-text-secondary">
                    Choose a prebuilt personality or write your own. Applies
                    to both text chat and voice.
                  </p>
                </div>
              </Container>
            </section>
          )}

          {/* HardwareTable mounts after the Customisation section's
              "Hardware profiles" item so the natural flow goes from
              "Zero auto-detects your hardware" to "here are the tiers
              it picks between". Sits before Unrestricted Mode and
              Coming Soon. Data lives in src/lib/hardware.ts. */}
          {section.title === "Customisation" && <HardwareTable />}
        </Fragment>
      ))}

      {/* CTA */}
      <section className="py-12 md:py-20">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold text-text-primary">
              Ready to try it?
            </h2>
            <p className="mt-3 text-text-secondary">
              Free. Private. No account required.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button href="/download">Download Free</Button>
              <Link
                href="/changelog"
                className="text-sm text-text-muted transition-colors hover:text-accent-gold"
              >
                See what&apos;s new in the changelog
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "InnerZero",
            operatingSystem: "Windows 10, Windows 11, macOS 14+, Linux x86_64",
            applicationCategory: "DesktopApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
            description:
              "Free private AI assistant with chat, voice, memory, 30+ tools, knowledge packs, and screen automation. Runs entirely on your PC.",
            url: absoluteUrl("/"),
          }),
        }}
      />
    </>
  );
}
