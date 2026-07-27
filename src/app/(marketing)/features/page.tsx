import type { Metadata } from "next";
import Link from "next/link";
import {
  Rocket, MessageSquare, Mic, Brain, Languages as LanguagesIcon,
  Wrench, BookOpen, Users, Bell, Briefcase,
  Monitor, Cloud, Palette, ShieldAlert, PenTool,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { JsonLd } from "@/components/JsonLd";
import { FEATURE_CATEGORIES } from "@/lib/features";
import { absoluteUrl, createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/features" },
  // Absolute title bypasses the "%s | InnerZero..." template in
  // src/lib/metadata.ts. Without absolute, the brand appears twice in
  // the rendered <title> because this page's title already contains
  // "InnerZero". Same pattern as the home page and /about.
  title: {
    absolute: "Features | InnerZero: Private AI Assistant",
  },
  description:
    "Explore everything InnerZero can do. AI chat, voice, memory, 30+ tools, knowledge packs, screen automation, cloud AI, and more. All free, all private, all on your PC.",
  openGraph: {
    title: "Features | InnerZero: Private AI Assistant",
    description:
      "AI chat, voice, memory, 30+ tools, knowledge packs, screen automation, and more. All free and private.",
    url: "https://innerzero.com/features",
  },
});

// Icons live here rather than in the category data so that
// src/lib/features/* stays a pure data layer with no React or lucide
// dependency. Keyed by slug; a missing key falls back to Wrench.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  setup: Rocket,
  "ai-chat": MessageSquare,
  voice: Mic,
  memory: Brain,
  languages: LanguagesIcon,
  tools: Wrench,
  "knowledge-packs": BookOpen,
  specialists: Users,
  proactive: Bell,
  "action-hub": Briefcase,
  "screen-automation": Monitor,
  "cloud-ai": Cloud,
  customisation: Palette,
  "unrestricted-mode": ShieldAlert,
};

// Still on the roadmap. Kept on the hub as a short strip rather than
// given a category page of its own: two items is not a page.
const COMING_SOON = [
  {
    icon: BookOpen,
    title: "More knowledge packs",
    desc: "Science, history, and specialised reference databases.",
  },
  {
    icon: PenTool,
    title: "More connectors",
    desc: "Outlook, Discord, and LinkedIn on the same connector framework that powers Gmail and Google Calendar.",
  },
];

export default function FeaturesPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "InnerZero features",
    itemListElement: FEATURE_CATEGORIES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.navLabel,
      description: c.hubTeaser,
      url: absoluteUrl(`/features/${c.slug}`),
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "InnerZero",
    operatingSystem: "Windows 10, Windows 11, macOS 14+, Linux x86_64",
    applicationCategory: "DesktopApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    description:
      "Free private AI assistant with a 26-language interface, chat, voice, memory, 30+ tools, Gmail and Google Calendar connectors, proactive briefings, an Action Hub for web research and job applications, knowledge packs, and screen automation. Runs entirely on your PC.",
    url: absoluteUrl("/"),
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              Everything you need. Nothing you don&apos;t.
            </h1>
            <p className="mt-4 text-lg text-text-secondary">
              InnerZero is a complete AI assistant that runs on your PC. Here&apos;s
              what&apos;s inside, area by area.
            </p>
          </div>
        </Container>
      </section>

      {/* Category grid. Each card is the entry point to that area's own
          page, where the full capability detail and the links to the
          step-by-step guides live. */}
      <section className="pb-12 md:pb-16">
        <Container>
          <ScrollReveal>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FEATURE_CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICONS[c.slug] ?? Wrench;
                const preview = c.capabilities
                  .filter((cap) => !cap.comingSoon)
                  .slice(0, 4)
                  .map((cap) => cap.title);

                return (
                  <Link
                    key={c.slug}
                    href={`/features/${c.slug}`}
                    className="group flex flex-col rounded-lg border border-border-default bg-bg-card p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-gold hover:shadow-[0_0_16px_rgba(212,168,67,0.04)]"
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-text-primary transition-colors group-hover:text-accent-gold">
                          {c.navLabel}
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                          {c.hubTeaser}
                        </p>
                      </div>
                    </div>
                    {preview.length > 0 && (
                      <p className="mt-4 border-t border-border-default pt-3 text-xs leading-relaxed text-text-muted">
                        {preview.join(" · ")}
                      </p>
                    )}
                    {/* navLabel is used verbatim, not lowercased: "AI Chat"
                        lowercases to "ai chat", which reads as a typo. */}
                    <span className="mt-4 text-sm font-medium text-text-muted transition-colors group-hover:text-accent-gold">
                      Explore {c.navLabel}
                    </span>
                  </Link>
                );
              })}
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Coming soon */}
      <section className="bg-bg-secondary py-12 md:py-16">
        <Container>
          <ScrollReveal>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-text-primary">
                Coming Soon
              </h2>
              <p className="mt-1 text-text-secondary">What&apos;s next.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {COMING_SOON.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-border-default bg-bg-card p-5"
                >
                  <div className="flex items-start gap-3">
                    <item.icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {item.title}
                        <span className="ml-2 inline-flex items-center rounded-full border border-border-default px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                          Coming soon
                        </span>
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold text-text-primary">
              Ready to try it?
            </h2>
            <p className="mt-3 text-text-secondary">
              Free. Private. No account required.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button href="/download">Download Free</Button>
              <Link
                href="/changelog"
                className="text-sm text-text-muted transition-colors hover:text-accent-gold"
              >
                See what&apos;s new in the changelog
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <JsonLd data={[softwareSchema, itemListSchema]} />
    </>
  );
}
