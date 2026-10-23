// Tests for the /vram-calculator data and lookup helpers in
// src/lib/vram-calculator.ts.
//
// Uses Node's built-in node:test + node:assert (no new dependencies). Run on
// demand from the CLI with a pinned ephemeral loader (no package.json change):
//
//   npx --yes tsx@4.19.2 --test tests/vram-calculator.test.ts
//
// The drift tests read the three source posts and compare every table cell
// with the constants, so a post edit that changes a figure fails here until
// the constant is updated in the same commit.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BELOW_8GB_RAM_ADVICE,
  CPU_GUIDANCE_NOTE,
  CPU_RAM_TARGETS,
  CPU_TABLE_HEADERS,
  DEFAULT_RAM_GB,
  DEFAULT_VRAM_GB,
  INVALID_INPUT_MESSAGE,
  MAX_RAM_GB,
  MAX_VRAM_GB,
  OVERFLOW_NOTE,
  QUANT_TARGETS,
  RAM_MINIMUM_GB,
  RESULT_SCOPE_NOTE,
  SETUP_DEFAULTS_NOTE,
  SHARED_MEMORY_NOTE,
  TOO_LARGE_INPUT_MESSAGE,
  VRAM_BANDS,
  VRAM_FAQ,
  VRAM_TABLE_HEADERS,
  buildCpuLadderAnswer,
  buildGpuLadderAnswer,
  cpuRamTarget,
  evaluateVram,
  formatGb,
  mapModelsToBands,
  parseGbInput,
  runsWithoutVram,
  summariseCpu,
  summariseVram,
} from "../src/lib/vram-calculator";
import { LOCAL_MODELS } from "../src/lib/models";

const ROOT = process.cwd();

function read(...parts: string[]): string {
  return readFileSync(join(ROOT, ...parts), "utf8");
}

function post(slug: string): string {
  return read("src", "content", "blog", `${slug}.mdx`);
}

function cells(line: string): string[] {
  return line
    .trim()
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
}

// Returns the body rows of the markdown table whose header row has exactly
// these cells. Fails if the header is missing or appears more than once.
function tableRows(source: string, header: readonly string[]): string[][] {
  const lines = source.split(/\r?\n/);
  const starts = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => l.trim().startsWith("|"))
    .filter(({ l }) => JSON.stringify(cells(l)) === JSON.stringify(header));
  assert.equal(starts.length, 1, `expected one table with header ${header.join(" | ")}`);
  const rows: string[][] = [];
  for (let i = starts[0].i + 1; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l.startsWith("|")) break;
    const c = cells(l);
    if (c.every((x) => /^:?-+:?$/.test(x))) continue;
    rows.push(c);
  }
  return rows;
}

// ── Drift tests ──────────────────────────────────────────────────────────

test("drift: VRAM_BANDS equal the how-much-vram-for-local-ai table cell by cell", () => {
  const rows = tableRows(post("how-much-vram-for-local-ai"), VRAM_TABLE_HEADERS);
  assert.deepEqual(
    rows,
    VRAM_BANDS.map((b) => [
      b.sizeLabel,
      b.approxQ4SizeLabel,
      b.recommendedVramLabel,
      b.cpuOnlyLabel,
    ]),
  );
});

test("drift: QUANT_TARGETS equal the what-is-llm-quantization table cell by cell", () => {
  const rows = tableRows(post("what-is-llm-quantization"), [
    "Your memory",
    "Reasonable target",
  ]);
  assert.deepEqual(
    rows,
    QUANT_TARGETS.map((q) => [q.memoryLabel, q.target]),
  );
});

test("drift: CPU_RAM_TARGETS equal the run-local-ai-without-gpu table cell by cell", () => {
  const rows = tableRows(post("run-local-ai-without-gpu"), CPU_TABLE_HEADERS);
  assert.deepEqual(
    rows,
    CPU_RAM_TARGETS.map((r) => [r.ramLabel, r.modelSize, r.whatYouCanDo]),
  );
});

