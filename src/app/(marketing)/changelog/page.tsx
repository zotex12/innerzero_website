import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Changelog",
  description:
    "InnerZero changelog: release notes, new features, improvements, and bug fixes for every version.",
  openGraph: {
    title: "Changelog | InnerZero",
    description: "Release notes and updates for InnerZero.",
    url: "https://innerzero.com/changelog",
  },
});

export default function ChangelogPage() {
  return (
    <div className="flex min-h-[60vh] items-center pt-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Changelog
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Check back for release notes. We&apos;ll document every update, new feature, and improvement here.
          </p>
          <p className="mt-6 text-sm text-text-muted">
            InnerZero is currently in development.
          </p>
        </div>
      </Container>
    </div>
  );
}
