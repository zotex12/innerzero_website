import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FEATURE_CARDS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FeatureCardsProps {
  className?: string;
}

export function FeatureCards({ className }: FeatureCardsProps) {
  return (
    <section className={cn("py-12 md:py-20", className)}>
      <Container>
        <SectionHeader title="Why InnerZero?" subtitle="AI that respects your privacy by design." />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 100}>
              <Card className="h-full">
                <feature.icon className="mb-4 h-8 w-8 text-accent-teal" />
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