test("drift: quoted sentences and rules of thumb are still published", () => {
  const cpu = post("run-local-ai-without-gpu");
  assert.ok(cpu.includes(`Below 8GB ${BELOW_8GB_RAM_ADVICE}`));
  assert.ok(cpu.includes("not a hard vendor spec"));

  const vram = post("how-much-vram-for-local-ai");
  assert.ok(
    vram.includes(
      "8 GB of VRAM is the comfortable starting point, and 12 to 16 GB covers the popular mid-size models",
    ),
  );
  assert.ok(
    vram.includes(
      "about 0.5 GB of memory per billion parameters for the weights, then add 1 to 2 GB of headroom",
    ),
  );

  const dl = post("ai-model-download-size-vram-impact");
  assert.ok(dl.includes("roughly the download size plus 1 to 2 GB"));
  assert.ok(dl.includes("Moving up to 8-bit roughly doubles the download and the memory footprint"));
  assert.ok(dl.includes("There is no separate VRAM pool, because the chip shares one unified memory space"));
  assert.ok(dl.includes("a small embedding model for memory"));

  const hardware = read("src", "lib", "hardware.ts");
  assert.ok(hardware.includes('id: "minimum"'));
  assert.ok(hardware.includes(`ram: "${RAM_MINIMUM_GB} GB"`));
  assert.ok(hardware.includes("No Local Model is a supported choice"));

  // RESULT_SCOPE_NOTE and SETUP_DEFAULTS_NOTE reuse the pillar's wording on
  // the conservative tier defaults. The page shows no tiers, so the setup note
  // says "hardware profile" (the desktop app guide's wording) instead.
  const pillar = read("src", "app", "what-is-local-ai", "page.tsx").replace(/\s+/g, " ");
  assert.ok(
    pillar.includes(
      "These defaults are deliberately conservative: each GPU tier leaves room for voice, speech recognition and the context window alongside the chat model",
    ),
  );
  assert.ok(pillar.includes("You can switch tier yourself from Manual Profiles in Settings."));
  assert.ok(SETUP_DEFAULTS_NOTE.includes("leave room for voice, speech recognition and the context window alongside the chat model"));
  assert.ok(SETUP_DEFAULTS_NOTE.includes("from Manual Profiles in Settings."));
  assert.ok(!/\btiers?\b/i.test(SETUP_DEFAULTS_NOTE));
  assert.ok(!/\btiers?\b/i.test(RESULT_SCOPE_NOTE));
});

// ── Self-consistency ─────────────────────────────────────────────────────

test("self-consistency: numeric fields match their labels and ascend", () => {
  for (const b of VRAM_BANDS) {
    assert.equal(b.recommendedVramMinGb, parseInt(b.recommendedVramLabel, 10));
    assert.equal(b.minParamsB, parseInt(b.sizeLabel, 10));
    assert.ok(b.minParamsB <= b.maxParamsB);
  }
  for (let i = 1; i < VRAM_BANDS.length; i++) {
    assert.ok(VRAM_BANDS[i].recommendedVramMinGb > VRAM_BANDS[i - 1].recommendedVramMinGb);
    assert.ok(VRAM_BANDS[i].minParamsB > VRAM_BANDS[i - 1].maxParamsB);
  }
  for (const q of QUANT_TARGETS) {
    assert.equal(q.minMemoryGb, parseInt(q.memoryLabel, 10));
    assert.equal(q.minMemoryGb, parseInt(q.displayLabel, 10));
  }
  for (const r of CPU_RAM_TARGETS) {
    assert.equal(r.minRamGb, parseInt(r.ramLabel, 10));
  }
  assert.equal(DEFAULT_VRAM_GB, 8);
  assert.equal(DEFAULT_RAM_GB, 16);
});

// ── VRAM lookup boundaries ───────────────────────────────────────────────

const VRAM_CASES: [number, string | null, boolean][] = [
  [0, null, false],
  [1, null, false],
  [1.9, null, false],
  [1.99, null, false],
  [2, "1-2b", false],
  [4, "3-4b", false],
  [5.9, "3-4b", false],
  [5.99, "3-4b", false],
  [5.999, "3-4b", false],
  [6, "7-8b", false],
  [7.9, "7-8b", false],
  [8, "7-8b", false],
  [10, "12-14b", false],
  [12, "12-14b", false],
  [16, "12-14b", false],
  [23.9, "12-14b", false],
  [24, "27-32b", false],
  [47, "27-32b", false],
  [48, "70b", true],
  [120, "70b", true],
];

