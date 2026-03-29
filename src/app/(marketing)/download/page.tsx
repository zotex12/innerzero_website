import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SYSTEM_REQUIREMENTS } from "@/lib/constants";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Download",
  description:
    "Download InnerZero — a private AI assistant for Windows. Coming soon. Check system requirements and join the waitlist.",
  openGraph: {
    title: "Download | InnerZero",
    description:
      "Download InnerZero for Windows. Coming soon — join the waitlist.",
    url: "https://innerzero.com/download",
  },
});

export default function DownloadPage() {
  return (
    <div className="pt-28 pb-12 md:pt-36 md:pb-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="gold">Coming Soon</Badge>
          <h1 className="mt-4 text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Download InnerZero
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            InnerZero is currently in development. Join the waitlist to be the first to download when we launch.
          </p>

          <div className="mt-8">
            <Button href="/waitlist">Join the Waitlist</Button>
          </div>
        </div>

        <ScrollReveal>
          <div className="mx-auto mt-16 grid max-w-2xl gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-border-default bg-bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Minimum Requirements
              </h2>
              <ul className="space-y-2">
                {SYSTEM_REQUIREMENTS.minimum.map((req) => (
                  <li
                    key={req}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border-default bg-bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Recommended
              </h2>
              <ul className="space-y-2">
                {SYSTEM_REQUIREMENTS.recommended.map((req) => (
                  <li
                    key={req}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </div>
  );
}
