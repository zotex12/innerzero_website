import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/metadata";
import { getAllPosts, getAllTags } from "@/lib/blog";
import Link from "next/link";
import { BlogGrid } from "./BlogGrid";
import { TimeAgo } from "@/components/ui/TimeAgo";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/blog" },
  title: "Learn | InnerZero: Private AI Guides & Updates",
  description:
    "Guides, tutorials, and updates on running AI privately on your PC. Learn about local AI models, memory systems, voice assistants, and more.",
  openGraph: {
    title: "Learn | InnerZero: Private AI Guides & Updates",
    description:
      "Guides, tutorials, and updates on running AI privately on your PC.",
    url: "https://innerzero.com/blog",
  },
});

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <div className="pt-28 pb-16 md:pt-36 md:pb-24">
      <Container>
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Learn
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Guides, updates, and deep dives on private AI, local models, and
            building with InnerZero.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="block mb-12 md:mb-16">
            <div className="relative overflow-hidden rounded-2xl border border-accent-gold/20 bg-gradient-to-br from-bg-card to-bg-secondary p-8 md:p-12 transition-all duration-200 hover:border-accent-gold/40 hover:shadow-[0_0_30px_rgba(212,168,67,0.08)]">
              <div className="flex flex-wrap gap-2 mb-4">
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent-teal-muted px-3 py-0.5 text-xs font-medium text-accent-teal"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-text-secondary text-base md:text-lg max-w-2xl">
                {featured.description}
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
                <TimeAgo date={featured.date} />
                <span>{featured.readingTime}</span>
                <span>{featured.author}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Tag filter + post grid (client component) */}
        <BlogGrid posts={rest} tags={tags} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: "InnerZero Learn",
              url: "https://innerzero.com/blog",
              description:
                "Guides and updates on private AI, local models, and InnerZero.",
              blogPost: posts.map((p) => ({
                "@type": "BlogPosting",
                headline: p.title,
                description: p.description,
                datePublished: p.date,
                author: { "@type": "Person", name: p.author },
                url: `https://innerzero.com/blog/${p.slug}`,
              })),
            }),
          }}
        />
      </Container>
    </div>
  );
}
