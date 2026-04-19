// Source-of-truth catalogue for the /models reference page.
//
// Data derived strictly from the authoritative desktop docs:
//  - Local families: `install_profile.py` tier table + Unrestricted Mode
//    section of CLAUDE.md (base families only; abliterated mappings are
//    experimental and excluded from this public page).
//  - Cloud providers and their model IDs: "7 supported providers" section
//    of CLAUDE.md.
//
// This file deliberately carries zero pricing figures, zero benchmark
// numbers, zero performance claims, and zero context-window sizes. Every
// one of those drifts faster than we can update it. The linked provider
// pricing pages are the only pricing source of truth for readers.

export const lastReviewed = "2026-04-19";

// ── Local models ─────────────────────────────────────────────────────────

export type LocalTier =
  | "basic"
  | "entry"
  | "standard"
  | "performance"
  | "pro"
  | "enterprise"
  | "frontier";

export type LocalBackend = "ollama" | "lmstudio" | "both";

export interface LocalModel {
  id: string;
  displayName: string;
  family: string;
  sizes: string[];
  backend: LocalBackend;
  minimumTier: LocalTier;
  license: string;
  officialUrl: string;
}

export const LOCAL_MODELS: LocalModel[] = [
  {
    id: "qwen3",
    displayName: "Qwen 3",
    family: "Qwen",
    // Sizes pulled from install_profile.py tier table (4B, 8B, 14B, 30B,
    // 235B) and the Unrestricted Mode mapping section (32B variant).
    sizes: ["4B", "8B", "14B", "30B", "32B", "235B"],
    backend: "both",
    // Smallest size (qwen3:4b) is the default director model on the
    // basic hardware tier, so basic is the minimum.
    minimumTier: "basic",
    license: "Apache 2.0",
    officialUrl: "https://ollama.com/library/qwen3",
  },
  {
    id: "gemma3",
    displayName: "Gemma 3",
    family: "Gemma",
    // Sizes present across the tier table (1B, 4B, 12B voice model
    // assignments) and Unrestricted Mode mapping section.
    sizes: ["1B", "4B", "12B"],
    backend: "both",
    // gemma3:1b first appears as the voice model on the entry tier.
    minimumTier: "entry",
    license: "Gemma Terms of Use",
    officialUrl: "https://ollama.com/library/gemma3",
  },
  {
    id: "gpt-oss",
    displayName: "gpt-oss",
    family: "gpt-oss",
    // Only the 120B size is referenced in the tier table (pro and
    // enterprise director slots). No smaller variant is supported by
    // the desktop app today.
    sizes: ["120B"],
    backend: "both",
    minimumTier: "pro",
    license: "Apache 2.0",
    officialUrl: "https://ollama.com/library/gpt-oss",
  },
];

// ── Cloud models ─────────────────────────────────────────────────────────

export type CloudProvider =
  | "DeepSeek"
  | "OpenAI"
  | "Anthropic"
  | "Google"
  | "Qwen"
  | "xAI"
  | "Kimi";

export type CloudAccess = "managed" | "byo";

export interface CloudModel {
  id: string;
  displayName: string;
  provider: CloudProvider;
  modelId: string;
  access: CloudAccess[];
  providerPricingUrl: string;
}

// Provider-level canonical pricing pages. Reader follows these for
// current rates; they change too often for a static site to track.
const PROVIDER_PRICING_URLS: Record<CloudProvider, string> = {
  DeepSeek: "https://api-docs.deepseek.com/quick_start/pricing",
  OpenAI: "https://openai.com/api/pricing/",
  Anthropic: "https://www.anthropic.com/pricing",
  Google: "https://ai.google.dev/gemini-api/docs/pricing",
  Qwen: "https://www.alibabacloud.com/help/en/model-studio/getting-started/models",
  xAI: "https://docs.x.ai/docs/models",
  Kimi: "https://platform.moonshot.ai/docs/pricing/chat-completion",
};

// Access tiers per the task: managed-capable providers are DeepSeek,
// Google, and Anthropic. OpenAI, xAI, Qwen, and Kimi are BYO-only today.
const MANAGED_AND_BYO: CloudAccess[] = ["managed", "byo"];
const BYO_ONLY: CloudAccess[] = ["byo"];

function cloud(
  provider: CloudProvider,
  modelId: string,
  displayName: string,
): CloudModel {
  return {
    id: `${provider.toLowerCase().replace(/\s+/g, "-")}-${modelId}`,
    displayName,
    provider,
    modelId,
    access:
      provider === "DeepSeek" || provider === "Google" || provider === "Anthropic"
        ? MANAGED_AND_BYO
        : BYO_ONLY,
    providerPricingUrl: PROVIDER_PRICING_URLS[provider],
  };
}

export const CLOUD_MODELS: CloudModel[] = [
  // DeepSeek (managed + BYO)
  cloud("DeepSeek", "deepseek-chat", "DeepSeek V3.2"),
  cloud("DeepSeek", "deepseek-reasoner", "DeepSeek R1"),

  // OpenAI (BYO only)
  cloud("OpenAI", "gpt-5.4", "GPT-5.4"),
  cloud("OpenAI", "gpt-5.4-mini", "GPT-5.4 Mini"),
  cloud("OpenAI", "gpt-4.1", "GPT-4.1"),
  cloud("OpenAI", "gpt-4o", "GPT-4o"),
  cloud("OpenAI", "o3", "o3"),
  cloud("OpenAI", "o4-mini", "o4 Mini"),
  cloud("OpenAI", "gpt-5.3-codex", "GPT-5.3 Codex"),
  cloud("OpenAI", "gpt-5.3-chat", "GPT-5.3 Chat"),

  // Anthropic (managed + BYO)
  cloud("Anthropic", "claude-opus-4-7", "Claude Opus 4.7"),
  cloud("Anthropic", "claude-opus-4-6", "Claude Opus 4.6"),
  cloud("Anthropic", "claude-sonnet-4-6", "Claude Sonnet 4.6"),
  cloud("Anthropic", "claude-haiku-4-5-20251001", "Claude Haiku 4.5"),

  // Google (managed + BYO)
  cloud("Google", "gemini-2.5-flash", "Gemini 2.5 Flash"),
  cloud("Google", "gemini-2.5-pro", "Gemini 2.5 Pro"),

  // Qwen (BYO only)
  cloud("Qwen", "qwen-max", "Qwen Max"),
  cloud("Qwen", "qwen-plus", "Qwen Plus"),
  cloud("Qwen", "qwen-turbo", "Qwen Turbo"),
  cloud("Qwen", "qwen3-coder-plus", "Qwen3 Coder Plus"),

  // xAI (BYO only)
  cloud("xAI", "grok-4.20-reasoning", "Grok 4.20 Reasoning"),
  cloud("xAI", "grok-4.20-non-reasoning", "Grok 4.20"),
  cloud("xAI", "grok-4-1-fast-reasoning", "Grok 4.1 Fast Reasoning"),
  cloud("xAI", "grok-4-1-fast-non-reasoning", "Grok 4.1 Fast"),
  cloud("xAI", "grok-4", "Grok 4"),
  cloud("xAI", "grok-3", "Grok 3"),

  // Kimi / Moonshot (BYO only)
  cloud("Kimi", "kimi-k2.5", "Kimi K2.5"),
];

// Stable ordering for the page: groups the providers in the order the
// desktop's "7 supported providers" section lists them.
export const PROVIDER_ORDER: CloudProvider[] = [
  "DeepSeek",
  "OpenAI",
  "Anthropic",
  "Google",
  "Qwen",
  "xAI",
  "Kimi",
];
