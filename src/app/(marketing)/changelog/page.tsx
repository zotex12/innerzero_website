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

export interface ChangeEntry {
  text: string;
}

export interface ChangeGroup {
  label: "New" | "Improved" | "Fixed" | "Known limitations";
  entries: ChangeEntry[];
}

export interface Release {
  version: string;
  date: string;
  // ISO 8601 date string for feed pubDate. Optional; when omitted, the
  // feed handler falls back to the first of the displayed month.
  releaseDate?: string;
  latest?: boolean;
  groups: ChangeGroup[];
}

export const RELEASES: Release[] = [
  {
    version: "0.1.6",
    date: "May 2026",
    releaseDate: "2026-05-09",
    latest: true,
    groups: [
      {
        label: "New",
        entries: [
          { text: "Proactive Assistant: schedule briefings, daily summaries, and reminders that arrive when you want them. Natural-language scheduling like \"remind me at 5pm tomorrow\", quiet hours, multi-channel notifications, and an optional Telegram bridge if you want briefings on your phone." },
          { text: "Smart briefings: a higher-quality briefing mode that pulls from your memory, mail, and knowledge packs as needed instead of relying on a single prompt-and-response." },
          { text: "Automation Specialist: route automation tasks to a small local model, your main assistant, or a dedicated cloud model based on what you want to optimise for (speed, quality, or privacy)." },
          { text: "Slash commands in chat: type /help to see what is available, /clear to reset the visible conversation, and more for quick actions without typing prompts." },
          { text: "First-run hardware detection: InnerZero now tests your GPU on first run and picks the right model tier automatically. You can also override it manually in the setup wizard." },
          { text: "Bundled Ollama upgraded to v0.22.1 with full GPU acceleration: modern NVIDIA via CUDA 13, Apple Silicon via Metal, AMD and cross-vendor via Vulkan, and Intel via OneAPI." },
          { text: "AMD GPU users can now opt in to GPU acceleration in Settings. AMD support is conservative-by-default for this release while we collect real-world feedback." },
          { text: "Single-instance lock: launching InnerZero a second time now focuses the existing window instead of opening a duplicate." },
        ],
      },
      {
        label: "Improved",
        entries: [
          { text: "Chat reliability for LM Studio backends: better handling of replies that drift from the expected response shape, and replies that contain emoji or non-ASCII characters now render correctly on Windows." },
          { text: "Linux installer streamlined for modern NVIDIA (Turing onward) via CUDA 13, plus Vulkan for AMD and cross-vendor." },
          { text: "Mac code-signing hygiene: cleaner Gatekeeper experience on first launch." },
        ],
      },
      {
        label: "Fixed",
        entries: [
          { text: "Bundled Ollama on Mac and Linux now resolves correctly. Users on previous versions whose bundled Ollama silently failed to start should see chat working out of the box on v0.1.6." },
          { text: "LM Studio chat replies containing emoji or smart quotes no longer crash on Windows." },
          { text: "LM Studio: when a model returns a response shape that does not match what InnerZero expects, the actual answer text is recovered where possible instead of showing a raw fallback." },
          { text: "Several internal coverage gaps in the installer bundle that affected slash commands and other modules in installed builds." },
        ],
      },
      {
        label: "Known limitations",
        entries: [
          { text: "The macOS DMG ships unstapled in v0.1.6. The app is signed with Developer ID, runs under hardened runtime, and applies the necessary entitlements. On first launch with internet, Gatekeeper does a one-time online check with Apple and the app opens normally. If you are offline on first launch, right-click the app, select Open, then click Open again. Stapling returns in a future release." },
          { text: "macOS minimum is now Sonoma 14. Bundled Ollama 0.22.1 no longer supports Monterey or Ventura." },
          { text: "Pre-Turing NVIDIA Linux users on the bundled mode (GTX 9 series Maxwell, GTX 10 series Pascal, V100 Volta) should use Vulkan or install Ollama separately for full CUDA support." },
          { text: "Installer sizes have grown vs v0.1.5 because of the Ollama 0.22.1 bundling. See the download page for current sizes per platform." },
        ],
      },
    ],
  },
  {
    version: "0.1.5",
    date: "April 2026",
    releaseDate: "2026-04-25",
    groups: [
      {
        label: "New",
        entries: [
          { text: "Calendar page with Month, Week, Day, and Agenda views. Click an empty slot to create an event. Drag events to reschedule." },
          { text: "Two-way Google Calendar sync. Connect your Google account in Settings; events from Google appear locally and events you create at home publish back. Private events stay on your machine." },
          { text: "Gmail integration (read-only). Sender, subject, and a short snippet of recent inbox emails so Zero can answer questions about your mail. Message bodies are never fetched or stored." },
          { text: "Tasks page with a live queue. Kanban lanes, progress bars, ETAs, and resource coordination so you can see what Zero is doing in the background." },
          { text: "Dashboard 7-day calendar widget with a next-up section." },
          { text: "AI agency over your calendar. Zero can create, find, update, and delete events directly from chat with approval gates on writes." },
          { text: "Source provenance on memories. Every memory now records where it came from (chat, voice, document, Gmail, calendar) and surfaces that source to the AI." },
          { text: "Mac code signing with Developer ID and hardened runtime. The macOS installer is now signed by Summers Solutions Ltd." },
          { text: "Windows installer hardened with Azure Trusted Signing and a deferred-swap auto-updater that resolves the WebView2 file-lock during in-app upgrades." },
        ],
      },
      {
        label: "Improved",
        entries: [
          { text: "Anthropic prompt caching is now active on Director calls, reducing cost on repeated cache-hit prompts within the 5-minute window." },
          { text: "Calendar-aware memory. Time-sensitive questions surface upcoming 7-day events directly into Zero's context." },
          { text: "Knowledge pack search quality. Two-phase title boosting, prose extraction, and question-prefix stripping produce cleaner answers." },
          { text: "Faster voice shortcuts. Time, weather, calculator, dictionary, system info, and timer queries now respond in under two seconds." },
          { text: "Privacy hardening for cloud features. Every cloud dispatch path (initial messages, retries, and multi-round agent loops) now routes through one privacy-blacklist chokepoint." },
        ],
      },
      {
        label: "Fixed",
        entries: [
          { text: "Windows in-app updater no longer fails on the WebView2 DLL file-lock. The new deferred-swap pattern applies the upgrade at next cold start." },
          { text: "Archive page now shows archived memories correctly." },
          { text: "Settings hover styling and tab consistency across all 9 tabs." },
          { text: "Mac and Linux launches are now reliable: pywebview backend bindings ship with the correct platform markers." },
          { text: "Memory system: sleep pipeline routes correctly on the LM Studio backend, preference-type memories reach the Director prompt, and project-scoped retrieval backfills bidirectionally." },
        ],
      },
    ],
  },
  {
    version: "0.1.4",
    date: "April 2026",
    releaseDate: "2026-04-18",
    groups: [
      {
        label: "New",
        entries: [
          { text: "Claude Opus 4.7 support. Use it with your own Anthropic API key in chat or with the coding specialist." },
          { text: "Frontier model tier for datacenter-class hardware (256 GB+ RAM, 120 GB+ VRAM)." },
          { text: "Enthusiast coding model tier for high-end workstations." },
          { text: "Four new coding models: Qwen3 Coder Next, DeepSeek Coder V2, Codestral, and CodeGemma." },
          { text: "Tier switch preview shows disk space required before you commit to the change." },
          { text: "Uninstall downloaded models individually, with protection on any model currently assigned to an active role." },
          { text: "Theme redeem codes now work reliably end to end." },
        ],
      },
      {
        label: "Improved",
        entries: [
          { text: "Coding agent reliability on long-running tasks." },
          { text: "Model downloads auto-resume if your connection drops mid-way." },
          { text: "LM Studio voice model picker now has feature parity with the Ollama picker." },
          { text: "Cloud account connection has better error handling and retry behaviour." },
          { text: "Memory system correctness across projects and specialists." },
        ],
      },
      {
        label: "Fixed",
        entries: [
          { text: "Specialist now connects correctly to remote Ollama servers on your network." },
          { text: "Coding model dropdown shows all installed compatible models." },
          { text: "Coding agent parser no longer strips code fences when writing markdown files." },
          { text: "Coding agent can read files it wrote earlier in the same run." },
          { text: "Removed duplicate strategy content in cloud prompts." },
          { text: "Preference memories reach the assistant again." },
          { text: "Working state no longer leaks between sessions." },
          { text: "Fact verification works on the LM Studio backend." },
        ],
      },
    ],
  },
  {
    version: "0.1.3",
    date: "April 2026",
    releaseDate: "2026-04-14",
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
    releaseDate: "2026-04-08",
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
    releaseDate: "2026-04-06",
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
    releaseDate: "2026-04-07",
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
  "Known limitations": "border border-border-default text-text-secondary",
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
              <section key={release.version} id={`v${release.version}`}>
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
