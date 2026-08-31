import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { getCategoriesForGuide } from "@/lib/features";
import { extractFaqs } from "@/lib/blog-faq";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { PostImage } from "@/components/blog/PostImage";
import { Button } from "@/components/ui/Button";
import { absoluteUrl } from "@/lib/metadata";
import { SITE_AUTHOR } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = absoluteUrl(`/blog/${post.slug}`);
  // Blog titles are already long and keyword-rich, so the default
  // "%s | InnerZero: Private AI Assistant" template (a 35-char suffix)
  // pushes the rendered <title> well past Google's ~60-char display limit
  // and truncates the keyword tail. Use an absolute title with at most a
  // short " | InnerZero" brand suffix. Titles that already contain
  // "InnerZero" stand alone so the brand never doubles up.
  const titleField = post.title.includes("InnerZero")
    ? { absolute: post.title }
    : { absolute: `${post.title} | InnerZero` };
  return {
    title: titleField,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author],
      tags: post.tags,
      url,
      images: [
        {
          url: post.ogImage || absoluteUrl("/banner.png"),
          width: 1536,
          height: 1024,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.ogImage || absoluteUrl("/banner.png")],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, post.tags, 3);
  const featurePages = getCategoriesForGuide(post.slug);

  const faqs = extractFaqs(post.content);
  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: {
              "@type": "Answer",
              text: answer,
            },
          })),
        }
      : null;

  return (
    <div className="pt-28 pb-16 md:pt-36 md:pb-24">
      <Container>
        <article className="mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-primary mb-8"
          >
            &larr; Back to Learn
          </Link>

          {/* Post header */}
          <header className="mb-10">
            <h1 className="text-2xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.15]">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-text-secondary leading-relaxed">
              {post.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <span>{post.author}</span>
              <span className="text-border-default">&middot;</span>
              <span>{post.date}</span>
              {post.updated && post.updated !== post.date && (
                <>
                  <span className="text-border-default">&middot;</span>
                  <span>Updated {post.updated}</span>
                </>
              )}
              <span className="text-border-default">&middot;</span>
              <span>{post.readingTime}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent-teal-muted px-3 py-0.5 text-xs font-medium text-accent-teal"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* MDX body */}
          <div className="blog-prose">
            <MDXRemote
              source={post.content}
              components={{ PostImage }}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>

          {/* Author box. Gives the byline a bio and a link to the founder
              page, so readers and crawlers get the same authorship signal
              the BlogPosting Person JSON-LD below asserts. */}
          <hr className="my-12 border-border-default" />
          <section
            aria-labelledby="author-heading"
            className="rounded-xl border border-border-default bg-bg-card p-6"
          >
            <h2
              id="author-heading"
              className="text-xs font-semibold uppercase tracking-wide text-text-muted"
            >
              Written by
            </h2>
            <p className="mt-3 text-base font-semibold text-text-primary">
              {post.author}
              <span className="ml-2 text-sm font-normal text-text-muted">
                {post.authorRole || SITE_AUTHOR.role}
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Louie Summers is the founder of Summers Solutions Ltd and the
              sole developer of InnerZero, based in Birmingham, UK. Every post
              here is written by the person who builds the product.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link
                href={SITE_AUTHOR.profilePath}
                className="text-accent-gold transition-colors hover:text-accent-gold-hover"
              >
                More about the founder
              </Link>
              <a
                href={SITE_AUTHOR.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-gold transition-colors hover:text-accent-gold-hover"
              >
                LinkedIn
              </a>
            </div>
          </section>

          {/* Feature pages this guide belongs to. Derived from the
              `guides` arrays in src/lib/features, so it stays in step
              with the feature side automatically. */}
          {featurePages.length > 0 && (
            <>
              <hr className="my-12 border-border-default" />
              <section aria-labelledby="feature-link-heading">
                <h2
                  id="feature-link-heading"
                  className="mb-6 text-lg font-semibold text-text-primary"
                >
                  {featurePages.length === 1
                    ? "The feature this guide covers"
                    : "The features this guide covers"}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {featurePages.map((f) => (
                    <Link
                      key={f.slug}
                      href={`/features/${f.slug}`}
                      className="group block rounded-lg border border-border-default bg-bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-gold"
                    >
                      <h3 className="text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-gold">
                        {f.navLabel}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                        {f.hubTeaser}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Related posts */}
          {related.length > 0 && (
            <>
              <hr className="my-12 border-border-default" />
              <section>
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Related Posts
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="group block rounded-lg border border-border-default bg-bg-card p-4 transition-all duration-200 hover:border-accent-gold hover:-translate-y-0.5"
                    >
                      <h3 className="text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-gold line-clamp-2">
                        {r.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-text-muted line-clamp-2">
                        {r.description}
                      </p>
                      <p className="mt-2 text-xs text-text-muted">{r.date}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-border-default bg-bg-card p-6 md:p-8 text-center">
            <h3 className="text-lg font-semibold text-text-primary">
              Try InnerZero
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Free private AI assistant for your PC. No cloud. No subscription.
            </p>
            <div className="mt-4">
              <Button href="/download">Download Free</Button>
            </div>
          </div>
        </article>

        {/* JSON-LD: BlogPosting */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.description,
              datePublished: post.date,
              dateModified: post.updated || post.date,
              image: post.ogImage || absoluteUrl("/banner.png"),
              // Author is the Person who wrote the post, not the company.
              // The visible byline names a human, so the structured data has
              // to agree or the authorship signal reads as ambiguous. The
              // company stays on `publisher` below, which is where it belongs.
              author: {
                "@type": "Person",
                "@id": SITE_AUTHOR.schemaId,
                name: post.author,
                jobTitle: post.authorRole || SITE_AUTHOR.role,
                url: absoluteUrl(SITE_AUTHOR.profilePath),
                sameAs: [SITE_AUTHOR.linkedin],
              },
              publisher: {
                "@type": "Organization",
                "@id": `${absoluteUrl("/")}#organization`,
                name: "InnerZero",
                url: absoluteUrl("/"),
                logo: {
                  "@type": "ImageObject",
                  url: absoluteUrl("/images/logo.png"),
                },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": absoluteUrl(`/blog/${post.slug}`),
              },
            }),
          }}
        />

        {/* JSON-LD: FAQPage (only when the post has an FAQ section) */}
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}
      </Container>
    </div>
  );
}
