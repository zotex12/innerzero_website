import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/JsonLd";
import { createMetadata } from "@/lib/metadata";
import {
  CLOUD_MODELS,
  LOCAL_MODELS,
  PROVIDER_ORDER,
  lastReviewed,
  type CloudModel,
  type LocalModel,
} from "@/lib/models";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/models" },
  // Absolute title bypasses the "%s | InnerZero..." template to produce
  // exactly the copy the task asked for.
  title: { absolute: "Supported AI Models - InnerZero" },
  description:
    "InnerZero supports Qwen 3, Gemma 3, and gpt-oss local model families via Ollama or LM Studio. Optional cloud support covers seven providers including Anthropic, OpenAI, and Google.",
  openGraph: {
    title: "Supported AI Models - InnerZero",
    description:
      "Every AI model InnerZero supports. Local families run on your PC for free. Cloud is optional.",
    url: "https://innerzero.com/models",
  },
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";

function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  return `${day} ${month} ${d.getUTCFullYear()}`;
}

function backendLabel(backend: LocalModel["backend"]): string {
  if (backend === "both") return "Ollama or LM Studio";
  if (backend === "ollama") return "Ollama";
  return "LM Studio";
}

function tierLabel(tier: LocalModel["minimumTier"]): string {
  // Capitalise for display; keep the internal id lowercase.
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function LocalCard({ model }: { model: LocalModel }) {
  return (
    <article
      id={model.id}
      className="flex flex-col rounded-xl border border-border-default bg-bg-card p-6 transition-colors hover:border-accent-gold/40"
    >
      <h3 className="text-xl font-semibold text-text-primary">
        {model.displayName}
      </h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {model.sizes.map((size) => (
          <span
            key={size}
            className="rounded-full bg-accent-teal-muted px-2.5 py-0.5 text-[11px] font-medium text-accent-teal"
          >
            {size}
          </span>
        ))}
      </div>
      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-text-muted">Minimum hardware</dt>
          <dd className="text-text-secondary">{tierLabel(model.minimumTier)} tier</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-text-muted">Backend</dt>
          <dd className="text-text-secondary">{backendLabel(model.backend)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-text-muted">{model.license}</p>
      <a
        href={model.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex text-sm text-accent-gold transition-colors hover:text-accent-gold-hover"
      >
        Official page
      </a>
    </article>
  );
}

function CloudRow({ model }: { model: CloudModel }) {
  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-text-primary">
          {model.displayName}
        </span>
        <code className="mt-0.5 break-all font-mono text-[11px] text-text-muted">
          {model.modelId}
        </code>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {model.access.includes("managed") && (
          <span className="rounded-full bg-accent-gold-muted px-2 py-0.5 text-[11px] font-medium text-accent-gold">
            Managed
          </span>
        )}
        {model.access.includes("byo") && (
          <span className="rounded-full bg-accent-teal-muted px-2 py-0.5 text-[11px] font-medium text-accent-teal">
            BYO
          </span>
        )}
        <a
          href={model.providerPricingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-text-secondary underline decoration-border-default underline-offset-2 transition-colors hover:text-text-primary hover:decoration-accent-gold"
        >
          Pricing
        </a>
      </div>
    </div>
  );
}

export default function ModelsPage() {
  const itemListElements = [
    ...LOCAL_MODELS.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: m.displayName,
        applicationCategory: "AIAssistant",
        url: `${SITE_URL}/models#${m.id}`,
      },
    })),
    ...CLOUD_MODELS.map((m, i) => ({
      "@type": "ListItem",
      position: LOCAL_MODELS.length + i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: m.displayName,
        applicationCategory: "AIAssistant",
        url: `${SITE_URL}/models#${m.provider.toLowerCase()}`,
      },
    })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Supported AI models",
    itemListElement: itemListElements,
  };

  return (
    <div className="pt-28 pb-16 md:pt-36 md:pb-24">
      <Container>
        <div className="mx-auto max-w-5xl">
          {/* Hero */}
          <header className="mb-10 md:mb-14">
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              Supported AI models
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-text-secondary">
              InnerZero runs open-source language models directly on your PC
              via Ollama or LM Studio. The main families are Qwen 3, Gemma 3,
              and gpt-oss, covering everything from a 1B voice model on a
              basic laptop to a 235B reasoning model on a datacenter-class
              workstation. Local AI is free forever, no subscription, no
              account required.
            </p>
            <p className="mt-4 max-w-3xl text-lg text-text-secondary">
              Cloud support is optional. If you want frontier-quality models
              for hard tasks, subscribe to InnerZero&apos;s managed cloud
              plans, or bring your own API keys for any of seven providers
              with zero markup. Keys stay encrypted on your machine.
            </p>
          </header>

          {/* Local */}
          <section aria-labelledby="local-heading" className="mb-16 md:mb-20">
            <h2
              id="local-heading"
              className="text-2xl font-bold text-text-primary md:text-3xl"
            >
              Local models
            </h2>
            <p className="mt-3 max-w-3xl text-base text-text-secondary">
              Installed automatically based on your hardware tier. These run
              entirely on your machine, offline if you want.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LOCAL_MODELS.map((m) => (
                <LocalCard key={m.id} model={m} />
              ))}
            </div>
          </section>

          {/* Selection criteria */}
          <section aria-labelledby="criteria-heading" className="mb-16 md:mb-20">
            <h2
              id="criteria-heading"
              className="text-2xl font-bold text-text-primary md:text-3xl"
            >
              How we choose supported models
            </h2>
            <p className="mt-4 max-w-3xl text-base text-text-secondary">
              Supported local families run reliably on consumer hardware,
              ship under permissive licences, are actively maintained by their
              upstream teams, and work cleanly through Ollama or LM Studio
              without custom glue. We prefer families with a range of sizes so
              the same recipe scales from a budget laptop up to a frontier
              workstation. Models that satisfy those constraints land in the
              default hardware tiers and get tested as new versions ship.
            </p>
          </section>

          {/* Cloud */}
          <section aria-labelledby="cloud-heading">
            <h2
              id="cloud-heading"
              className="text-2xl font-bold text-text-primary md:text-3xl"
            >
              Cloud models
            </h2>
            <p className="mt-3 max-w-3xl text-base text-text-secondary">
              This section is optional. Use these only if you choose to add an
              API key or subscribe to a managed cloud plan. Managed plans
              bundle multiple providers under one bill; BYO sends your prompts
              directly to the provider you configure.
            </p>
            <div className="mt-8 space-y-10">
              {PROVIDER_ORDER.map((provider) => {
                const models = CLOUD_MODELS.filter(
                  (m) => m.provider === provider,
                );
                if (models.length === 0) return null;
                return (
                  <div key={provider} id={provider.toLowerCase()}>
                    <h3 className="mb-3 text-lg font-semibold text-text-primary">
                      {provider}
                    </h3>
                    <div className="divide-y divide-border-default rounded-lg border border-border-default bg-bg-card">
                      {models.map((m) => (
                        <CloudRow key={m.id} model={m} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer note */}
          <p className="mt-16 border-t border-border-default pt-6 text-xs text-text-muted md:mt-20">
            Model support last reviewed {formatReviewDate(lastReviewed)}.
            Pricing is set by each provider and changes over time; follow the
            pricing links above for current rates. Local models are free
            forever.
          </p>
        </div>
      </Container>

      <JsonLd data={jsonLd} />
    </div>
  );
}