for (const [gb, expected, beyond] of VRAM_CASES) {
  test(`evaluateVram(${gb}) -> ${expected ?? "none"}`, () => {
    const r = evaluateVram(gb);
    assert.equal(r.largestInRange?.id ?? null, expected);
    assert.equal(r.beyondTable, beyond);
    for (const b of r.bands) {
      assert.equal(b.withinRange, r.vramGb >= b.band.recommendedVramMinGb);
    }
    if (expected === null) {
      assert.ok(r.bands.every((b) => !b.withinRange));
    }
  });
}

test("runsWithoutVram: only the band whose recommendation ends in 'or none'", () => {
  assert.deepEqual(
    VRAM_BANDS.filter(runsWithoutVram).map((b) => b.id),
    ["1-2b"],
  );
});

test("evaluateVram: 5.99 and 5.999 stay below the 6 GB threshold and echo 5.99", () => {
  assert.equal(evaluateVram(5.99).vramGb, 5.99);
  assert.equal(evaluateVram(5.999).vramGb, 5.99);
  const s = summariseVram(evaluateVram(5.999));
  assert.ok(s.startsWith("With 5.99 GB of VRAM,"));
  assert.ok(s.includes("3 to 4 billion"));
});

// ── Exact strings ────────────────────────────────────────────────────────

test("summariseVram: exact strings", () => {
  assert.equal(
    summariseVram(evaluateVram(8)),
    "With 8 GB of VRAM, the guide's table puts models up to about 7 to 8 billion parameters within range at 4-bit quantization.",
  );
  assert.equal(
    summariseVram(evaluateVram(120)),
    "With 120 GB of VRAM, the guide's table puts models up to about 70 billion parameters within range at 4-bit quantization. The table stops at 70 billion parameters.",
  );
  assert.equal(
    summariseVram(evaluateVram(1)),
    "1 GB of VRAM is below the 2 GB the guide's table starts at for the smallest models, 1 to 2 billion parameters, but those also run on the CPU with no graphics card.",
  );
});

test("ladder answers: exact strings", () => {
  assert.equal(
    buildGpuLadderAnswer(),
    "At 4-bit quantization, our VRAM guide recommends 2 to 4 GB or none for 1 to 2 billion parameters, 4 to 6 GB for 3 to 4 billion, 6 to 8 GB for 7 to 8 billion, 10 to 12 GB for 12 to 14 billion, 24 GB for 27 to 32 billion, and 48 GB or multi-GPU for 70 billion. All figures are approximate.",
  );
  assert.equal(
    buildCpuLadderAnswer(),
    "With no graphics card the model runs on your CPU using system RAM, more slowly than on a GPU. Our guide to running local AI without a GPU gives these realistic model sizes. 8GB of RAM: 1B to 4B (4-bit). 16GB: 7B to 8B (4-bit), or gpt-oss 20B. 32GB+: 8B comfortably, larger when patient. These are general examples, not a list of the models InnerZero installs.",
  );
});

// ── CPU lookup ───────────────────────────────────────────────────────────

test("cpuRamTarget: row boundaries", () => {
  assert.equal(cpuRamTarget(3), null);
  assert.equal(cpuRamTarget(7.9), null);
  assert.equal(cpuRamTarget(8)?.ramLabel, "8GB");
  assert.equal(cpuRamTarget(15)?.ramLabel, "8GB");
  assert.equal(cpuRamTarget(15.99)?.ramLabel, "8GB");
  assert.equal(cpuRamTarget(15.999)?.ramLabel, "8GB");
  assert.equal(cpuRamTarget(16)?.ramLabel, "16GB");
  assert.equal(cpuRamTarget(31)?.ramLabel, "16GB");
  assert.equal(cpuRamTarget(32)?.ramLabel, "32GB+");
  assert.equal(cpuRamTarget(256)?.ramLabel, "32GB+");
});

