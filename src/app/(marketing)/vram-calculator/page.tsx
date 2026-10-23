import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/JsonLd";
import { createMetadata } from "@/lib/metadata";
import { LOCAL_MODELS } from "@/lib/models";
import {
  BELOW_8GB_RAM_ADVICE,
  CPU_GUIDANCE_NOTE,
  CPU_RAM_TARGETS,
  CPU_TABLE_HEADERS,
  DEFAULT_VRAM_GB,
  QUANT_TARGETS,
  RAM_MINIMUM_GB,
  SETUP_DEFAULTS_NOTE,
  VRAM_BANDS,
  VRAM_FAQ,
  VRAM_TABLE_HEADERS,
  mapModelsToBands,
} from "@/lib/vram-calculator";
import { VramCalculator } from "./VramCalculator";

// Server component. Nothing on this route reads headers(), cookies() or
// search params, so it prerenders as static and keeps the static CSP from
// next.config.ts. The only client code is the VramCalculator island.

const TITLE = "Local AI VRAM Calculator: What Can My PC Run? - InnerZero";
const DESCRIPTION =
  "Enter your graphics card's VRAM to see which local AI model sizes our guide recommends at 4-bit. Approximate figures, a CPU-only mode and quantization tips.";

export const metadata: Metadata = createMetadata({
  path: "/vram-calculator",
  // The title carries the brand, so it uses absolute to bypass the
  // "%s | InnerZero..." template (WEBCLAUDE.md duplicate-brand rule), as
  // /models does.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
});

const LINK_CLASSES =
  "text-accent-gold transition-colors hover:text-accent-gold-hover";

const VRAM_TABLE_NOTE =
  "Approximate figures for 4-bit quantized models. Context length and quantization level shift them up or down.";

const TABLE_NOTE_CLASSES = "mt-4 text-sm text-text-muted";

const TABLE_WRAPPER_CLASSES =
  "mt-3 overflow-x-auto rounded-xl border border-border-default bg-bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary";

const TH_COL_CLASSES =
  "p-4 text-xs font-semibold uppercase tracking-wide text-text-muted";

const FURTHER_READING: { href: string; label: string }[] = [
  { href: "/blog/how-much-vram-for-local-ai", label: "How much VRAM you need for local AI" },
  { href: "/blog/what-is-llm-quantization", label: "What is LLM quantization?" },
  { href: "/blog/ai-model-download-size-vram-impact", label: "Model download size and VRAM impact" },
  { href: "/blog/hardware-for-local-ai", label: "What hardware you need to run AI locally" },
  { href: "/blog/run-local-ai-without-gpu", label: "How to run a local AI without a GPU" },
  { href: "/blog/frontier-tier-hardware-local-ai", label: "Frontier tier hardware for local AI" },
  { href: "/models", label: "Supported AI models" },
  { href: "/what-is-local-ai", label: "What is local AI?" },
];

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 scroll-mt-24 text-2xl font-bold text-text-primary md:text-3xl"
    >
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-base text-text-secondary">{children}</p>;
}

