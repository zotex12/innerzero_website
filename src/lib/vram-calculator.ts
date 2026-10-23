// Data and lookup helpers for the /vram-calculator page.
//
// Every figure here is copied verbatim from tables already published on the
// site. Nothing is computed from a formula, because the VRAM guide's own rule
// of thumb does not reproduce its table. tests/vram-calculator.test.ts reads
// the source posts and fails on any drift, so a post edit must update the
// constant here in the same commit.
//
//   VRAM_BANDS       src/content/blog/how-much-vram-for-local-ai.mdx, the
//                    "| Model size | Approx 4-bit size | Recommended VRAM |
//                    Runs on CPU only? |" table (6 rows).
//   QUANT_TARGETS    src/content/blog/what-is-llm-quantization.mdx, the
//                    "| Your memory | Reasonable target |" table (4 rows).
//   CPU_RAM_TARGETS  src/content/blog/run-local-ai-without-gpu.mdx, the
//                    "| Your RAM | Realistic model size | What you can do |"
//                    table (3 rows) plus the "Below 8GB" FAQ sentence.
//   RAM_MINIMUM_GB   desktop install_profile.py:50 ("InnerZero requires at
//                    least 4 GB RAM") and src/lib/hardware.ts minimum tier,
//                    whose notes also back the no-local-model sentence.
//
// Pure TypeScript with no runtime imports, so the client island can import
// it without pulling src/lib/models.ts into the browser bundle.

import type { LocalModel } from "./models";

// ── VRAM bands (how-much-vram-for-local-ai) ──────────────────────────────

export type VramBandId = "1-2b" | "3-4b" | "7-8b" | "12-14b" | "27-32b" | "70b";

export interface VramBand {
  id: VramBandId;
  sizeLabel: string;
  minParamsB: number;
  maxParamsB: number;
  approxQ4SizeLabel: string;
  recommendedVramLabel: string;
  // Lower end of the "Recommended VRAM" cell. A band counts as within the
  // guide's range when the entered VRAM is at least this figure.
  recommendedVramMinGb: number;
  cpuOnlyLabel: string;
}

// Column headings of the source table, rendered verbatim on the page.
export const VRAM_TABLE_HEADERS = [
  "Model size",
  "Approx 4-bit size",
  "Recommended VRAM",
  "Runs on CPU only?",
] as const;

export const VRAM_BANDS: readonly VramBand[] = [
  {
    id: "1-2b",
    sizeLabel: "1 to 2 billion",
    minParamsB: 1,
    maxParamsB: 2,
    approxQ4SizeLabel: "About 1 GB",
    recommendedVramLabel: "2 to 4 GB or none",
    recommendedVramMinGb: 2,
    cpuOnlyLabel: "Yes, easily",
  },
  {
    id: "3-4b",
    sizeLabel: "3 to 4 billion",
    minParamsB: 3,
    maxParamsB: 4,
    approxQ4SizeLabel: "About 2 to 3 GB",
    recommendedVramLabel: "4 to 6 GB",
    recommendedVramMinGb: 4,
    cpuOnlyLabel: "Yes, usable",
  },
  {
    id: "7-8b",
    sizeLabel: "7 to 8 billion",
    minParamsB: 7,
    maxParamsB: 8,
    approxQ4SizeLabel: "About 4 to 5 GB",
    recommendedVramLabel: "6 to 8 GB",
    recommendedVramMinGb: 6,
    cpuOnlyLabel: "Yes, slower",
  },
  {
    id: "12-14b",
    sizeLabel: "12 to 14 billion",
    minParamsB: 12,
    maxParamsB: 14,
    approxQ4SizeLabel: "About 8 to 9 GB",
    recommendedVramLabel: "10 to 12 GB",
    recommendedVramMinGb: 10,
    cpuOnlyLabel: "Possible, slow",
  },
  {
    id: "27-32b",
    sizeLabel: "27 to 32 billion",
    minParamsB: 27,
    maxParamsB: 32,
    approxQ4SizeLabel: "About 18 to 20 GB",
    recommendedVramLabel: "24 GB",
    recommendedVramMinGb: 24,
    cpuOnlyLabel: "Hard, very slow",
  },
  {
    id: "70b",
    sizeLabel: "70 billion",
    minParamsB: 70,
    maxParamsB: 70,
    approxQ4SizeLabel: "About 40 GB",
    recommendedVramLabel: "48 GB or multi-GPU",
    recommendedVramMinGb: 48,
    cpuOnlyLabel: "Not practical",
  },
];

// ── Quantization examples (what-is-llm-quantization) ─────────────────────

