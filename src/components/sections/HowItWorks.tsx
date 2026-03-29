import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOW_IT_WORKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section className={cn("py-12 md:py-20", className)}>
      <Container>
        <SectionHeader
          title="How It Works"
          subtitle="Up and running in minutes."
        />

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {/* Connecting line on desktop */}
          <div
            className="absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] hidden h-px bg-border-default md:block"
            aria-hidden="true"
          />

          {HOW_IT_WORKS.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 100}>
              <div className="relative text-center">
                <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold text-[#0a0a0f] text-lg font-bold">
                  {step.number}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
