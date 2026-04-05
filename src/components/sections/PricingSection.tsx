"use client";

import { useState } from "react";
import { Check, Clock, Heart, Coffee, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PRICING_FREE, CLOUD_PLANS, SUPPORTER, BUSINESS_LICENCE, FAQ_DATA, type FAQItem } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface PricingSectionProps {
  className?: string;
}

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border-default">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="pr-4 text-sm font-medium text-text-primary md:text-base">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div className={cn("faq-content", open && "open")}>
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-text-secondary">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PricingSection({ className }: PricingSectionProps) {
  return (
    <div className={cn("", className)}>
      {/* Section A — Free Local */}
      <section className="py-12 md:py-20">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-xl">
              <div className="relative rounded-xl border-2 border-accent-teal bg-bg-card p-8 text-center shadow-[0_0_30px_rgba(0,201,183,0.1)]">
                <Badge variant="teal" className="mb-4">
                  The full product
                </Badge>

                <h3 className="text-2xl font-bold text-text-primary">
                  {PRICING_FREE.planName}
                </h3>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-text-primary">
                    {PRICING_FREE.price}
                  </span>
                </div>

                <p className="mt-4 text-sm text-text-secondary">
                  {PRICING_FREE.subtitle}
                </p>

                <ul className="mt-6 flex flex-col gap-3 text-left">
                  {PRICING_FREE.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-text-secondary"
                    >
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button href={PRICING_FREE.ctaHref} className="w-full">
                    {PRICING_FREE.cta}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Section B — Cloud AI Boost (Coming Soon) */}
      <section className="bg-bg-secondary py-12 md:py-20">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="text-2xl font-bold text-text-primary md:text-[2rem]">
                Want faster reasoning? Premium models? Zero hassle.
              </h2>
              <p className="mt-4 text-text-secondary">
                Optional cloud plans are coming that give access to models like Claude, GPT, and DeepSeek through InnerZero — with simple monthly credit allowances like a phone plan.
              </p>
              <p className="mt-3 text-sm text-accent-teal">
                Power users can already add their own API keys for free with zero markup — BYO API keys work today.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              {CLOUD_PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="relative rounded-xl border border-border-default bg-bg-card p-6 text-center opacity-60"
                >
                  <Badge variant="gold" className="mb-3">
                    Coming Soon
                  </Badge>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {plan.name}
                  </h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-text-primary">
                      {plan.price}
                    </span>
                    <span className="text-text-secondary">{plan.period}</span>
                  </div>
                  <ul className="mt-4 flex flex-col gap-2 text-left">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-text-muted"
                      >
                        <Check className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button href="/waitlist" variant="secondary">
                Join the Waitlist
              </Button>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Section C — Support InnerZero */}
      <section className="py-12 md:py-20">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="text-2xl font-bold text-text-primary md:text-[2rem]">
                Help build the future of private AI.
              </h2>
            </div>

            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
              {/* Supporter card */}
              <div className="rounded-xl border border-border-default bg-bg-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-accent-gold" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Supporter
                  </h3>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-text-primary">
                    {SUPPORTER.price}
                  </span>
                  <span className="text-text-secondary">{SUPPORTER.period}</span>
                </div>
                <p className="text-sm text-text-secondary mb-6">
                  {SUPPORTER.description}
                </p>
                <a
                  href={SUPPORTER.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold px-6 py-3 text-[15px] font-medium text-[#0a0a0f] transition-all duration-150 hover:bg-accent-gold-hover"
                >
                  {SUPPORTER.cta}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Donation card */}
              <div className="rounded-xl border border-border-default bg-bg-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Coffee className="h-5 w-5 text-accent-gold" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    One-off Donation
                  </h3>
                </div>
                <p className="text-sm text-text-secondary mb-6 mt-3">
                  Buy us a coffee. Any amount helps fund development and keeps InnerZero free for everyone.
                </p>
                <a
                  href="https://ko-fi.com/innerzero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border-default px-6 py-3 text-[15px] font-medium text-text-primary transition-all duration-150 hover:border-accent-gold hover:text-accent-gold"
                >
                  Donate
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="https://discord.gg/rn9SPXgThT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent-teal"
              >
                Join the community on Discord
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Section D — Business Licence */}
      <section className="bg-bg-secondary py-12 md:py-20">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="text-2xl font-bold text-text-primary md:text-[2rem]">
                Business
              </h2>
              <p className="mt-4 text-text-secondary">
                Using InnerZero at work? A commercial licence is required for business, commercial, and revenue-generating use.
              </p>
            </div>

            <div className="mx-auto max-w-xl">
              <div className="rounded-xl border border-border-default bg-bg-card p-8 text-center">
                <h3 className="text-2xl font-bold text-text-primary">
                  {BUSINESS_LICENCE.planName}
                </h3>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-text-primary">
                    {BUSINESS_LICENCE.price}
                  </span>
                  <span className="text-text-secondary">{BUSINESS_LICENCE.period}</span>
                </div>
                <p className="mt-1 text-sm text-text-muted">
                  {BUSINESS_LICENCE.perSeat}
                </p>

                <p className="mt-4 text-sm text-text-secondary">
                  {BUSINESS_LICENCE.description}
                </p>

                <ul className="mt-6 flex flex-col gap-3 text-left">
                  {BUSINESS_LICENCE.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-text-secondary"
                    >
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <a
                    href={BUSINESS_LICENCE.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold px-6 py-3 text-[15px] font-medium text-[#0a0a0f] transition-all duration-150 hover:bg-accent-gold-hover"
                  >
                    {BUSINESS_LICENCE.cta}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-text-muted">
              Need team features, shared memory, or managed cloud AI? Coming soon.{" "}
              <a href="/waitlist" className="text-text-secondary transition-colors hover:text-accent-gold">
                Join the waitlist
              </a>.
            </p>
          </ScrollReveal>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20">
        <Container>
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about InnerZero."
          />
          <ScrollReveal>
            <div className="mx-auto max-w-2xl">
              {FAQ_DATA.map((item) => (
                <FAQAccordionItem key={item.question} item={item} />
              ))}
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
