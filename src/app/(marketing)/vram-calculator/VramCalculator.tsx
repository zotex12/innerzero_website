"use client";

// Interactive lookup for /vram-calculator. The only client component on the
// route: it holds the mode and the two raw input strings in state and derives
// everything else during render from the pure helpers in
// src/lib/vram-calculator.ts. No effects, no browser storage, no URL state, so
// the server HTML (the 8 GB example) and the first client render match.

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_RAM_GB,
  DEFAULT_VRAM_GB,
  INVALID_INPUT_MESSAGE,
  MAX_RAM_GB,
  MAX_VRAM_GB,
  OVERFLOW_NOTE,
  RAM_MINIMUM_GB,
  RESULT_SCOPE_NOTE,
  SHARED_MEMORY_NOTE,
  TOO_LARGE_INPUT_MESSAGE,
  cpuRamTarget,
  evaluateVram,
  parseGbInput,
  runsWithoutVram,
  summariseCpu,
  summariseVram,
  type CpuRamTarget,
  type GbInput,
  type VramBandId,
  type VramResult,
} from "@/lib/vram-calculator";

type Mode = "gpu" | "cpu";

interface VramCalculatorProps {
  // Catalogue examples per size band, computed on the server from
  // src/lib/models.ts so that file stays out of the client bundle.
  bandModels: Record<VramBandId, string[]>;
}

const MODES: { id: Mode; label: string }[] = [
  { id: "gpu", label: "Dedicated GPU memory (VRAM)" },
  { id: "cpu", label: "CPU only" },
];

const LINK_CLASSES =
  "text-accent-gold transition-colors hover:text-accent-gold-hover";

