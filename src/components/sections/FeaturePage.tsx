import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HardwareTable } from "@/components/sections/HardwareTable";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/metadata";
import type { FeatureCategory, FeatureScreenshot } from "@/lib/features/types";
import { getCategory } from "@/lib/features";

// Full class names, never built by concatenation, so Tailwind's scanner
// can see both variants.
function frameAspect(shot: FeatureScreenshot): string {
  return shot.frame === "square" ? "aspect-4/3" : "aspect-19/10";
}

// Shared shell for every /features/<slug> page. Mirrors the PersonaPage
// pattern (typed data in, consistent chrome out) so the two page families
// stay visually consistent without sharing a component that has to flex
// for both.
//
// Screenshot framing (dark frame, 19:10 inner aspect, object-contain)
// matches HeroScreenshots and PersonaPage deliberately: product imagery
// reads as one system across the site.

export function FeaturePage({ data }: { data: FeatureCategory }) {
  const {
    slug,
    h1,
    seoDescription,
    leadIn,
    leadOut,
    hero,
    stats,
    capabilities,
    inlineScreenshots,
    guides,
    faqs,
    related,
    published,
    modified,
  } = data;

  const pageUrl = absoluteUrl(`/features/${slug}`);
  const relatedCategories = related
    .map((s) => getCategory(s))
    .filter((c): c is FeatureCategory => Boolean(c));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Features",
        item: absoluteUrl("/features"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data.navLabel,
        item: pageUrl,
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: h1,
    description: seoDescription,
    author: { "@type": "Organization", name: "InnerZero" },
    publisher: {
      "@type": "Organization",
      name: "InnerZero",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo.png"),
      },
    },
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    image: hero ? absoluteUrl(hero.src) : absoluteUrl("/banner.png"),
    isPartOf: {
      "@type": "WebPage",
      name: "Features",
      url: absoluteUrl("/features"),
    },
  };

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  const schemas = faqSchema
    ? [breadcrumbSchema, articleSchema, faqSchema]
    : [breadcrumbSchema, articleSchema];

  return (
    <div className="pt-28 pb-16 md:pt-36 md:pb-24">
      <Container>
        <article className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <li>
                <Link
                  href="/features"
                  className="transition-colors hover:text-accent-gold"
                >
                  Features
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-text-secondary">{data.navLabel}</li>
            </ol>
          </nav>

          {/* Hero */}
          <header>
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              {h1}
            </h1>
            <p className="mt-5 text-lg text-text-secondary md:text-xl">
              {leadIn}
            </p>
            <p className="mt-3 text-lg text-text-secondary md:text-xl">
              {leadOut}
            </p>
          </header>

          {/* Stat strip */}
          {stats && stats.length > 0 && (
            <section
              aria-label="Key numbers"
              className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border-default bg-bg-card p-5 text-center"
                >
                  <div className="text-2xl font-bold text-accent-gold">
                    {s.value}
                  </div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {s.label}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Hero screenshot */}
          {hero && (
            <section className="mt-10 md:mt-14" aria-label="Product screenshot">
              <div className="overflow-hidden rounded-xl border border-border-default bg-[#0a0a0f] p-3 md:p-4">
                <div
                  className={`relative ${frameAspect(hero)} overflow-hidden rounded-md`}
                >
                  <Image
                    src={hero.src}
                    alt={hero.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <p className="mt-3 text-center text-sm text-text-secondary">
                {hero.caption}
              </p>
            </section>
          )}

          {/* On this page. Gives the hub-card click-through the anchors it
              points at, and gives the page an internal skim path. */}
          {capabilities.length > 3 && (
            <nav
              aria-labelledby="toc-heading"
              className="mt-14 rounded-xl border border-border-default bg-bg-card p-6 md:mt-20"
            >
              <h2
                id="toc-heading"
                className="text-lg font-semibold text-text-primary"
              >
                On this page
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-text-secondary sm:grid-cols-2">
                {capabilities.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`#${c.id}`}
                      className="transition-colors hover:text-accent-gold"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Capabilities */}
          <section
            aria-labelledby="capabilities-heading"
            className="mt-14 md:mt-20"
          >
            <h2 id="capabilities-heading" className="sr-only">
              What is included
            </h2>
            <div className="space-y-10">
              {capabilities.map((c) => (
                <div key={c.id} id={c.id} className="scroll-mt-28">
                  <h3 className="text-xl font-semibold text-text-primary md:text-2xl">
                    {c.title}
                    {c.comingSoon && (
                      <span className="ml-3 inline-flex items-center rounded-full border border-border-default px-2.5 py-0.5 align-middle text-xs font-medium text-text-secondary">
                        Coming soon
                      </span>
                    )}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-text-secondary">
                    {c.body}
                  </p>
                  {inlineScreenshots?.[c.id] && (
                    <figure className="mt-6">
                      <div className="overflow-hidden rounded-xl border border-border-default bg-[#0a0a0f] p-3">
                        <div
                          className={`relative ${frameAspect(inlineScreenshots[c.id])} overflow-hidden rounded-md`}
                        >
                          <Image
                            src={inlineScreenshots[c.id].src}
                            alt={inlineScreenshots[c.id].alt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 80vw"
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <figcaption className="mt-3 text-center text-sm text-text-secondary">
                        {inlineScreenshots[c.id].caption}
                      </figcaption>
                    </figure>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Guides. The tutorial layer lives on the blog; this is the
              handoff from "what it does" to "how to do it". */}
          {guides.length > 0 && (
            <section
              aria-labelledby="guides-heading"
              className="mt-14 md:mt-20"
            >
              <h2
                id="guides-heading"
                className="text-2xl font-bold text-text-primary md:text-3xl"
              >
                Step-by-step guides
              </h2>
              <p className="mt-2 text-text-secondary">
                Walkthroughs for setting this up and getting the most from it.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/blog/${g.slug}`}
                    className="group rounded-xl border border-border-default bg-bg-card p-5 transition-colors hover:border-accent-gold/40"
                  >
                    <h3 className="text-base font-semibold text-text-primary transition-colors group-hover:text-accent-gold">
                      {g.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {g.blurb}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          {faqs.length > 0 && (
            <section aria-labelledby="faq-heading" className="mt-14 md:mt-20">
              <h2
                id="faq-heading"
                className="text-2xl font-bold text-text-primary md:text-3xl"
              >
                Frequently asked questions
              </h2>
              <div className="mt-6 divide-y divide-border-default rounded-xl border border-border-default bg-bg-card">
                {faqs.map((f) => (
                  <div key={f.question} className="p-5">
                    <h3 className="text-base font-semibold text-text-primary">
                      {f.question}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {f.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related categories */}
          {relatedCategories.length > 0 && (
            <section
              aria-labelledby="related-heading"
              className="mt-14 rounded-xl border border-border-default bg-bg-card p-6 md:mt-20"
            >
              <h2
                id="related-heading"
                className="text-lg font-semibold text-text-primary"
              >
                Explore more
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {relatedCategories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/features/${c.slug}`}
                      className="group block transition-colors"
                    >
                      <span className="font-medium text-text-primary transition-colors group-hover:text-accent-gold">
                        {c.navLabel}
                      </span>
                      <span className="mt-0.5 block text-text-secondary">
                        {c.hubTeaser}
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/features"
                    className="font-medium text-text-secondary transition-colors hover:text-accent-gold"
                  >
                    All features
                  </Link>
                </li>
              </ul>
            </section>
          )}
        </article>
      </Container>

      {/* Hardware tiers. Mounted only on /features/setup, where the natural
          question after "the wizard picks your models for you" is "so what
          hardware do I actually need". Sits outside the article Container
          because HardwareTable brings its own section + Container and would
          otherwise be double-wrapped and clipped to the article's max-w-4xl.
          Data lives in src/lib/hardware.ts and is the buying-decision view;
          the setup copy covers the tier ladder the wizard itself offers. */}
      {slug === "setup" && <HardwareTable />}

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
                href="/pricing"
                className="text-sm text-text-muted transition-colors hover:text-accent-gold"
              >
                See pricing
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <JsonLd data={schemas} />
    </div>
  );
}
