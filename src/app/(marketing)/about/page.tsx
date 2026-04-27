import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CTABanner } from "@/components/sections/CTABanner";
import { VideoEmbed } from "@/components/sections/VideoEmbed";
import { absoluteUrl, createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/about" },
  // Absolute title bypasses the "%s | InnerZero..." template so the
  // page does not render "About | InnerZero. Private AI Assistant"
  // with the brand twice. Same fix as the home page and /models.
  title: {
    absolute:
      "About InnerZero: The Team and Mission Behind Your Private AI",
  },
  description:
    "About InnerZero: a private AI assistant built by Summers Solutions. Our mission is AI that is personal and private.",
  openGraph: {
    title: "About | InnerZero. Private AI Assistant",
    description:
      "About InnerZero: a private AI assistant built by Summers Solutions.",
    url: "https://innerzero.com/about",
  },
});

const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/louie-summers/";
const SUMMERS_SOLUTIONS_URL = "https://www.summerssolutions.co.uk/";
const COMPANIES_HOUSE_URL =
  "https://find-and-update.company-information.service.gov.uk/company/16448945";
const COMPANIES_HOUSE_OFFICERS_URL =
  "https://find-and-update.company-information.service.gov.uk/company/16448945/officers";
const ICO_REGISTRATION_URL =
  "https://ico.org.uk/ESDWebPages/Entry/ZC122497";

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

            <ScrollReveal>
              <section className="mt-12 space-y-6 text-text-secondary leading-relaxed">
                <h2 className="text-2xl font-semibold text-text-primary">
                  Meet the founder
                </h2>
                <p>
                  I&apos;m Louie Summers, founder of Summers Solutions Ltd and the sole developer of InnerZero. I&apos;m based in Birmingham, UK. I started Summers Solutions to build software that respects user privacy by default. InnerZero is the product I always wanted: powerful AI that does not phone home.
                </p>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  <li>
                    <a
                      href={FOUNDER_LINKEDIN}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                    >
                      Louie on LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      href={SUMMERS_SOLUTIONS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                    >
                      Summers Solutions site
                    </a>
                  </li>
                </ul>
              </section>
            </ScrollReveal>

            <ScrollReveal>
              <section
                aria-labelledby="verify-summers-solutions"
                className="mt-12 rounded-xl border border-border-default bg-bg-card p-6 md:p-8"
              >
                <h2
                  id="verify-summers-solutions"
                  className="text-xl font-semibold text-text-primary"
                >
                  Verify Summers Solutions
                </h2>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Public registers you can use to confirm Summers Solutions exists, is in good standing, and is the data controller behind this site.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a
                      href={COMPANIES_HOUSE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                    >
                      Companies House registration (No. 16448945)
                    </a>
                  </li>
                  <li>
                    <a
                      href={COMPANIES_HOUSE_OFFICERS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                    >
                      Companies House officers (director listing)
                    </a>
                  </li>
                  <li>
                    <a
                      href={ICO_REGISTRATION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                    >
                      ICO data protection register entry (ZC122497)
                    </a>
                  </li>
                </ul>
                <address className="mt-5 text-sm text-text-muted not-italic leading-relaxed">
                  Summers Solutions Ltd. Company No. 16448945. Registered office: McLaren Building, 46 The Priory Queensway, Birmingham, B4 7LR, United Kingdom.
                </address>
              </section>
            </ScrollReveal>
          </div>
        </Container>
      </div>

      <VideoEmbed
        videoId="DubxqF7eWRQ"
        title="Watch the walkthrough"
        subtitle="See the app running and every major feature in one go."
      />

      <CTABanner />

      {/* JSON-LD: Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${absoluteUrl("/")}#organization`,
            name: "InnerZero",
            legalName: "Summers Solutions Ltd",
            url: absoluteUrl("/"),
            description:
              "InnerZero is a free private AI assistant that runs entirely on your PC. Built by Summers Solutions, a UK-based software company focused on privacy-respecting tools.",
            foundingDate: "2025",
            founder: {
              "@type": "Person",
              name: "Louie Summers",
              jobTitle: "Founder & Developer",
              url: FOUNDER_LINKEDIN,
              sameAs: [FOUNDER_LINKEDIN],
            },
            identifier: {
              "@type": "PropertyValue",
              propertyID: "Companies House",
              value: "16448945",
            },
            address: {
              "@type": "PostalAddress",
              streetAddress: "McLaren Building, 46 The Priory Queensway",
              addressLocality: "Birmingham",
              postalCode: "B4 7LR",
              addressCountry: "GB",
            },
            logo: {
              "@type": "ImageObject",
              url: absoluteUrl("/images/logo.png"),
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
