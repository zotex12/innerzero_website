import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Button } from "@/components/ui/Button";
import { absoluteUrl } from "@/lib/metadata";

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
  return {
    title: post.title,
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
            <MDXRemote source={post.content} />
          </div>

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
              author: {
                "@type": "Organization",
                "@id": `${absoluteUrl("/")}#organization`,
                name: "InnerZero",
                url: absoluteUrl("/"),
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
      </Container>
    </div>
  );
}
