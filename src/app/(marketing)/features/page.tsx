import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CTABanner } from "@/components/sections/CTABanner";
import { DETAILED_FEATURES, COMING_SOON_FEATURES } from "@/lib/constants";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Features",
  description:
    "Explore InnerZero features: local AI, private memory, voice interaction, document knowledge, smart tools, and hardware-aware setup.",
  openGraph: {
    title: "Features | InnerZero — Private AI Assistant",
    description:
      "Explore InnerZero features: local AI, private memory, voice interaction, and more.",
    url: "https://innerzero.com/features",
  },
});

export default function FeaturesPage() {
  return (
    <>
      <section className="pt-28 pb-12 md:pt-36 md:pb-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              Everything you need. Nothing you don&apos;t.
            </h1>
            <p className="mt-4 text-lg text-text-secondary">
              InnerZero is packed with features that put your privacy first — all running locally on your machine.
            </p>
          </div>
        </Container>
      </section>

      {/* Detailed features with alternating layout */}
      {DETAILED_FEATURES.map((feature, i) => (
        <section key={feature.title} className="py-8 md:py-12">
          <Container>
            <ScrollReveal>
              <div
                className={`flex flex-col gap-6 md:flex-row md:items-center md:gap-12 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <feature.icon className="h-6 w-6 text-accent-teal" />
                    <h2 className="text-xl font-semibold text-text-primary md:text-2xl">
                      {feature.title}
                    </h2>
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="aspect-video rounded-xl border border-border-default bg-bg-card" />
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      ))}

      {/* Coming Soon section */}
      <section className="bg-bg-secondary py-12 md:py-20">
        <Container>
          <div className="mb-12 text-center">
            <Badge variant="teal">Coming Soon</Badge>
            <h2 className="mt-4 text-2xl font-semibold text-text-primary md:text-[2rem]">
              On the Roadmap
            </h2>
            <p className="mt-2 text-text-secondary">
              Planned features that are in development.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {COMING_SOON_FEATURES.map((feature) => (
              <ScrollReveal key={feature.title}>
                <div className="rounded-xl border border-border-default bg-bg-card p-6 opacity-75">
                  <feature.icon className="mb-3 h-6 w-6 text-text-muted" />
                  <h3 className="mb-1 text-lg font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      <CTABanner />
    </>
  );
}
