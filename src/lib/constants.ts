import {
  Cpu,
  Brain,
  Mic,
  MonitorCog,
  Shield,
  HardDrive,
  Wrench,
  Moon as MoonIcon,
  Download,
  Smartphone,
  Users,
  Mail,
  Key,
  Gift,
  Languages,
  Bell,
  type LucideIcon,
} from "lucide-react";

/* ── Navigation ── */

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy", href: "/privacy" },
  { label: "About", href: "/about" },
  { label: "Learn", href: "/blog" },
];

/* ── Hero copy ── */

export const HERO = {
  headline: "Your AI. Your machine. Your data.",
  tagline: "inner peace. inner joy. innerzero.",
  description:
    "InnerZero is a private AI assistant that runs entirely on your PC. Free to download. No cloud required. Just you and your AI.",
  primaryCta: "Download Free",
  primaryCtaHref: "/download",
  secondaryCta: "See features",
  secondaryCtaHref: "/features",
} as const;

/* ── Feature cards (home page) ── */

export interface FeatureCardData {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURE_CARDS: FeatureCardData[] = [
  {
    icon: Cpu,
    title: "Runs 100% Locally",
    description:
      "All AI processing happens on your PC. No cloud servers, no uploads, no tracking. Your conversations stay yours.",
  },
  {
    icon: Languages,
    title: "Speaks Your Language",
    description:
      "The whole interface is available in 26 languages, and Zero replies in the one you pick. Change it any time in Settings, with right-to-left support and no internet needed.",
  },
  {
    icon: Brain,
    title: "Learns and Remembers",
    description:
      "Zero builds memory from every conversation. It learns your name, your projects, your preferences. All stored locally.",
  },
  {
    icon: Mic,
    title: "Voice and Text",
    description:
      "Talk to Zero or type. Full voice mode with local speech recognition and natural spoken responses. No audio leaves your machine.",
  },
  {
    icon: MonitorCog,
    title: "Hardware Aware",
    description:
      "InnerZero detects your PC's specs and picks the right AI model automatically. Or point it at a remote Ollama server on your network.",
  },
  {
    icon: Bell,
    title: "Connected and Proactive",
    description:
      "Sync Google Calendar two ways, read Gmail metadata (sender, subject, snippet), and get briefings and reminders on your schedule. Every connector is opt-in and revocable.",
  },
];

/* ── How it works steps ── */

export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
}

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    number: 1,
    title: "Download Free",
    description:
      "One click. InnerZero handles everything: dependencies, models, configuration. Free, no account required.",
  },
  {
    number: 2,
    title: "Zero Configures Itself",
    description:
      "Detects your hardware, downloads the right AI model, and optimises for your system.",
  },
  {
    number: 3,
    title: "Start Talking",
    description:
      "Text or voice. Zero remembers everything locally. Your private AI assistant is ready.",
  },
];

/* ── Privacy statement ── */

export const PRIVACY_STATEMENT = {
  headline: "Zero data leaves your machine.",
  points: [
    "All AI processing happens on your hardware",
    "Memory stored in a local database, never uploaded",
    "No account required. No sign-up, no login, no tracking",
    "Optional cloud mode is your choice, off by default, transparent when on",
  ],
} as const;

/* ── Pricing: Free local features ── */

export const PRICING_FREE = {
  planName: "InnerZero",
  price: "Free",
  subtitle: "Free to download. No account, no subscription, no trial.",
  features: [
    "AI chat with streaming responses",
    "Full app interface in 26 languages",
    "Full voice mode (speech + TTS)",
    "Persistent memory system",
    "30+ built-in tools",
    "Document upload and Q&A",
    "Gmail and Google Calendar connectors",
    "Knowledge packs (offline Wikipedia)",
    "Screen automation",
    "6 themes and AI personality",
    "Unrestricted mode (18+)",
    "Remote Ollama support",
    "All free. No account required.",
  ],
  cta: "Download Free",
  ctaHref: "/download",
} as const;

/* ── Pricing: Cloud AI plans ──

The live cloud plan cards (name, price, monthly usage allowance, tier access) are
rendered from the database via /api/cloud/plans in PricingSection.tsx, so plan
figures are never hardcoded here. A stale hardcoded CLOUD_PLANS constant used to
live here; it was removed so it could not drift from the real plan values. */

/* ── Pricing: InnerZero Pro (optional app membership, billed via Stripe) ──

Distinct from the "Cloud Pro" cloud-AI plan (online compute). InnerZero Pro is a
local-features membership. The pricing card (ProMembershipCard) owns the
monthly/annual toggle and the Stripe checkout call; the server resolves the price
ID from { product: "pro", cadence }. */