test("summariseCpu: floor, tiny model and quoted rows", () => {
  assert.ok(summariseCpu(3).includes(`${RAM_MINIMUM_GB} GB minimum`));
  assert.ok(summariseCpu(3.99).includes("below the 4 GB minimum"));
  assert.equal(
    summariseCpu(4),
    `With 4 GB of RAM and CPU only, ${BELOW_8GB_RAM_ADVICE}`,
  );
  assert.ok(summariseCpu(7.9).includes("tiny model"));
  assert.equal(
    summariseCpu(16),
    "With 16 GB of RAM and CPU only, our guide to running local AI without a GPU gives a realistic model size of 7B to 8B (4-bit), or gpt-oss 20B.",
  );
  const s = summariseCpu(15.99);
  assert.ok(s.startsWith("With 15.99 GB of RAM"));
  assert.ok(s.includes("1B to 4B (4-bit)"));
  assert.ok(summariseCpu(15.999).startsWith("With 15.99 GB of RAM"));
});

// ── Input parsing ────────────────────────────────────────────────────────

test("parseGbInput: empty and invalid input", () => {
  for (const raw of ["", "  "]) {
    assert.deepEqual(parseGbInput(raw, MAX_VRAM_GB), { kind: "empty" });
  }
  for (const raw of ["abc", "-1", "NaN", "Infinity", "1e3", ".", "8.8.8", "8 GB"]) {
    assert.deepEqual(parseGbInput(raw, MAX_VRAM_GB), { kind: "invalid" }, raw);
  }
});

test("parseGbInput: valid input is truncated to 2 decimals, never rounded", () => {
  const ok = (value: number, display: string) => ({ kind: "ok", value, display });
  assert.deepEqual(parseGbInput("8", MAX_VRAM_GB), ok(8, "8"));
  assert.deepEqual(parseGbInput(" 7.5 ", MAX_VRAM_GB), ok(7.5, "7.5"));
  assert.deepEqual(parseGbInput("08", MAX_VRAM_GB), ok(8, "8"));
  assert.deepEqual(parseGbInput("0", MAX_VRAM_GB), ok(0, "0"));
  assert.deepEqual(parseGbInput("5.99", MAX_VRAM_GB), ok(5.99, "5.99"));
  assert.deepEqual(parseGbInput("5.999", MAX_VRAM_GB), ok(5.99, "5.99"));
  assert.deepEqual(parseGbInput("15.999", MAX_RAM_GB), ok(15.99, "15.99"));
  assert.deepEqual(parseGbInput("6.000", MAX_VRAM_GB), ok(6, "6"));
  assert.deepEqual(parseGbInput(".5", MAX_VRAM_GB), ok(0.5, "0.5"));
  assert.deepEqual(parseGbInput("8.", MAX_VRAM_GB), ok(8, "8"));
});

test("parseGbInput: out-of-range input is reported, not clamped", () => {
  assert.deepEqual(parseGbInput("5000", MAX_VRAM_GB), { kind: "too-large" });
  assert.deepEqual(parseGbInput("1024.5", MAX_VRAM_GB), { kind: "too-large" });
  assert.deepEqual(parseGbInput(String(MAX_VRAM_GB), MAX_VRAM_GB), {
    kind: "ok",
    value: MAX_VRAM_GB,
    display: String(MAX_VRAM_GB),
  });
  assert.equal(parseGbInput("2048", MAX_RAM_GB).kind, "ok");
  assert.equal(parseGbInput("2049", MAX_RAM_GB).kind, "too-large");
});

test("formatGb: truncates without crossing a threshold", () => {
  assert.equal(formatGb(8), "8");
  assert.equal(formatGb(5.999), "5.99");
  assert.equal(formatGb(15.999), "15.99");
  assert.equal(formatGb(7.5), "7.5");
  assert.equal(formatGb(6.001), "6");
});

// ── Catalogue examples ───────────────────────────────────────────────────

test("mapModelsToBands: catalogue examples per band from src/lib/models.ts", () => {
  const { byBand, unmapped } = mapModelsToBands(LOCAL_MODELS);
  assert.deepEqual(byBand, {
    "1-2b": ["Gemma 3 1B"],
    "3-4b": ["Qwen 3 4B", "Gemma 3 4B"],
    "7-8b": ["Qwen 3 8B"],
    "12-14b": ["Qwen 3 14B", "Gemma 3 12B"],
    "27-32b": ["Qwen 3 30B", "Qwen 3 32B"],
    "70b": [],
  });
  assert.deepEqual(unmapped, ["Qwen 3 235B", "gpt-oss 120B"]);
});

// ── FAQ shape ────────────────────────────────────────────────────────────