export interface QuantTarget {
  // Verbatim "Your memory" cell, pinned by the drift test.
  memoryLabel: string;
  // What the page shows as the row heading. The page applies these rows to
  // graphics card memory only; CPU-only guidance comes from CPU_RAM_TARGETS.
  displayLabel: string;
  minMemoryGb: number;
  // Verbatim "Reasonable target" cell. Each one names its own model size.
  target: string;
}

export const QUANT_TARGETS: readonly QuantTarget[] = [
  {
    memoryLabel: "8GB VRAM or RAM",
    displayLabel: "8 GB of VRAM",
    minMemoryGb: 8,
    target: "A 7B to 8B model at Q4_K_M",
  },
  {
    memoryLabel: "12GB",
    displayLabel: "12 GB of VRAM",
    minMemoryGb: 12,
    target: "An 8B model at Q5_K_M or Q6_K, or a 14B at Q4_K_M",
  },
  {
    memoryLabel: "16GB",
    displayLabel: "16 GB of VRAM",
    minMemoryGb: 16,
    target: "A 14B model at Q4_K_M to Q5_K_M comfortably",
  },
  {
    memoryLabel: "24GB+",
    displayLabel: "24 GB of VRAM or more",
    minMemoryGb: 24,
    target: "A 14B at Q8_0, or a larger model at Q4_K_M",
  },
];

// ── CPU-only guidance (run-local-ai-without-gpu) ─────────────────────────

export interface CpuRamTarget {
  ramLabel: string;
  minRamGb: number;
  modelSize: string;
  whatYouCanDo: string;
}

// Column headings of the source table, rendered verbatim on the page.
export const CPU_TABLE_HEADERS = [
  "Your RAM",
  "Realistic model size",
  "What you can do",
] as const;

// Quoted guidance only. These rows are general examples from the post, not a
// list of the models InnerZero installs (gpt-oss 20B is not in LOCAL_MODELS),
// so the page never maps them onto the model catalogue or a size ceiling.
export const CPU_RAM_TARGETS: readonly CpuRamTarget[] = [
  {
    ramLabel: "8GB",
    minRamGb: 8,
    modelSize: "1B to 4B (4-bit)",
    whatYouCanDo: "Chat, writing help, summaries, simple questions",
  },
  {
    ramLabel: "16GB",
    minRamGb: 16,
    modelSize: "7B to 8B (4-bit), or gpt-oss 20B",
    whatYouCanDo: "Solid daily assistant, light coding help",
  },
  {
    ramLabel: "32GB+",
    minRamGb: 32,
    modelSize: "8B comfortably, larger when patient",
    whatYouCanDo: "Headroom for big context and multitasking",
  },
];

// Verbatim from the run-local-ai-without-gpu FAQ ("Below 8GB you can still
// run a tiny model, ..."). The drift test checks the post still says it.
export const BELOW_8GB_RAM_ADVICE =
  "you can still run a tiny model, but keep your prompts short to avoid the system swapping to disk.";

// ── Constants ────────────────────────────────────────────────────────────

export const DEFAULT_VRAM_GB = 8;
export const DEFAULT_RAM_GB = 16;
// install_profile.py:50 and src/lib/hardware.ts (minimum tier, ram "4 GB").
export const RAM_MINIMUM_GB = 4;
// Input bounds only. Never displayed as a claim about hardware.
export const MAX_VRAM_GB = 1024;
export const MAX_RAM_GB = 2048;

export const VRAM_SOURCE_SLUG = "how-much-vram-for-local-ai";
export const QUANT_SOURCE_SLUG = "what-is-llm-quantization";
export const CPU_SOURCE_SLUG = "run-local-ai-without-gpu";

// ── Fixed copy shared by the island and the tests ────────────────────────

// The last sentence reuses the /what-is-local-ai wording on InnerZero's
// conservative tier defaults (checked against install_profile.py in the
// what-is-local-ai-tier-facts phase); the drift test checks the pillar still
// says it.
export const RESULT_SCOPE_NOTE =
  "This estimates memory for one chat model. It does not check GPU compatibility or InnerZero's full setup, which the setup wizard handles when you install. InnerZero's defaults are deliberately conservative, so setup may pick a smaller model than the largest size shown here.";

export const SETUP_DEFAULTS_NOTE =
  "On a graphics card, its defaults leave room for voice, speech recognition and the context window alongside the chat model, and you can pick a different hardware profile yourself from Manual Profiles in Settings.";

export const OVERFLOW_NOTE =
  "A model a little larger than your VRAM may run partly in system RAM, more slowly, if you have enough RAM and your backend supports it.";

export const SHARED_MEMORY_NOTE =
  "On an Apple Silicon Mac or a PC with integrated graphics, the GPU shares system memory, so there is no separate VRAM figure to enter. On those machines, let InnerZero's setup wizard decide.";

