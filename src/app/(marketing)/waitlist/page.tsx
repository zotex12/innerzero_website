import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { WaitlistForm } from "@/components/sections/WaitlistForm";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Join the Waitlist",
  description:
    "Be the first to experience InnerZero — a private AI assistant that runs entirely on your PC. Join the waitlist for early access.",
  openGraph: {
    title: "Join the Waitlist | InnerZero",
    description:
      "Be the first to experience InnerZero — a private AI assistant that runs on your PC.",
    url: "https://innerzero.com/waitlist",
  },
});

export default function WaitlistPage() {
  return (
    <div className="flex min-h-[80vh] items-center pt-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Be the First to Experience InnerZero
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            InnerZero is coming soon. Join the waitlist to get early access and be notified when we launch.
          </p>
          <p className="mt-2 text-sm text-accent-gold">
            inner peace. inner joy. innerzero.
          </p>

          <WaitlistForm className="mt-8" />

          <p className="mt-6 text-sm text-text-muted">
            No spam. No sharing your email. Just a notification when InnerZero is ready.
          </p>
        </div>
      </Container>
    </div>
  );
}
