import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CTABanner } from "@/components/sections/CTABanner";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/about" },
  title: "About",
  description:
    "About InnerZero: a private AI assistant built by Summers Solutions. Our mission is AI that is personal and private.",
  openGraph: {
    title: "About | InnerZero. Private AI Assistant",
    description:
      "About InnerZero: a private AI assistant built by Summers Solutions.",
    url: "https://innerzero.com/about",
  },
});

export default function AboutPage() {
  return (
    <>
      <div className="pt-28 pb-12 md:pt-36 md:pb-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              About InnerZero
            </h1>

            <ScrollReveal>
              <section className="mt-10 space-y-6 text-text-secondary leading-relaxed">
                <h2 className="text-2xl font-semibold text-text-primary">
                  What InnerZero Is
                </h2>
                <p>
                  InnerZero is a private AI assistant that runs entirely on your PC. It uses open-source AI models running locally on your hardware, with no cloud, no servers, no data leaving your machine. You talk to it by text or voice, and it remembers your conversations, preferences, and facts in a personal memory system that only exists on your computer.
                </p>
                <p>
                  It&apos;s designed for people who want the power of AI without giving up their privacy. InnerZero is the AI assistant that respects you.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="mt-12 space-y-6 text-text-secondary leading-relaxed">
                <h2 className="text-2xl font-semibold text-text-primary">
                  Why It Exists
                </h2>
                <p>
                  Most AI assistants send everything you say to the cloud. Your questions, your documents, your personal context, all processed on someone else&apos;s servers, stored in someone else&apos;s database, used to train someone else&apos;s models.
                </p>
                <p>
                  We believe AI should be <strong className="text-text-primary">personal and private</strong>. Your AI assistant should work for you, on your machine, with your data staying exactly where it belongs. with you.
                </p>
                <p>
                  That&apos;s why we built InnerZero. An AI that runs locally, remembers locally, and never phones home.
                </p>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section className="mt-12 space-y-6 text-text-secondary leading-relaxed">
                <h2 className="text-2xl font-semibold text-text-primary">
                  About Summers Solutions
                </h2>
                <p>
                  InnerZero is built by{" "}
                  <a
                    href="https://summerssolutions.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                  >
                    Summers Solutions
                  </a>
                  , a UK-based software company focused on building tools that respect user privacy and put people in control of their technology.
                </p>
                <p>
                  InnerZero is our flagship product, the result of a deep belief that powerful AI and genuine privacy can coexist.
                </p>
              </section>
            </ScrollReveal>
          </div>
        </Container>
      </div>

      <CTABanner />

      {/* JSON-LD: Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://innerzero.com/#organization",
            name: "InnerZero",
            url: "https://innerzero.com",
            description:
              "InnerZero is a free private AI assistant that runs entirely on your PC. Built by Summers Solutions, a UK-based software company focused on privacy-respecting tools.",
            foundingDate: "2025",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Birmingham",
              addressCountry: "GB",
            },
            logo: {
              "@type": "ImageObject",
              url: "https://innerzero.com/images/logo.png",
            },
            sameAs: [
              "https://x.com/InnerZero_ai",
              "https://www.instagram.com/innerzero_ai",
              "https://www.linkedin.com/company/innerzero",
              "https://discord.gg/rn9SPXgThT",
              "https://github.com/zotex12/innerzero-releases",
            ],
            parentOrganization: {
              "@type": "Organization",
              name: "Summers Solutions",
              url: "https://summerssolutions.co.uk",
            },
          }),
        }}
      />
    </>
  );
}