export const INVALID_INPUT_MESSAGE =
  "Enter a number of gigabytes, for example 8.";

export const TOO_LARGE_INPUT_MESSAGE =
  "That is more than this calculator accepts. Check the number of gigabytes and try again.";

export const CPU_GUIDANCE_NOTE =
  "General examples from our guide to running local AI without a GPU, not a list of the models InnerZero installs.";

// ── Input handling: one precision policy ─────────────────────────────────
//
// Input is truncated (never rounded) to 2 decimal places as a string, and
// that exact value is both evaluated and echoed back. Truncation keeps every
// comparison against a whole-number threshold the same as for the raw input,
// so 5.999 shows as 5.99 and is treated as below 6, never as "6".

export type GbInput =
  | { kind: "ok"; value: number; display: string }
  | { kind: "empty" }
  | { kind: "invalid" }
  | { kind: "too-large" };

const GB_PATTERN = /^(\d*)(?:\.(\d*))?$/;

export function parseGbInput(raw: string, max: number): GbInput {
  const s = raw.trim();
  if (s === "") return { kind: "empty" };
  const m = GB_PATTERN.exec(s);
  if (!m) return { kind: "invalid" };
  const wholeDigits = m[1];
  const fractionDigits = m[2] ?? "";
  if (wholeDigits === "" && fractionDigits === "") return { kind: "invalid" };
  const whole = (wholeDigits === "" ? "0" : wholeDigits).replace(/^0+(?=\d)/, "");
  const decimals = fractionDigits.slice(0, 2).replace(/0+$/, "");
  const display = decimals ? `${whole}.${decimals}` : whole;
  const value = Number(display);
  if (!Number.isFinite(value)) return { kind: "invalid" };
  if (value > max) return { kind: "too-large" };
  return { kind: "ok", value, display };
}

// Same truncation for values that arrive as numbers (tests, defaults).
export function formatGb(v: number): string {
  const s = String(v);
  const dot = s.indexOf(".");
  if (dot === -1 || s.includes("e")) return s;
  const decimals = s.slice(dot + 1, dot + 3).replace(/0+$/, "");
  return decimals ? `${s.slice(0, dot)}.${decimals}` : s.slice(0, dot);
}

function truncateGb(v: number): number {
  return Number(formatGb(v));
}

// ── VRAM lookup ──────────────────────────────────────────────────────────

export interface BandStatus {
  band: VramBand;
  withinRange: boolean;
}

export interface VramResult {
  vramGb: number;
  bands: BandStatus[];
  largestInRange: VramBand | null;
  beyondTable: boolean;
}

export function evaluateVram(vramGb: number): VramResult {
  const v = truncateGb(vramGb);
  const bands = VRAM_BANDS.map((band) => ({
    band,
    withinRange: v >= band.recommendedVramMinGb,
  }));
  let largestInRange: VramBand | null = null;
  for (const b of bands) {
    if (b.withinRange) largestInRange = b.band;
  }
  const last = VRAM_BANDS[VRAM_BANDS.length - 1];
  return {
    vramGb: v,
    bands,
    largestInRange,
    beyondTable: largestInRange !== null && largestInRange.id === last.id,
  };
}

// True for a band whose "Recommended VRAM" cell ends in "or none" (the
// smallest size), which the guide says also runs with no graphics card. The
// island shows a neutral badge for it instead of "below the recommendation".
export function runsWithoutVram(band: VramBand): boolean {
  return /\bor none$/.test(band.recommendedVramLabel);
}

export function summariseVram(r: VramResult): string {
  const gb = formatGb(r.vramGb);
  const first = VRAM_BANDS[0];
  if (r.largestInRange === null) {
    return `${gb} GB of VRAM is below the ${first.recommendedVramMinGb} GB the guide's table starts at for the smallest models, ${first.sizeLabel} parameters, but those also run on the CPU with no graphics card.`;
  }
  const base = `With ${gb} GB of VRAM, the guide's table puts models up to about ${r.largestInRange.sizeLabel} parameters within range at 4-bit quantization.`;
  if (!r.beyondTable) return base;
  const last = VRAM_BANDS[VRAM_BANDS.length - 1];
  return `${base} The table stops at ${last.sizeLabel} parameters.`;
}

// ── CPU lookup ───────────────────────────────────────────────────────────

export function cpuRamTarget(ramGb: number): CpuRamTarget | null {
  const r = truncateGb(ramGb);
  let match: CpuRamTarget | null = null;
  for (const row of CPU_RAM_TARGETS) {
    if (r >= row.minRamGb) match = row;
  }
  return match;
}