export const INNERZERO_PRO = {
  monthlyPrice: "£4.99",
  monthlyPeriod: "/month",
  annualPrice: "£39.99",
  annualPeriod: "/year",
  description:
    "An optional membership that unlocks premium local extras. Works fully offline. Separate from Cloud AI plans.",
  perks: [
    "Premium themes (Golden Pro and more)",
    "Premium personalities",
    "Early access to new features",
    "Pro badge",
  ],
  cta: "Get InnerZero Pro",
  note: "Pro is a local membership, not cloud compute. Cloud AI plans are separate.",
} as const;

/* ── Pricing: Business Licence ──

Per-seat pricing constants and helpers live in `src/lib/stripe.ts`
(TIER1_ANNUAL_PENCE, TIER2_ANNUAL_PENCE, MONTHLY_PENCE, VOLUME_THRESHOLD,
MAX_SELF_SERVE_SEATS, computeBusinessTotal, computeYearlySavings). The
PricingSection renders an interactive card driven by those helpers, so the
visible Business Licence copy is derived rather than hardcoded here. */

/* ── FAQ ── */

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "Is InnerZero really free?",
    answer:
      "Yes. The desktop app is completely free. No trial. No subscription. No account required. It runs on your hardware using open-source AI models.",
  },
  {
    question: "What are cloud plans?",
    answer:
      "Optional. If you want faster reasoning or higher-quality model tiers, you can subscribe to a cloud plan for a set monthly credit allowance. Your local AI always works without one.",
  },
  {
    question: "Can I use my own API keys?",
    answer:
      "Yes. Add your own API keys from any supported provider: DeepSeek, OpenAI, Anthropic, and more. Zero markup. We never touch your keys.",
  },
  {
    question: "What is InnerZero Pro?",
    answer:
      "InnerZero Pro is an optional membership, £4.99/month or £39.99/year, that unlocks premium local extras: premium themes, premium personalities, early access to new features, and a Pro badge. It runs offline and is separate from Cloud AI plans, which add online compute.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. All AI processing, memory, and conversations stay on your machine. If you enable cloud mode, your prompts are forwarded to the AI provider and returned. InnerZero never stores or reads them.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. The local app works without any account. You only need an account if you want cloud AI plans, InnerZero Pro, or future hosted features.",
  },
  {
    question: "Are cloud plans available?",
    answer:
      "Yes. Cloud AI plans are live, starting at £9.99/month for Cloud Starter. See the pricing tiers above for the full breakdown. The local app stays free regardless.",
  },
  {
    question: "Do I need a licence to use InnerZero at work?",
    answer:
      "If you're using InnerZero for business, commercial, or revenue-generating purposes, yes, a Business Licence is required. Per seat: £19.99/month, or £149.99/year (£129.99/year from 5 seats). The app is identical to the free version. The licence is just permission to use it commercially. Personal use, education, and non-profits are free.",
  },
  {
    question: "Do I need a Business Licence?",
    answer:
      "Only if you use InnerZero for commercial purposes, including work for clients, at a company, or as a freelancer. Personal use, education, charities, and non-profits are all free.",
  },
];

export const CLOUD_FAQ: FAQItem[] = [
  {
    question: "What does a cloud plan include?",
    answer:
      "Managed plans cover text chat, voice, specialist agents, and sleep processing, all drawn from your monthly credit allowance. Image vision uses your own API key. Plans differ by how many credits you get each month and which model tiers you can use.",
  },
  {
    question: "What is usage?",
    answer:
      "Each cloud AI response uses a set amount from your monthly or purchased usage. Lower tiers use 1 per response, higher tiers use more. Auto mode picks a model for you and uses just 1. Voice is metered by the minute.",
  },
  {
    question: "What happens when usage runs out?",
    answer:
      "Your local AI keeps working normally. Cloud responses pause until your usage resets next month or you top up with a credit pack. No surprise charges.",
  },
  {
    question: "Do top-up credits expire?",
    answer:
      "Yes. Top-up credits expire 1 year after purchase, matching industry standard. You'll see the expiry date in your account and desktop app. Unused credits past that date are forfeited.",
  },
];

/* ── Features page - detailed features ── */

