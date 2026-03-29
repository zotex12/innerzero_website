"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PRICING } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  className?: string;
}

export function PricingCard({ className }: PricingCardProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <section className={cn("py-12 md:py-20", className)}>
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-md">
            {/* Toggle */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setAnnual(false)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer",
                  !annual
                    ? "bg-accent-gold text-[#0a0a0f]"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer",
                  annual
                    ? "bg-accent-gold text-[#0a0a0f]"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                Annual
              </button>
            </div>

            {/* Card */}
            <div className="animate-pricing-glow rounded-xl border border-border-default bg-bg-card p-8 text-center">
              <h3 className="text-2xl font-bold text-text-primary">
                {PRICING.planName}
              </h3>

              <div className="mt-4">
                <span className="text-4xl font-bold text-text-primary">
                  {annual ? PRICING.annual : PRICING.monthly}
                </span>
                <span className="text-text-secondary">
                  {annual ? PRICING.annualPeriod : PRICING.monthlyPeriod}
                </span>
              </div>

              {annual && (
                <span className="mt-2 inline-block rounded-full bg-accent-teal-muted px-3 py-1 text-xs font-medium text-accent-teal">
                  {PRICING.annualSaving}
                </span>
              )}

              <p className="mt-4 text-sm text-text-secondary">
                {PRICING.tagline}
              </p>

              <p className="mt-2 text-sm text-accent-teal">{PRICING.trial}</p>

              <ul className="mt-6 flex flex-col gap-3 text-left">
                {PRICING.features.map((feature) => (
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
                <Button href="/waitlist" className="w-full">
                  Join the Waitlist
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
