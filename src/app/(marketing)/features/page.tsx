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
  Shield, List, LayoutDashboard, Languages, AlignRight, Library, Paperclip, FileDown, Crown,
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
      { icon: Library, title: "Prompt Library", desc: "Save your best prompts in folders, mark favourites, and drop any of them into chat with one click." },
      { icon: Mic, title: "Dictate in chat", desc: "Press the mic in the chat box and speak. Your words appear as editable text before you send." },
      { icon: Paperclip, title: "Attach files and images", desc: "Add documents or images with the paperclip, or paste a screenshot. Zero reads them, runs local text recognition on images, and answers over their content." },
      { icon: FileDown, title: "Artifacts and export", desc: "Document-style answers open in a side panel you can read full screen and edit with the AI, then export to PDF, Word, Markdown, and more with real selectable text." },
    ],
  },
  {
    title: "Languages",
    subtitle: "Use InnerZero in your own language.",
    bg: "secondary",
    lead:
      "Pick your language in Settings and the whole app follows: every menu, button, and label, plus the assistant's replies. Switching is instant, with no restart and no internet needed.",
    items: [
      { icon: Languages, title: "26 languages", desc: "A searchable language picker covering English, French, Spanish, German, Italian, Portuguese, Dutch, Polish, Russian, Ukrainian, Chinese, Japanese, Korean, Arabic, Hebrew, Hindi, Turkish, Vietnamese, Thai, Swedish, Indonesian, Persian, Urdu, and more." },
      { icon: MessageSquare, title: "Replies in your language", desc: "Choose a language and Zero answers in it too, not just the menus. English stays the default until you change it." },
      { icon: AlignRight, title: "Right-to-left support", desc: "Full right-to-left layout for Arabic, Hebrew, Persian, and Urdu." },
      { icon: BrainIcon, title: "Multilingual memory", desc: "A one-time upgrade keeps your saved memories searchable across every language you use." },
    ],
  },
  {
    title: "Voice",
    subtitle: "Talk naturally. Zero listens and responds.",
    items: [
      { icon: Mic, title: "Full voice mode", desc: "Press mic and talk. Zero responds with natural speech." },
      { icon: AudioLines, title: "Local speech recognition", desc: "Your voice is transcribed on your machine. No audio leaves your PC." },
      { icon: Volume2, title: "Local text-to-speech", desc: "Natural spoken responses via Kokoro TTS. No internet needed." },
      { icon: AudioLines, title: "Speech-to-text panel", desc: "A standalone transcribe panel on the Voice page. Speak and your words land in an editable box to copy or save." },
      { icon: Volume2, title: "Text-to-speech panel", desc: "Type or paste any text and Zero reads it aloud locally. Keep the model warm with a toggle, with clear loading and stop controls." },
      { icon: Timer, title: "Voice shortcuts", desc: "Ask the time, set a timer, or do quick math instantly by voice." },
      { icon: Cloud, title: "Cloud voice (optional)", desc: "Enable OpenAI voices for premium spoken responses. 13 voice options." },
    ],
  },
  {
    title: "Memory",
    subtitle: "Zero remembers you.",
    bg: "secondary",
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
    bg: "secondary",
    lead:
      "Specialists are dedicated agent personas with their own model, separate from the main assistant. Each one is purpose-built for a specific kind of work, with approval gates around the actions it can take.",
    items: [
      { icon: Code, title: "Coding Specialist", desc: "Live. Hands code tasks to a separate model and asks before any file changes." },
      { icon: Rocket, title: "Automation Specialist", desc: "Live. Routes automation tasks to a small local model, your main assistant, or a dedicated cloud model." },
      { icon: Sparkles, title: "Art Specialist", desc: "A specialist for image and creative work.", comingSoon: true },
    ],
  },
  {
    title: "Proactive Assistant",
    subtitle: "Briefings and reminders that arrive when you want them.",
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
    title: "Action Hub",
    subtitle: "Hand Zero a goal and approve every step.",
    bg: "secondary",
    lead:
      "An optional research and apply assistant on the Tasks page. It uses your own keys and saved profile, runs in the background, and asks for your approval before it acts. Off by default.",
    items: [
      { icon: Search, title: "Web research", desc: "With your own Apify API key, Zero gathers and summarises sources from the web for a goal you set." },
      { icon: FileText, title: "Job profile", desc: "Save a reusable profile of CV details and answers that Zero can draw on when you ask it to help with an application." },
      { icon: MousePointer, title: "Apply assist", desc: "Zero can help fill in job application forms in a fresh, isolated browser that never reuses your logins or cookies. The apply flow works best on Windows in this release." },
      { icon: ShieldCheck, title: "Approval before it acts", desc: "Submitting an application is gated behind your explicit approval. Keep it to draft-only and review everything first." },
      { icon: Timer, title: "Saved actions and scheduling", desc: "Save an action once, re-run it in one click, or put it on a schedule. Scheduled runs always stop at a draft for your review." },
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
      { icon: ShieldCheck, title: "Egress guard", desc: "Every outbound connection passes through a single fail-closed guard. Offline and Private modes hold even if a tool tries to reach out." },
      { icon: Router, title: "Proxy support", desc: "Behind a corporate or university proxy? Enter your HTTP or HTTPS proxy in Settings. Local AI traffic is never proxied." },
      { icon: Eye, title: "Cloud vision (optional)", desc: "With cloud mode and vision enabled, an attached image can be sent to a vision model for a closer look. Off by default and fail-closed." },
    ],
  },
  {
    title: "Customisation",
    subtitle: "Make it yours.",
    bg: "secondary",
    items: [
      { icon: Palette, title: "Themes", desc: "Dark Zero, Light Zero, Classic Carbon, Soft Pink, Dark Teal, and Neon Tokyo, plus premium Pro themes like Golden Pro with an animated starfield." },
      { icon: Sparkles, title: "AI personality", desc: "Professional, Friendly, Concise, or create your own. InnerZero Pro adds premium personality presets." },
      { icon: Crown, title: "InnerZero Pro", desc: "An optional membership unlocks premium themes, personalities, and extra proactive briefing types. Works fully offline and is separate from cloud plans." },
      { icon: ToggleLeft, title: "Tool preferences", desc: "Enable or disable individual tools." },
      { icon: FolderOpen, title: "Configurable output folder", desc: "Choose where Zero saves files." },
      { icon: Cog, title: "Hardware profiles", desc: "Auto-detected or manually overridden." },
      { icon: Cpu, title: "Choice of local engine", desc: "Ollama by default, or connect LM Studio or your own llama.cpp server. Switch in Settings, no reinstall." },
      { icon: Power, title: "Open at login", desc: "Start InnerZero automatically when you sign in, on Windows, macOS, and Linux. Off by default, no admin rights needed." },
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
              "Free private AI assistant with a 26-language interface, chat, voice, memory, 30+ tools, Gmail and Google Calendar connectors, proactive briefings, an Action Hub for web research and job applications, knowledge packs, and screen automation. Runs entirely on your PC.",
            url: absoluteUrl("/"),
          }),
        }}
      />
    </>
  );
}
