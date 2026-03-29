import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

interface CTABannerProps {
  className?: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function CTABanner({
  className,
  headline = "Ready to meet your private AI?",
  description = "InnerZero — £9.99/month or £79.99/year. 14-day free trial, no card required.",
  ctaText = "Join the Waitlist",
  ctaHref = "/waitlist",
}: CTABannerProps) {
  return (
    <section className={cn("bg-bg-secondary py-12 md:py-20", className)}>
      <Container>
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary md:text-[2rem]">
              {headline}
            </h2>
            <p className="mt-4 text-text-secondary">{description}</p>
            <div className="mt-6">
              <Button href={ctaHref}>{ctaText}</Button>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
