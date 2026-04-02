import Link from "next/link";
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
  description = "InnerZero is free forever. Download and start chatting in minutes.",
  ctaText = "Download Free",
  ctaHref = "/download",
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
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button href={ctaHref}>{ctaText}</Button>
              <Link
                href="/pricing"
                className="text-sm text-text-secondary transition-colors hover:text-accent-gold"
              >
                View pricing options
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
