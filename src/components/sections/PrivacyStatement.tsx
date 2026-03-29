import { Shield } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PRIVACY_STATEMENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PrivacyStatementProps {
  className?: string;
}

export function PrivacyStatement({ className }: PrivacyStatementProps) {
  return (
    <section className={cn("bg-bg-secondary py-12 md:py-20", className)}>
      <Container>
        <ScrollReveal>
          <div className="text-center">
            <Shield className="mx-auto mb-6 h-10 w-10 text-accent-teal" />
            <h2 className="text-2xl font-bold text-text-primary md:text-[2rem]">
              {PRIVACY_STATEMENT.headline}
            </h2>

            <ul className="mx-auto mt-8 flex max-w-2xl flex-col gap-4">
              {PRIVACY_STATEMENT.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-left text-text-secondary"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
