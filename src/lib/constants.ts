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
  Key,
  Gift,
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
    "InnerZero is a private AI assistant that runs entirely on your PC. Free forever. No cloud required. Just you and your AI.",
  primaryCta: "Download Free",
  primaryCtaHref: "/download",
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
      "Talk to Zero or type, your choice. Full voice interaction with speech recognition and natural responses.",
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
  price: "Free forever.",
  subtitle: "A complete private AI assistant on your PC. No account. No subscription. No catch.",
  features: [
    "Local AI chat and voice",
    "Personal memory system",
    "30+ built-in tools",
    "Document knowledge base",
    "Hardware-aware setup",
    "Sleep and reflection",
    "All themes included",
    "All future updates",
  ],
  cta: "Download Free",
  ctaHref: "/download",
} as const;

/* ── Pricing: Cloud AI plans (coming soon) ── */

export interface CloudPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
}

export const CLOUD_PLANS: CloudPlan[] = [
  {
    name: "Cloud Starter",
    price: "£9.99",
    period: "/month",
    features: ["300 credits/month", "Budget + Standard models", "Auto-routed model selection"],
  },
  {
    name: "Cloud Plus",
    price: "£19.99",
    period: "/month",
    features: ["800 credits/month", "All models including Premium", "Priority routing"],
  },
  {
    name: "Cloud Pro",
    price: "£39.99",
    period: "/month",
    features: ["2,000 credits/month", "All models including Ultra", "Priority routing"],
  },
];

/* ── Pricing: Supporter ── */

export const SUPPORTER = {
  price: "£4.99",
  period: "/month",
  description:
    "Fund development and get perks: supporter badge, extra themes, early access, Discord role, roadmap voting.",
  cta: "Become a Supporter",
  ctaHref: "https://ko-fi.com/innerzero",
} as const;

/* ── Pricing: Business Licence ── */

export const BUSINESS_LICENCE = {
  planName: "Business Licence",
  price: "£50",
  period: "/year",
  perSeat: "per seat",
  description:
    "Commercial use licence for InnerZero. Use it at work, in your business, or for any revenue-generating activity. Same free app, just the legal right to use it commercially.",
  features: [
    "Full InnerZero desktop app",
    "All local AI features",
    "BYO API keys supported",
    "Commercial & business use rights",
    "Annual billing, cancel anytime",
    "Invoice & receipt included",
  ],
  cta: "Buy Business Licence",
  ctaHref: "#",
} as const;

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
      "Optional. If you want faster reasoning or access to premium AI models (Claude, GPT, DeepSeek), you can subscribe to a cloud plan. Your local AI always works without one.",
  },
  {
    question: "Can I use my own API keys?",
    answer:
      "Yes. Add your own API keys from any supported provider: DeepSeek, OpenAI, Anthropic, and more. Zero markup. We never touch your keys.",
  },
  {
    question: "What does the Supporter tier include?",
    answer:
      "Supporter is a monthly donation to fund InnerZero development. You get a supporter badge, extra themes, early access to new features, and a Discord role. It does not include cloud AI credits.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. All AI processing, memory, and conversations stay on your machine. If you enable cloud mode, your prompts are forwarded to the AI provider and returned. InnerZero never stores or reads them.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. The local app works without any account. You only need an account if you want cloud AI plans, supporter perks, or future hosted features.",
  },
  {
    question: "When will cloud plans be available?",
    answer:
      "We're building cloud AI plans now. Join the waitlist to be the first to know when they launch.",
  },
  {
    question: "Do I need a licence to use InnerZero at work?",
    answer:
      "If you're using InnerZero for business, commercial, or revenue-generating purposes, yes, a Business Licence is required. It's £50/year per seat. The app is identical to the free version. The licence is just permission to use it commercially. Personal use, education, and non-profits are free.",
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
    "Windows 10/11 (64-bit)",
    "16GB+ RAM",
    "20GB+ free disk space",
    "NVIDIA GPU with 6GB+ VRAM",
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
      { label: "Pricing", href: "/pricing" },
      { label: "Download", href: "/download" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Learn", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Waitlist", href: "/waitlist" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "https://discord.gg/rn9SPXgThT", external: true },
      { label: "Support us", href: "https://ko-fi.com/innerzero", external: true },
      { label: "X (Twitter)", href: "https://x.com/InnerZero_ai", external: true },
      { label: "Instagram", href: "https://www.instagram.com/innerzero_ai", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/innerzero", external: true },
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
    "The page you're looking for doesn't exist. But don't worry, your data is still safe on your machine.",
  cta: "Back to Home",
} as const;