export function summariseCpu(ramGb: number): string {
  const r = truncateGb(ramGb);
  const gb = formatGb(r);
  if (r < RAM_MINIMUM_GB) {
    return `With ${gb} GB of RAM, this PC is below the ${RAM_MINIMUM_GB} GB minimum InnerZero needs to run a local model. InnerZero can still work with no local model, on an optional cloud plan, your own API key, or an Ollama server on your network.`;
  }
  const row = cpuRamTarget(r);
  if (row === null) {
    return `With ${gb} GB of RAM and CPU only, ${BELOW_8GB_RAM_ADVICE}`;
  }
  return `With ${gb} GB of RAM and CPU only, our guide to running local AI without a GPU gives a realistic model size of ${row.modelSize}.`;
}

// ── Catalogue examples ───────────────────────────────────────────────────

export function parseModelSizeB(size: string): number | null {
  const m = /^(\d+(?:\.\d+)?)B$/i.exec(size.trim());
  return m ? Number(m[1]) : null;
}

export function bandForParams(p: number): VramBand | null {
  return VRAM_BANDS.find((b) => b.minParamsB <= p && p <= b.maxParamsB) ?? null;
}

// Maps catalogue entries ("Qwen 3 8B") onto the size bands as examples.
// Order follows the catalogue, then each family's size list.
export function mapModelsToBands(
  models: readonly Pick<LocalModel, "displayName" | "sizes">[],
): { byBand: Record<VramBandId, string[]>; unmapped: string[] } {
  const byBand = Object.fromEntries(
    VRAM_BANDS.map((b) => [b.id, [] as string[]]),
  ) as Record<VramBandId, string[]>;
  const unmapped: string[] = [];
  for (const model of models) {
    for (const size of model.sizes) {
      const name = `${model.displayName} ${size}`;
      const params = parseModelSizeB(size);
      const band = params === null ? null : bandForParams(params);
      if (band) byBand[band.id].push(name);
      else unmapped.push(name);
    }
  }
  return { byBand, unmapped };
}

// ── FAQ ──────────────────────────────────────────────────────────────────

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function buildGpuLadderAnswer(): string {
  const parts = VRAM_BANDS.map(
    (b, i) =>
      `${b.recommendedVramLabel} for ${b.sizeLabel}${i === 0 ? " parameters" : ""}`,
  );
  return `At 4-bit quantization, our VRAM guide recommends ${joinList(parts)}. All figures are approximate.`;
}

export function buildCpuLadderAnswer(): string {
  const rows = CPU_RAM_TARGETS.map(
    (row, i) =>
      `${row.ramLabel}${i === 0 ? " of RAM" : ""}: ${row.modelSize}.`,
  );
  return `With no graphics card the model runs on your CPU using system RAM, more slowly than on a GPU. Our guide to running local AI without a GPU gives these realistic model sizes. ${rows.join(" ")} These are general examples, not a list of the models InnerZero installs.`;
}

export interface VramFaqItem {
  question: string;
  answer: string;
}

export const VRAM_FAQ: readonly VramFaqItem[] = [
  {
    question: "How many parameters can my GPU handle?",
    answer: buildGpuLadderAnswer(),
  },
  {
    question: "Is 8 GB of VRAM enough for local AI?",
    answer:
      "For most people, yes. 8 GB is the comfortable starting point, and the guide's table puts popular 7 to 8 billion parameter models within range at 4-bit quantization. The 12 to 14 billion parameter size wants 10 to 12 GB.",
  },
  {
    question: "Is 16 GB of VRAM enough for local AI?",
    answer:
      "For models up to 12 to 14 billion parameters, yes. Our quantization guide suggests a 14B model at Q4_K_M to Q5_K_M runs comfortably on 16 GB. The 27 to 32 billion parameter size wants 24 GB.",
  },
  {
    question: "Does local AI use RAM or VRAM?",
    answer:
      "Both, depending on your hardware. With a graphics card the model loads into VRAM, which is fastest. With no graphics card, system RAM holds the model and the CPU does the work, which is slower. A model a little larger than your VRAM may run partly in system RAM, more slowly, if you have enough RAM and your backend supports it.",
  },
  {
    question: "What can I run with no graphics card?",
    answer: buildCpuLadderAnswer(),
  },
  {
    question: "How accurate is this VRAM calculator?",
    answer:
      "It gives approximate planning figures, not exact numbers. Context length, the exact quantization level and the model family all shift real memory use. It estimates one chat model and does not check GPU compatibility or InnerZero's full setup. A model uses roughly its download size plus 1 to 2 GB once loaded, so check the listed size before a big download.",
  },
];