test("VRAM_FAQ: six items, distinct from the VRAM post's own FAQ questions", () => {
  assert.equal(VRAM_FAQ.length, 6);
  const postFaq = post("how-much-vram-for-local-ai")
    .split(/\r?\n/)
    .filter((l) => l.startsWith("### "))
    .map((l) => l.slice(4).trim().toLowerCase());
  for (const item of VRAM_FAQ) {
    assert.ok(!postFaq.includes(item.question.toLowerCase()), item.question);
  }
  assert.equal(VRAM_FAQ[0].answer, buildGpuLadderAnswer());
  assert.equal(VRAM_FAQ[4].answer, buildCpuLadderAnswer());
});

// ── Copy hygiene ─────────────────────────────────────────────────────────

// Written with escapes and character classes so this file itself carries no
// banned character or phrase for the repo-wide added-line scans.
const DASHES = /[\u2013\u2014]/;
const PERMANENCE = /free\s+forever|always\s+free|for\s+life|perman[e]nt/i;
const TIER_WORDING = /fre[e]mium|free\s+tier|free\s+plan/i;
const BRAND_MISSPELLING = /Inner\s+Zero|Inner[z]ero|inner[Z]ero/;
const FIT_WORDING = /\bfits?\b/i;

function copyStrings(): string[] {
  const out: string[] = [];
  for (const b of VRAM_BANDS) {
    out.push(b.sizeLabel, b.approxQ4SizeLabel, b.recommendedVramLabel, b.cpuOnlyLabel);
  }
  for (const q of QUANT_TARGETS) out.push(q.memoryLabel, q.displayLabel, q.target);
  for (const r of CPU_RAM_TARGETS) out.push(r.ramLabel, r.modelSize, r.whatYouCanDo);
  for (const f of VRAM_FAQ) out.push(f.question, f.answer);
  out.push(...VRAM_TABLE_HEADERS, ...CPU_TABLE_HEADERS);
  out.push(
    BELOW_8GB_RAM_ADVICE,
    CPU_GUIDANCE_NOTE,
    RESULT_SCOPE_NOTE,
    SETUP_DEFAULTS_NOTE,
    OVERFLOW_NOTE,
    SHARED_MEMORY_NOTE,
    INVALID_INPUT_MESSAGE,
    TOO_LARGE_INPUT_MESSAGE,
  );
  for (const gb of [0, 1, 1.9, 2, 5.99, 6, 8, 16, 24, 48, 120]) {
    out.push(summariseVram(evaluateVram(gb)));
  }
  for (const gb of [3, 4, 7.9, 8, 15.99, 16, 32]) out.push(summariseCpu(gb));
  return out;
}

test("copy hygiene: data, FAQ, notes and summaries", () => {
  for (const s of copyStrings()) {
    assert.ok(!DASHES.test(s), `dash in: ${s}`);
    assert.ok(!s.includes("<"), `'<' in: ${s}`);
    assert.ok(!PERMANENCE.test(s), `permanence wording in: ${s}`);
    assert.ok(!TIER_WORDING.test(s), `tier wording in: ${s}`);
    assert.ok(!BRAND_MISSPELLING.test(s), `brand misspelling in: ${s}`);
    assert.ok(!FIT_WORDING.test(s), `fit wording in: ${s}`);
  }
});

test("copy hygiene: the page and island source files", () => {
  const files = [
    read("src", "app", "(marketing)", "vram-calculator", "page.tsx"),
    read("src", "app", "(marketing)", "vram-calculator", "VramCalculator.tsx"),
    read("src", "lib", "vram-calculator.ts"),
  ];
  for (const f of files) {
    assert.ok(!DASHES.test(f));
    assert.ok(!PERMANENCE.test(f));
    assert.ok(!TIER_WORDING.test(f));
    assert.ok(!BRAND_MISSPELLING.test(f));
    assert.ok(!/\bFits\b/.test(f));
  }
  // Only the island is a client component.
  assert.ok(!files[0].includes('"use client"'));
  assert.ok(files[1].startsWith('"use client"'));
  assert.ok(!files[2].includes('"use client"'));
  // The data module has no runtime import, so models.ts stays server-side.
  const imports = files[2].split(/\r?\n/).filter((l) => l.startsWith("import "));
  assert.deepEqual(imports, ['import type { LocalModel } from "./models";']);
});
