import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/changelog" },
  title: "Changelog",
  description:
    "Release notes and updates for InnerZero. See what's new in each version of your private AI assistant.",
  openGraph: {
    title: "Changelog | InnerZero",
    description:
      "Release notes and updates for InnerZero.",
    url: "https://innerzero.com/changelog",
  },
});

interface ChangeEntry {
  text: string;
}

interface ChangeGroup {
  label: "New" | "Improved" | "Fixed";
  entries: ChangeEntry[];
}

interface Release {
  version: string;
  date: string;
  latest?: boolean;
  groups: ChangeGroup[];
}

const RELEASES: Release[] = [
  {
    version: "0.1.3",
    date: "April 2026",
    latest: true,
    groups: [
      {
        label: "New",
        entries: [
          { text: "AI Specialists: delegate coding tasks to a specialist AI agent. Full file review and approve/reject before any changes are applied." },
          { text: "LM Studio support: use LM Studio as an alternative local AI backend alongside Ollama. Switch instantly in Settings." },
          { text: "Offline mode: completely block all outbound network requests with a single toggle. Nothing leaves your machine." },
          { text: "Connection log: see every outbound request Zero makes, with destination, timing, and status." },
          { text: "Privacy blacklist: define sensitive terms that are automatically scrubbed from all cloud messages before they leave your machine." },
          { text: "My Privacy page: centralised privacy dashboard with mode selector, blacklist management, connection log, and data controls." },
          { text: "Telegram remote access: control Zero from your phone via a Telegram bot. Encrypted token storage, chat ID whitelisting, and desktop chat mirroring." },
          { text: "xAI Grok and Kimi (Moonshot) cloud providers. 7 cloud AI providers now supported." },
          { text: "Neon Tokyo exclusive theme: cyberpunk purple and cyan with animated synthwave perspective grid. Unlock with a founder code from Discord." },
          { text: "Theme unlock system: redeem exclusive codes for special themes." },
          { text: "Costs page with currency selector (7 currencies), period filters, and per-request cost breakdown." },
          { text: "Windows installer now signed by Summers Solutions Ltd via Azure Trusted Signing." },
        ],
      },
      {
        label: "Improved",
        entries: [
          { text: "Cloud voice now offers Standard mode (split reasoning and TTS), roughly 15x cheaper than Premium mode." },
          { text: "Cloud token usage reduced by approximately 80% for chat messages through context optimisation." },
          { text: "Choose different cloud models for Director and Specialist roles independently." },
          { text: "Specialist agent memories are now processed separately during sleep, with dedicated fact extraction and cleanup." },
          { text: "Cloud billing is now idempotent. Retried requests after timeouts will not be double-charged." },
          { text: "Account tokens refresh automatically on expiry. No more manual re-login after sessions expire." },
          { text: "Settings page loads significantly faster with lazy tab loading." },
        ],
      },
    ],
  },
  {
    version: "0.1.2",
    date: "April 2026",
    groups: [
      {
        label: "New",
        entries: [
          { text: "macOS support: .dmg installer with .app bundle (Intel and Apple Silicon)" },
          { text: "Linux support: AppImage for x86_64 with bundled Python runtime" },
          { text: "Auto-updater: checks for new versions on startup, one-click update with SHA256 verification" },
          { text: "GPU detection for NVIDIA, AMD (ROCm + HSA override), Intel Arc (oneAPI), and Apple Silicon (Metal)" },
          { text: "Vulkan toggle for GPU acceleration on non-NVIDIA hardware (experimental, manual only)" },
          { text: "Ollama mode persistence: bundled or system Ollama config saved from first setup, prevents model-not-found errors" },
          { text: "Discord community link in the sidebar" },
          { text: "System dependency notices for macOS and Linux on first launch" },
          { text: "GPU acceleration section in Settings with detected backend display" },
          { text: "Model location info in Settings for debugging" },
          { text: "CI/CD pipeline: GitHub Actions builds all three platforms in parallel on tag push" },
        ],
      },
      {
        label: "Improved",
        entries: [
          { text: "Linux AppImage reduced from 2.7 GB to 356 MB (torch CPU-only install in CI)" },
          { text: "Setup wizard shows retry and skip buttons with troubleshooting guidance when model downloads fail" },
          { text: "Settings shows \"No compatible GPU detected, CPU mode will be used\" with manual tier override note" },
          { text: "Sleep subprocess uses python.exe instead of pythonw.exe for reliable .pyc execution" },
          { text: "Auto-sleep defaults to off on new installs" },
          { text: "Consent modal checkbox text alignment improved" },
        ],
      },
      {
        label: "Fixed",
        entries: [
          { text: "Model not found (404) error when using system Ollama alongside InnerZero" },
          { text: "Sleep pipeline crash in installed app (load_dotenv .pyc incompatibility)" },
          { text: "Sleep subprocess failing silently (pythonw.exe, missing PYTHONPATH)" },
          { text: "Version display showing \"?\" in Settings before background check completes" },
          { text: "Discord sidebar showing raw template literal instead of icon" },
          { text: "fetch_url Unicode crash on Windows (arrow character in print statement)" },
          { text: "Auto-sleep toggle snapping back to off when dropdown closes on click" },
        ],
      },
    ],
  },
  {
    version: "0.1.1",
    date: "April 2026",
    groups: [
      {
        label: "New",
        entries: [
          { text: "Remote Ollama support: connect to Ollama running on another machine on your network" },
          { text: "Unrestricted Mode with full age verification and consent flow" },
          { text: "Automated memory backup system (weekly, up to 10 backups)" },
          { text: "Version update gate: older installs prompted to update on launch" },
          { text: "Business licence validation for commercial users" },
          { text: "Star ratings on AI responses (1-5 stars, replaces thumbs up/down)" },
          { text: "Custom alarm sounds: pick your own audio file for alarms" },
          { text: "Memory import: paste text or upload files to teach Zero new facts" },
        ],
      },
      {
        label: "Improved",
        entries: [
          { text: "Clock system redesigned: preset timer pills, phone-style AM/PM alarm picker" },
          { text: "Settings reorganised from 11 tabs to 9 (cleaner, less overwhelming)" },
          { text: "Memory page replaced by Settings Memory tab (Core Facts, Recent Memories, Archive)" },
          { text: "Sleep progress estimates are more accurate and never increase during a run" },
          { text: "Auto-sleep with configurable idle timer (15-60 minutes)" },
          { text: "Wake buttons in chat and status bar during sleep" },
        ],
      },
      {
        label: "Fixed",
        entries: [
          { text: "Dictionary Unicode crash on Windows (IPA phonetic symbols)" },
          { text: "Weather API updated (Open-Meteo deprecated old endpoint)" },
          { text: "Voice name confusion (reordered confidence checks)" },
          { text: "Voice math shortcuts (\"seven times seven\" now uses calculator, not the AI model)" },
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "April 2026",
    groups: [
      {
        label: "New",
        entries: [
          { text: "First public release of InnerZero" },
          { text: "AI chat with streaming responses and cancel support" },
          { text: "Full voice mode: speech recognition, natural TTS, voice shortcuts" },
          { text: "30+ built-in tools (web search, calculator, timers, notes, file operations, and more)" },
          { text: "Persistent memory system with local storage" },
          { text: "Sleep/reflection pipeline for overnight memory processing" },
          { text: "Knowledge packs (offline Wikipedia)" },
          { text: "5 themes (Dark Zero, Light Zero, Classic Carbon, Soft Pink, Dark Teal)" },
          { text: "Cloud mode with BYO API keys (DeepSeek, OpenAI, Anthropic, Google AI, Qwen)" },
          { text: "Cloud voice (OpenAI Audio with 13 ChatGPT voices)" },
          { text: "AI personality system (Professional, Friendly, Concise, or custom)" },
          { text: "Screen automation (read screen, click, type, scroll other apps)" },
          { text: "Document upload and Q&A (.txt, .md, .pdf, .docx, .xlsx, .csv)" },
          { text: "Project system for organising work and scoping memory" },
          { text: "Hardware auto-detection and model selection" },
          { text: "Setup wizard with guided first-run experience" },
          { text: "Chat session persistence across restarts" },
        ],
      },
    ],
  },
];

const BADGE_COLORS: Record<string, string> = {
  New: "bg-accent-teal-muted text-accent-teal",
  Improved: "bg-accent-gold-muted text-accent-gold",
  Fixed: "bg-[rgba(34,197,94,0.12)] text-success",
};

export default function ChangelogPage() {
  return (
    <div className="pt-28 pb-12 md:pt-36 md:pb-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Hero */}
          <div className="mb-12 md:mb-16">
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              Changelog
            </h1>
            <p className="mt-3 text-lg text-text-secondary">
              What&apos;s new in InnerZero.
            </p>
          </div>

          {/* Releases */}
          <div className="space-y-16">
            {RELEASES.map((release) => (
              <section key={release.version}>
                {/* Version header */}
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className={`rounded-full px-3.5 py-1 text-sm font-semibold ${
                      release.latest
                        ? "bg-accent-gold text-[#111]"
                        : "border border-border-default text-text-secondary"
                    }`}
                  >
                    v{release.version}
                  </span>
                  <span className="text-sm text-text-muted">
                    {release.date}
                  </span>
                  {release.latest && (
                    <span className="text-xs font-medium text-accent-gold">
                      Latest
                    </span>
                  )}
                </div>

                {/* Change groups */}
                <div className="space-y-6 pl-1">
                  {release.groups.map((group) => (
                    <div key={group.label}>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3 ${
                          BADGE_COLORS[group.label] || ""
                        }`}
                      >
                        {group.label}
                      </span>
                      <ul className="space-y-2">
                        {group.entries.map((entry, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-text-secondary"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border-default" />
                            {entry.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