export default function VramCalculatorPage() {
  const { byBand } = mapModelsToBands(LOCAL_MODELS);

  // Optional descriptive markup built from the same array as the visible
  // FAQ. Google retired FAQ rich results in May 2026; no rich result or AI
  // visibility is assumed. The answers contain no "<" (unit-tested), which
  // matters because JsonLd does not escape it.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: VRAM_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="pt-28 pb-16 md:pt-36 md:pb-24">
      <Container>
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <header>
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              Local AI VRAM calculator: what can my PC run?
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-text-secondary">
              Enter how much memory your graphics card has and this calculator
              shows which local AI model sizes our VRAM guide recommends for it
              at 4-bit quantization, the compression most local tools use by
              default. For most people 8 GB of VRAM is the comfortable
              starting point, and 12 to 16 GB covers the popular mid-size
              models. All figures are approximate.
            </p>
          </header>

          <noscript>
            <p className="mt-6 rounded-lg border border-border-default bg-bg-secondary p-4 text-sm text-text-secondary">
              The calculator needs JavaScript to update. The result shown is
              the example for {DEFAULT_VRAM_GB} GB of VRAM, and the tables
              below list every size.
            </p>
          </noscript>

          <div className="mt-10">
            <VramCalculator bandModels={byBand} />
          </div>

          {/* Reference: VRAM by model size */}
          <SectionHeading id="vram-by-model-size">
            VRAM needed by model size
          </SectionHeading>
          <Body>
            The full table from our{" "}
            <Link href="/blog/how-much-vram-for-local-ai" className={LINK_CLASSES}>
              guide to how much VRAM you need for local AI
            </Link>
            , with examples of each size from our{" "}
            <Link href="/models" className={LINK_CLASSES}>
              model catalogue
            </Link>
            .
          </Body>
          {/* Visible copy of the caption, outside the scroll wrapper so it
              wraps to the viewport on phones; the sr-only caption keeps the
              table's accessible name, so this copy is hidden from AT. */}
          <p aria-hidden="true" className={TABLE_NOTE_CLASSES}>
            {VRAM_TABLE_NOTE}
          </p>
          <div
            role="region"
            aria-label="VRAM by model size table, scrolls sideways on small screens"
            tabIndex={0}
            className={TABLE_WRAPPER_CLASSES}
          >
            <table className="w-full min-w-[720px] text-sm">
              <caption className="sr-only">{VRAM_TABLE_NOTE}</caption>
              <thead>
                <tr className="border-b border-border-default text-left">
                  {VRAM_TABLE_HEADERS.map((h) => (
                    <th key={h} scope="col" className={TH_COL_CLASSES}>
                      {h}
                    </th>
                  ))}
                  <th scope="col" className={TH_COL_CLASSES}>
                    Catalogue examples
                  </th>
                </tr>
              </thead>
              <tbody>
                {VRAM_BANDS.map((band, i) => (
                  <tr
                    key={band.id}
                    className={
                      i === VRAM_BANDS.length - 1
                        ? ""
                        : "border-b border-border-default"
                    }
                  >
                    <th
                      scope="row"
                      className="p-4 text-left align-top font-semibold text-text-primary"
                    >
                      {band.sizeLabel}
                    </th>
                    <td className="p-4 align-top text-text-secondary">
                      {band.approxQ4SizeLabel}
                    </td>
                    <td className="p-4 align-top text-text-secondary">
                      {band.recommendedVramLabel}
                    </td>
                    <td className="p-4 align-top text-text-secondary">
                      {band.cpuOnlyLabel}
                    </td>
                    <td className="p-4 align-top text-text-secondary">
                      {byBand[band.id].length > 0
                        ? byBand[band.id].join(", ")
                        : "None in the catalogue"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reference: CPU only */}
          <SectionHeading id="cpu-only">Running on CPU only</SectionHeading>
          <Body>
            With no graphics card the model runs on your CPU using system RAM,
            more slowly than on a GPU, so system RAM sets the limit. These are
            the working recommendations from our{" "}
            <Link href="/blog/run-local-ai-without-gpu" className={LINK_CLASSES}>
              guide to running local AI without a GPU
            </Link>
            .
          </Body>
          <p aria-hidden="true" className={TABLE_NOTE_CLASSES}>
            {CPU_GUIDANCE_NOTE}
          </p>
          <div
            role="region"
            aria-label="CPU-only guidance table, scrolls sideways on small screens"
            tabIndex={0}
            className={TABLE_WRAPPER_CLASSES}
          >
            <table className="w-full min-w-[560px] text-sm">
              <caption className="sr-only">{CPU_GUIDANCE_NOTE}</caption>
              <thead>
                <tr className="border-b border-border-default text-left">
                  {CPU_TABLE_HEADERS.map((h) => (
                    <th key={h} scope="col" className={TH_COL_CLASSES}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CPU_RAM_TARGETS.map((row, i) => (
                  <tr
                    key={row.ramLabel}
                    className={
                      i === CPU_RAM_TARGETS.length - 1
                        ? ""
                        : "border-b border-border-default"
                    }
                  >
                    <th
                      scope="row"
                      className="p-4 text-left align-top font-semibold text-text-primary"
                    >
                      {row.ramLabel}
                    </th>
                    <td className="p-4 align-top text-text-secondary">
                      {row.modelSize}
                    </td>
                    <td className="p-4 align-top text-text-secondary">
                      {row.whatYouCanDo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Body>
            Below {CPU_RAM_TARGETS[0].ramLabel} {BELOW_8GB_RAM_ADVICE} InnerZero
            needs at least {RAM_MINIMUM_GB} GB of RAM to run a local model.
          </Body>

          {/* Separate quantization examples */}
          <SectionHeading id="quantization-starting-points">
            Quantization starting points
          </SectionHeading>
          <Body>
            Separate examples from our{" "}
            <Link href="/blog/what-is-llm-quantization" className={LINK_CLASSES}>
              guide to LLM quantization
            </Link>
            . They apply to graphics card memory, and each one names its own
            model size and quantization level.
          </Body>
          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {QUANT_TARGETS.map((row) => (
              <div
                key={row.memoryLabel}
                className="rounded-xl border border-border-default bg-bg-card p-5"
              >
                <dt className="text-sm font-semibold text-text-primary">
                  {row.displayLabel}
                </dt>
                <dd className="mt-1 text-sm text-text-secondary">{row.target}</dd>
              </div>
            ))}
          </dl>

          {/* Method */}
          <SectionHeading id="how-it-works">
            How this calculator works
          </SectionHeading>
          <Body>
            It compares your VRAM with the lower end of the recommended range
            for each model size in our{" "}
            <Link href="/blog/how-much-vram-for-local-ai" className={LINK_CLASSES}>
              VRAM guide
            </Link>
            . As a rule of thumb, a 4-bit model needs about 0.5 GB of memory
            per billion parameters for its weights, plus 1 to 2 GB of headroom
            for the context window. Context length and the exact quantization
            level shift the real figure up or down, and moving up to 8-bit
            roughly doubles the memory a model needs.
          </Body>
          <Body>
            The figures cover one chat model. A complete assistant also needs a
            small embedding model for memory and, on capable hardware, local
            voice models. InnerZero&apos;s setup wizard checks your hardware
            and picks the models to match, so you do not have to add this up
            yourself.
          </Body>

          {/* FAQ */}
          <SectionHeading id="faq">Frequently asked questions</SectionHeading>
          <div className="mt-6 divide-y divide-border-default rounded-xl border border-border-default bg-bg-card">
            {VRAM_FAQ.map((item) => (
              <div key={item.question} className="p-5">
                <h3 className="text-base font-semibold text-text-primary">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <section
            aria-labelledby="setup-heading"
            className="mt-14 rounded-xl border border-border-default bg-bg-card p-6 md:p-8"
          >
            <h2
              id="setup-heading"
              className="text-2xl font-bold text-text-primary md:text-3xl"
            >
              Let InnerZero pick for you
            </h2>
            <p className="mt-4 text-base text-text-secondary">
              InnerZero&apos;s setup wizard checks your hardware, tells you
              what it found and picks the models to match, so you do not have
              to work out the VRAM maths yourself. {SETUP_DEFAULTS_NOTE}{" "}
              InnerZero is free to download on Windows, macOS, and Linux, with
              no account required.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button href="/download">Download InnerZero</Button>
              <Link
                href="/features/setup"
                className="text-sm font-medium text-accent-gold transition-colors hover:text-accent-gold-hover"
              >
                See how setup works
              </Link>
            </div>
          </section>

          {/* Further reading */}
          <section
            aria-labelledby="further-reading-heading"
            className="mt-14 rounded-xl border border-border-default bg-bg-card p-6"
          >
            <h2
              id="further-reading-heading"
              className="text-lg font-semibold text-text-primary"
            >
              Further reading
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-text-secondary sm:grid-cols-2">
              {FURTHER_READING.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-accent-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>

      <JsonLd data={faqJsonLd} />
    </div>
  );
}
