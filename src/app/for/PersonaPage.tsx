import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";

// Shared layout for the /for/* persona landing pages. Each persona
// supplies typed content; this component renders the consistent
// shell (hero, why, how, FAQ, related, CTA) plus Article + FAQPage
// JSON-LD. Explicit and data-driven to match the site's existing
// /features and /models style.

export interface PersonaHowCard {
  title: string;
  body: React.ReactNode;
}

export interface PersonaFAQ {
  question: string;
  answer: string;
}

export interface PersonaRelatedPost {
  slug: string;
  title: string;
}

export interface PersonaBullet {
  title: string;
  detail: string;
}

export interface PersonaScreenshot {
  src: string;
  alt: string;
  caption: string;
}

export interface PersonaPageProps {
  slug: string;
  persona: string;
  h1: string;
  description: string;
  leadPain: string;
  leadFit: string;
  whyBullets: PersonaBullet[];
  howCards: PersonaHowCard[];
  faqItems: PersonaFAQ[];
  relatedBlog: PersonaRelatedPost[];
  publishedDate: string;
  modifiedDate: string;
  // Optional hero screenshot rendered between the lead paragraphs
  // and the "Why" section. Static (no lightbox) since each persona
  // page targets a single concept and the image is supporting copy
  // rather than a gallery.
  heroScreenshot?: PersonaScreenshot;
}

export function PersonaPage(props: PersonaPageProps) {
  const {
    slug,
    persona,
    h1,
    description,
    leadPain,
    leadFit,
    whyBullets,
    howCards,
    faqItems,
    relatedBlog,
    publishedDate,
    modifiedDate,
    heroScreenshot,
  } = props;

  const pageUrl = `${SITE_URL}/for/${slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: h1,
    description,
    author: { "@type": "Person", name: "Louie" },
    publisher: {
      "@type": "Organization",
      name: "InnerZero",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    image: `${SITE_URL}/og-default.png`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="pt-28 pb-16 md:pt-36 md:pb-24">
      <Container>
        <article className="mx-auto max-w-4xl">
          {/* Hero */}
          <header>
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              {h1}
            </h1>
            <p className="mt-5 text-lg text-text-secondary md:text-xl">
              {leadPain}
            </p>
            <p className="mt-3 text-lg text-text-secondary md:text-xl">
              {leadFit}
            </p>
          </header>

          {/* Optional hero screenshot. Mirrors HeroScreenshots framing
              (dark frame + 19:10 inner aspect + object-contain) so
              persona pages and the homepage feel consistent without
              the lightbox interaction overhead. */}
          {heroScreenshot && (
            <section className="mt-10 md:mt-14" aria-label="Product screenshot">
              <div className="overflow-hidden rounded-xl border border-border-default bg-[#0a0a0f] p-3 md:p-4">
                <div className="relative aspect-19/10 overflow-hidden rounded-md">
                  <Image
                    src={heroScreenshot.src}
                    alt={heroScreenshot.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="mt-3 text-center text-sm text-text-secondary">
                {heroScreenshot.caption}
              </p>
            </section>
          )}

          {/* Why */}
          <section
            aria-labelledby="why-heading"
            className="mt-14 md:mt-20"
          >
            <h2
              id="why-heading"
              className="text-2xl font-bold text-text-primary md:text-3xl"
            >
              Why {persona} choose local AI
            </h2>
            <ul className="mt-6 space-y-4">
              {whyBullets.map((b) => (
                <li
                  key={b.title}
                  className="flex gap-3 text-base text-text-secondary"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="text-text-primary">{b.title}:</strong>{" "}
                    {b.detail}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* How */}
          <section
            aria-labelledby="how-heading"
            className="mt-14 md:mt-20"
          >
            <h2
              id="how-heading"
              className="text-2xl font-bold text-text-primary md:text-3xl"
            >
              How InnerZero helps {persona}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {howCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-xl border border-border-default bg-bg-card p-5 transition-colors hover:border-accent-gold/40"
                >
                  <h3 className="text-base font-semibold text-text-primary">
                    {card.title}
                  </h3>
                  <div className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {card.body}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section
            aria-labelledby="faq-heading"
            className="mt-14 md:mt-20"
          >
            <h2
              id="faq-heading"
              className="text-2xl font-bold text-text-primary md:text-3xl"
            >
              Frequently asked questions
            </h2>
            <div className="mt-6 divide-y divide-border-default rounded-xl border border-border-default bg-bg-card">
              {faqItems.map((item) => (
                <div key={item.question} className="p-5">
                  <h3 className="text-base font-semibold text-text-primary">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Related reading */}
          <section
            aria-labelledby="related-heading"
            className="mt-14 md:mt-20 rounded-xl border border-border-default bg-bg-card p-6"
          >
            <h2
              id="related-heading"
              className="text-lg font-semibold text-text-primary"
            >
              Further reading
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-text-secondary sm:grid-cols-2">
              {relatedBlog.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/blog/${b.slug}`}
                    className="transition-colors hover:text-accent-gold"
                  >
                    {b.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/what-is-local-ai"
                  className="transition-colors hover:text-accent-gold"
                >
                  What is local AI?
                </Link>
              </li>
              <li>
                <Link
                  href="/models"
                  className="transition-colors hover:text-accent-gold"
                >
                  Supported AI models
                </Link>
              </li>
            </ul>
          </section>
        </article>
      </Container>

      {/* CTA */}
      <section className="mt-16 py-12 md:mt-20 md:py-16">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold text-text-primary">
              Ready to try it?
            </h2>
            <p className="mt-3 text-text-secondary">
              Free for personal use. No account required.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button href="/download">Download InnerZero</Button>
              <Link
                href="/features"
                className="text-sm text-text-muted transition-colors hover:text-accent-gold"
              >
                See all features
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-text-muted transition-colors hover:text-accent-gold"
              >
                See pricing
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <JsonLd data={[articleSchema, faqSchema]} />
    </div>
  );
}
