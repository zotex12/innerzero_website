import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SYSTEM_REQUIREMENTS } from "@/lib/constants";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Download Free | InnerZero — Private AI Assistant",
  description:
    "Download InnerZero for free. A private AI assistant that runs on your PC with no subscription, no account, and no cloud required.",
  openGraph: {
    title: "Download Free | InnerZero — Private AI Assistant",
    description:
      "Download InnerZero for free. A private AI assistant that runs on your PC.",
    url: "https://innerzero.com/download",
  },
});

export default function DownloadPage() {
  return (
    <div className="pt-28 pb-12 md:pt-36 md:pb-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Download InnerZero
          </h1>
          <p className="mt-2 text-xl font-medium text-accent-teal">
            Free. Private. Yours.
          </p>
          <p className="mt-4 text-lg text-text-secondary">
            InnerZero runs entirely on your PC. No account required. No subscription. Download and start chatting in minutes.
          </p>

          <div className="mt-8">
            <Button href="https://github.com/zotex12/innerzero-releases/releases/latest/download/InnerZero-Setup-0.1.0.exe">Download for Windows</Button>
            <p className="mt-3 text-sm text-text-muted">
              v0.1.0 · ~265 MB · Windows 10/11 64-bit
            </p>
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

        <div className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-sm text-text-muted">
            macOS and Linux versions are planned for the future.
          </p>
          <p className="mt-4">
            <Link
              href="/pricing"
              className="text-sm text-text-secondary transition-colors hover:text-accent-gold"
            >
              Need cloud AI? See pricing
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
