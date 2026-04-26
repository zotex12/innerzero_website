import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

type Integration =
  | {
      name: string;
      sublabel: string;
      src: string;
      alt: string;
      darkSrc?: undefined;
      lightSrc?: undefined;
    }
  | {
      name: string;
      sublabel: string;
      darkSrc: string;
      lightSrc: string;
      alt: string;
      src?: undefined;
    };

const AI_MODELS: Integration[] = [
  { name: "ChatGPT", sublabel: "OpenAI", darkSrc: "openai_dark.svg", lightSrc: "openai.svg", alt: "ChatGPT logo" },
  { name: "Claude", sublabel: "Anthropic", darkSrc: "anthropic_white.svg", lightSrc: "anthropic_black.svg", alt: "Claude logo" },
  { name: "Gemini", sublabel: "Google", src: "gemini.svg", alt: "Gemini logo" },
  { name: "DeepSeek", sublabel: "DeepSeek AI", src: "deepseek.svg", alt: "DeepSeek logo" },
  { name: "Grok", sublabel: "xAI", darkSrc: "xai_dark.svg", lightSrc: "xai_light.svg", alt: "Grok by xAI logo" },
  { name: "Qwen", sublabel: "Alibaba", darkSrc: "qwen_dark.svg", lightSrc: "qwen_light.svg", alt: "Qwen logo" },
  { name: "Kimi", sublabel: "Moonshot", src: "kimi-icon.svg", alt: "Kimi logo" },
  { name: "Ollama", sublabel: "Local models", darkSrc: "ollama_dark.svg", lightSrc: "ollama_light.svg", alt: "Ollama logo" },
];

const CONNECTORS: Integration[] = [
  { name: "Google Calendar", sublabel: "Two-way sync", src: "google-calendar.svg", alt: "Google Calendar logo" },
  { name: "Gmail", sublabel: "Read-only", src: "gmail.svg", alt: "Gmail logo" },
  { name: "Telegram", sublabel: "Bot", src: "telegram.svg", alt: "Telegram logo" },
];

function IntegrationCard({ integration }: { integration: Integration }) {
  const dual = integration.darkSrc !== undefined;
  return (
    <div className="rounded-xl border border-border-default bg-bg-card p-6 transition-colors duration-150 hover:border-border-hover hover:bg-bg-card-hover">
      <div className="flex flex-col items-center text-center">
        <div
          className="relative h-12 w-12 text-text-primary"
          role="img"
          aria-label={integration.alt}
        >
          {dual ? (
            <>
              <Image
                src={`/images/integrations/${integration.darkSrc}`}
                alt=""
                width={48}
                height={48}
                className="theme-dark-glyph h-12 w-12"
                aria-hidden="true"
                unoptimized
              />
              <Image
                src={`/images/integrations/${integration.lightSrc}`}
                alt=""
                width={48}
                height={48}
                className="theme-light-glyph h-12 w-12"
                aria-hidden="true"
                unoptimized
              />
            </>
          ) : (
            <Image
              src={`/images/integrations/${integration.src}`}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12"
              aria-hidden="true"
              unoptimized
            />
          )}
        </div>
        <h4 className="mt-4 text-base font-semibold text-text-primary">
          {integration.name}
        </h4>
        <p className="mt-1 text-sm text-text-muted">{integration.sublabel}</p>
      </div>
    </div>
  );
}

interface IntegrationsSectionProps {
  className?: string;
}

export function IntegrationsSection({ className }: IntegrationsSectionProps) {
  return (
    <section className={cn("py-12 md:py-20", className)}>
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-text-primary md:text-[2rem]">
              Works with what you already use
            </h2>
            <p className="mt-4 text-text-secondary">
              Plug in your favourite AI models or sync your data. All optional, all under your control.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <h3 className="mt-12 mb-6 text-center text-sm font-medium uppercase tracking-wide text-text-muted">
            AI models
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {AI_MODELS.map((item) => (
              <IntegrationCard key={item.name} integration={item} />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <h3 className="mt-12 mb-6 text-center text-sm font-medium uppercase tracking-wide text-text-muted">
            Your data, on your terms
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {CONNECTORS.map((item) => (
              <IntegrationCard key={item.name} integration={item} />
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
