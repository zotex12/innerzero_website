import {
  Cpu,
  Brain,
  Mic,
  MonitorCog,
  Shield,
  HardDrive,
  MessageSquare,
  Wrench,
  Moon as MoonIcon,
  Download,
  Smartphone,
  Users,
  Mail,
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
  { label: "Blog", href: "/blog" },
];

/* ── Hero copy ── */

export const HERO = {
  headline: "Your AI. Your machine. Your data.",
  tagline: "inner peace. inner joy. innerzero.",
  description:
    "InnerZero is a private AI assistant that runs entirely on your PC. No cloud. No tracking. Just you and your AI.",
  primaryCta: "Join the Waitlist",
  primaryCtaHref: "/waitlist",
  secondaryCta: "Learn more",
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
      "Your conversations never leave your machine. No cloud servers. No data uploads. Ever.",
  },
  {
    icon: Brain,
    title: "Learns & Remembers",
    description:
      "InnerZero builds personal memory from every conversation. It knows you better over time.",
  },
  {
    icon: Mic,
    title: "Voice + Text",
    description:
      "Talk to Zero or type — your choice. Full voice interaction with speech recognition and natural responses.",
  },
  {
    icon: MonitorCog,
    title: "Hardware-Aware",
    description:
      "InnerZero detects your PC's capabilities and automatically configures the best AI model for your system.",
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
    title: "Download & Install",
    description:
      "One click. InnerZero handles everything — dependencies, models, configuration.",
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
    "Memory stored in a local database — never uploaded",
    "The only network call is licence verification — and it sends nothing personal",
    "No telemetry. No tracking. No analytics on your usage.",
  ],
} as const;

/* ── Pricing ── */

export const PRICING = {
  planName: "InnerZero",
  monthly: "£9.99",
  monthlyPeriod: "/month",
  annual: "£79.99",
  annualPeriod: "/year",
  annualSaving: "Save 33%",
  trial: "14-day free trial — no card required",
  tagline:
    "Everything included. No tiers. No limits. Your hardware is the only limit.",
  features: [
    "Full local AI assistant",
    "Unlimited conversations",
    "Personal memory system",
    "Voice + text interaction",
    "Document knowledge base",
    "Smart tools (web search, files, calculations)",
    "Hardware-aware auto-configuration",
    "All future updates included",
  ],
} as const;

/* ── FAQ ── */

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "What happens after the trial?",
    answer:
      "After your 14-day free trial, you can subscribe to continue using InnerZero. If you choose not to subscribe, the app will stop working but your data stays on your machine — nothing is deleted.",
  },
  {
    question: "Do I need a powerful PC?",
    answer:
      "InnerZero works on a range of hardware. A modern CPU with 8GB+ RAM is the minimum. For the best experience, a dedicated GPU (NVIDIA with 6GB+ VRAM) is recommended. InnerZero automatically detects your hardware and selects the best AI model for your system.",
  },
  {
    question: "Is my data really private?",
    answer:
      "Yes. All AI processing happens on your machine. Your conversations, memory, and documents never leave your PC. The only network call InnerZero makes is to verify your subscription licence — and that sends nothing personal.",
  },
  {
    question: "Can I use Zero offline?",
    answer:
      "Yes. Once InnerZero is set up, the AI runs entirely on your hardware. You can use it without an internet connection. The only online requirement is periodic licence verification (once every 7 days).",
  },
  {
    question: "What AI models does it use?",
    answer:
      "InnerZero uses open-source AI models optimised for local use. It automatically selects and downloads the best model for your hardware during setup. Models are updated and improved over time through app updates.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account dashboard. You\u2019ll continue to have access until the end of your current billing period. No questions asked.",
  },
  {
    question: "What about updates?",
    answer:
      "All updates are included in your subscription. InnerZero checks for updates automatically and prompts you when a new version is available. Updates never overwrite your personal data.",
  },
  {
    question: "Will there be a Mac/Linux version?",
    answer:
      "Windows is the priority for launch. Mac and Linux versions are planned for the future. Join the waitlist to be notified when they become available.",
  },
];

/* ── Features page — detailed features ── */

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
      "InnerZero remembers your conversations, preferences, and facts — all stored locally in a secure database on your machine. Over time, Zero learns what matters to you and becomes more helpful. Your memory is yours alone.",
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description:
      "Speak to Zero and hear responses back. Full speech-to-text and text-to-speech built in. No cloud transcription services — everything is processed locally on your hardware for complete privacy.",
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
      "Web search, file management, calculations, URL fetching — Zero comes with built-in tools that extend what it can do. Tools are run locally and results are processed on your machine.",
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
      "Download, run the setup wizard, and start chatting. InnerZero handles all the technical complexity — downloading AI models, configuring your system, and setting up dependencies. No terminal required.",
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
    title: "Email Integration",
    description: "Let Zero manage and draft emails directly. Coming soon.",
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
    "Windows 10 (64-bit) or later",
    "8GB RAM",
    "10GB free disk space",
    "Modern CPU (Intel i5 / AMD Ryzen 5 or equivalent)",
  ],
  recommended: [
    "Windows 11 (64-bit)",
    "16GB+ RAM",
    "20GB+ free disk space",
    "NVIDIA GPU with 6GB+ VRAM",
    "SSD for faster model loading",
  ],
} as const;

/* ── Footer links ── */

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Download", href: "/download" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Waitlist", href: "/waitlist" },
    ],
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
    "The page you're looking for doesn't exist. But don't worry — your data is still safe on your machine.",
  cta: "Back to Home",
} as const;
