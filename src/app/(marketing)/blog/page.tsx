import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Blog",
  description:
    "The InnerZero blog — updates, insights, and news about private AI, local AI assistants, and the future of personal computing.",
  openGraph: {
    title: "Blog | InnerZero",
    description:
      "Updates, insights, and news about private AI and local AI assistants.",
    url: "https://innerzero.com/blog",
  },
});

export default function BlogPage() {
  return (
    <div className="flex min-h-[60vh] items-center pt-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Blog
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Coming soon. We&apos;ll be sharing updates, insights, and behind-the-scenes looks at building InnerZero.
          </p>
          <p className="mt-6 text-sm text-text-muted">
            Join the{" "}
            <a
              href="/waitlist"
              className="text-accent-gold hover:text-accent-gold-hover transition-colors"
            >
              waitlist
            </a>{" "}
            to be notified when we publish our first post.
          </p>
        </div>
      </Container>
    </div>
  );
}
