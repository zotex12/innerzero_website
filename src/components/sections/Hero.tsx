import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SocialProofStrip } from "@/components/sections/SocialProofStrip";
import { HERO } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden pt-16">
      {/* Radial gradient glow background */}
      <div
        className="animate-hero-glow pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--accent-gold) 0%, var(--accent-teal) 40%, transparent 70%)",
          opacity: 0.06,
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {[
          { top: "15%", left: "10%", size: 4, delay: "0s", duration: "22s" },
          { top: "25%", left: "80%", size: 3, delay: "3s", duration: "18s" },
          { top: "60%", left: "15%", size: 5, delay: "5s", duration: "25s" },
          { top: "70%", left: "75%", size: 3, delay: "2s", duration: "20s" },
          { top: "40%", left: "90%", size: 4, delay: "7s", duration: "23s" },
          { top: "80%", left: "50%", size: 3, delay: "4s", duration: "19s" },
        ].map((dot, i) => (
          <div
            key={i}
            className="animate-float absolute rounded-full bg-accent-gold opacity-[0.15]"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              animationDelay: dot.delay,
              animationDuration: dot.duration,
            }}
          />
        ))}
      </div>

      <Container className="relative z-10 text-center">
        <h1 className="animate-fade-up text-4xl font-bold leading-[1.1] text-text-primary md:text-5xl lg:text-[3.5rem]">
          {HERO.headline}
        </h1>

        <p className="animate-fade-up-delay-1 mt-4 text-lg text-accent-gold font-medium md:text-xl">
          {HERO.tagline}
        </p>

        <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
          {HERO.description}
        </p>

        <div className="animate-fade-up-delay-3 mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button href={HERO.primaryCtaHref}>{HERO.primaryCta}</Button>
          <Button href={HERO.secondaryCtaHref} variant="secondary">
            {HERO.secondaryCta}
          </Button>
        </div>

        <SocialProofStrip className="mt-8" />
      </Container>
    </section>
  );
}