export interface DetailedFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const DETAILED_FEATURES: DetailedFeature[] = [
  {
    icon: Cpu,
    title: "Local-First AI",
    description:
      "InnerZero runs on your PC, works offline, and never requires an internet connection for AI features. Your conversations and data stay on your machine at all times. No cloud processing. No remote servers. Complete autonomy over your AI assistant.",
  },
  {
    icon: Brain,
    title: "Private Memory System",
    description:
      "InnerZero remembers your conversations, preferences, and facts, all stored locally in a secure database on your machine. Over time, Zero learns what matters to you and becomes more helpful. Your memory is yours alone.",
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description:
      "Speak to Zero and hear responses back. Full speech-to-text and text-to-speech built in. No cloud transcription services, everything is processed locally on your hardware for complete privacy.",
  },
  {
    icon: HardDrive,
    title: "Document Knowledge",
    description:
      "Upload documents and ask questions across your files. InnerZero indexes your documents locally and can reference them in conversation. Build a personal knowledge base that only you can access.",
  },
  {
    icon: Wrench,
    title: "Smart Tools",
    description:
      "Web search, file management, calculations, URL fetching and more. Zero comes with built-in tools that extend what it can do. Tools are run locally and results are processed on your machine.",
  },
  {
    icon: MonitorCog,
    title: "Hardware-Aware Setup",
    description:
      "InnerZero detects your GPU, RAM, CPU and picks the best AI model configuration for your system. No manual setup required. It automatically optimises for your specific hardware.",
  },
  {
    icon: MoonIcon,
    title: "Sleep & Reflection",
    description:
      "When idle, Zero reviews past conversations and strengthens its memory. It learns and organises knowledge while you\u2019re away, so it\u2019s even more helpful when you return.",
  },
  {
    icon: Download,
    title: "One-Click Install",
    description:
      "Download, run the setup wizard, and start chatting. InnerZero handles all the technical complexity: downloading AI models, configuring your system, and setting up dependencies. No terminal required.",
  },
  {
    icon: Gift,
    title: "Free & Open",
    description:
      "InnerZero is free to download and use. No subscription, no trial, no account required. Optional cloud features available for those who want them.",
  },
  {
    icon: Key,
    title: "BYO API Keys",
    description:
      "Bring your own API keys from any supported provider: DeepSeek, OpenAI, Anthropic, and more. Zero markup. Full control. Your keys, your usage, no middleman.",
  },
];

export interface ComingSoonFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const COMING_SOON_FEATURES: ComingSoonFeature[] = [
  {
    icon: Smartphone,
    title: "Mobile Companion App",
    description:
      "Connect to your desktop InnerZero from your phone. Coming soon.",
  },
  {
    icon: Users,
    title: "Team & Office Plan",
    description:
      "Shared project memory across a team with admin controls. Coming soon.",
  },
  {
    icon: Mail,
    title: "Email Drafting",
    description:
      "Zero already reads Gmail headers. Drafting and sending emails is coming soon.",
  },
  {
    icon: Shield,
    title: "Multi-Device Sync",
    description:
      "Sync your memory securely across multiple machines. Coming soon.",
  },
];

/* ── System requirements (download page) ── */

export const SYSTEM_REQUIREMENTS = {
  minimum: [
    "Windows 10 (64-bit), macOS 14 Sonoma, or Linux x86_64 (glibc 2.31+)",
    "8GB RAM",
    "10GB free disk space",
    "Modern CPU (Intel i5 / AMD Ryzen 5 / Apple Silicon or equivalent)",
  ],
  recommended: [
    "Windows 10/11, macOS 14+, or Linux x86_64",
    "16GB+ RAM",
    "20GB+ free disk space",
    "NVIDIA GPU with 6GB+ VRAM, or Apple Silicon",
    "SSD for faster model loading",
  ],
} as const;

/* ── Footer links ── */

export interface FooterColumn {
  title: string;
  links: (NavLink & { external?: boolean })[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "What is local AI?", href: "/what-is-local-ai" },
      { label: "Models", href: "/models" },
      { label: "Pricing", href: "/pricing" },
      { label: "Download", href: "/download" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Use cases",
    links: [
      { label: "For developers", href: "/for/developers" },
      { label: "For writers", href: "/for/writers" },
      { label: "For students", href: "/for/students" },
      { label: "For researchers", href: "/for/researchers" },
      { label: "For offline work", href: "/for/offline-work" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Learn", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  // Community is a placeholder. Footer.tsx detects an empty links
  // array on the Community title and renders a bespoke icon-row
  // block (with brand-coloured hovers) in this slot. Keeping the
  // entry here preserves column ordering across all consumers.
  {
    title: "Community",
    links: [],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

/* ── 404 copy ── */

export const NOT_FOUND = {
  headline: "Looks like you've gone off the grid.",
  description:
    "The page you're looking for doesn't exist. But don't worry, your data is still safe on your machine.",
  cta: "Back to Home",
} as const;