export function VramCalculator({ bandModels }: VramCalculatorProps) {
  const [mode, setMode] = useState<Mode>("gpu");
  const [vramRaw, setVramRaw] = useState(String(DEFAULT_VRAM_GB));
  const [ramRaw, setRamRaw] = useState(String(DEFAULT_RAM_GB));

  const isGpu = mode === "gpu";
  const parsed: GbInput = isGpu
    ? parseGbInput(vramRaw, MAX_VRAM_GB)
    : parseGbInput(ramRaw, MAX_RAM_GB);
  const invalid = parsed.kind !== "ok";

  let summary: string;
  let vram: VramResult | null = null;
  let cpuRow: CpuRamTarget | null = null;
  if (parsed.kind !== "ok") {
    summary =
      parsed.kind === "too-large"
        ? TOO_LARGE_INPUT_MESSAGE
        : INVALID_INPUT_MESSAGE;
  } else if (isGpu) {
    vram = evaluateVram(parsed.value);
    summary = summariseVram(vram);
  } else {
    cpuRow = cpuRamTarget(parsed.value);
    summary = summariseCpu(parsed.value);
  }

  const anyBelow = vram !== null && vram.bands.some((b) => !b.withinRange);
  // The scope note qualifies a size result, so it is left out for invalid or
  // too-large input and below the CPU minimum, where no size is shown.
  const showScopeNote =
    parsed.kind === "ok" && (isGpu || parsed.value >= RAM_MINIMUM_GB);

  return (
    <section
      aria-labelledby="calc-heading"
      className="rounded-xl border border-border-default bg-bg-card p-6 md:p-8"
    >
      <h2
        id="calc-heading"
        className="text-xl font-semibold text-text-primary md:text-2xl"
      >
        Check your hardware
      </h2>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-text-secondary">
          Where will the model run?
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {MODES.map((m) => {
            const checked = mode === m.id;
            return (
              <label key={m.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="vram-mode"
                  id={`vram-mode-${m.id}`}
                  value={m.id}
                  checked={checked}
                  onChange={() => setMode(m.id)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-accent-gold peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-card",
                    checked
                      ? "border-accent-gold bg-accent-gold-muted text-accent-gold"
                      : "border-border-default bg-bg-secondary text-text-secondary hover:border-border-hover hover:text-text-primary",
                  )}
                >
                  {m.label}
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-text-muted">{SHARED_MEMORY_NOTE}</p>
      </fieldset>

      <div className="mt-6 max-w-xs">
        {isGpu ? (
          <>
            <Input
              id="vram-gb"
              name="vram-gb"
              type="number"
              inputMode="decimal"
              min={0}
              max={MAX_VRAM_GB}
              step="any"
              label="Graphics card memory (VRAM) in GB"
              value={vramRaw}
              onChange={(e) => setVramRaw(e.target.value)}
              aria-describedby={
                invalid ? "vram-gb-hint vram-result" : "vram-gb-hint"
              }
              aria-invalid={invalid ? true : undefined}
              className="focus-visible:ring-accent-gold/60"
            />
            <p id="vram-gb-hint" className="mt-2 text-xs text-text-muted">
              On Windows: Task Manager, Performance, GPU, Dedicated GPU memory.
            </p>
          </>
        ) : (
          <>
            <Input
              id="ram-gb"
              name="ram-gb"
              type="number"
              inputMode="decimal"
              min={0}
              max={MAX_RAM_GB}
              step="any"
              label="System memory (RAM) in GB"
              value={ramRaw}
              onChange={(e) => setRamRaw(e.target.value)}
              aria-describedby={
                invalid ? "ram-gb-hint vram-result" : "ram-gb-hint"
              }
              aria-invalid={invalid ? true : undefined}
              className="focus-visible:ring-accent-gold/60"
            />
            <p id="ram-gb-hint" className="mt-2 text-xs text-text-muted">
              On Windows: Task Manager, Performance, Memory.
            </p>
          </>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-border-default bg-bg-secondary p-4 md:p-5">
        <p
          id="vram-result"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-base font-medium text-text-primary md:text-lg"
        >
          {summary}
        </p>
        {showScopeNote && (
          <p className="mt-2 text-sm text-text-muted">{RESULT_SCOPE_NOTE}</p>
        )}
      </div>

      {vram !== null && (
        <>
          <ul
            aria-label="Model sizes compared with your VRAM"
            className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {vram.bands.map(({ band, withinRange }) => {
              const examples = bandModels[band.id] ?? [];
              // The smallest size also runs with no VRAM ("or none"), so it
              // gets a neutral badge rather than "below the recommendation".
              const cpuFallback = !withinRange && runsWithoutVram(band);
              return (
                <li
                  key={band.id}
                  className="rounded-lg border border-border-default bg-bg-secondary p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {band.sizeLabel} parameters
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        withinRange
                          ? "bg-accent-teal-muted text-accent-teal"
                          : "border border-border-default bg-bg-card text-text-muted",
                      )}
                    >
                      {withinRange ? (
                        <Check className="h-3 w-3" aria-hidden="true" />
                      ) : cpuFallback ? null : (
                        <X className="h-3 w-3" aria-hidden="true" />
                      )}
                      {withinRange
                        ? "Within the guide's range"
                        : cpuFallback
                          ? "Runs on the CPU too"
                          : "Below the guide's recommendation"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    Guide recommends {band.recommendedVramLabel}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {examples.length > 0
                      ? `Catalogue examples: ${examples.join(", ")}`
                      : "No catalogue examples in this size"}
                  </p>
                </li>
              );
            })}
          </ul>
          {anyBelow && (
            <p className="mt-4 text-sm text-text-secondary">{OVERFLOW_NOTE}</p>
          )}
          {vram.beyondTable && (
            <p className="mt-2 text-sm text-text-secondary">
              For hardware beyond this table, see{" "}
              <Link
                href="/blog/frontier-tier-hardware-local-ai"
                className={LINK_CLASSES}
              >
                frontier tier hardware for local AI
              </Link>
              .
            </p>
          )}
        </>
      )}

      {cpuRow !== null && (
        <>
          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border-default bg-bg-secondary p-4">
              <dt className="text-xs text-text-muted">Realistic model size</dt>
              <dd className="mt-1 text-sm font-semibold text-text-primary">
                {cpuRow.modelSize}
              </dd>
            </div>
            <div className="rounded-lg border border-border-default bg-bg-secondary p-4">
              <dt className="text-xs text-text-muted">What you can do</dt>
              <dd className="mt-1 text-sm font-semibold text-text-primary">
                {cpuRow.whatYouCanDo}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-text-muted">
            General examples from our{" "}
            <Link href="/blog/run-local-ai-without-gpu" className={LINK_CLASSES}>
              guide to running local AI without a GPU
            </Link>
            , not a list of the models InnerZero installs.
          </p>
        </>
      )}
    </section>
  );
}
