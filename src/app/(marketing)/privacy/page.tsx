import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Privacy",
  description:
    "InnerZero privacy: all AI runs locally on your PC. No cloud processing, no data uploads, no tracking. Read our full privacy policy.",
  openGraph: {
    title: "Privacy | InnerZero — Private AI Assistant",
    description:
      "All AI runs locally on your PC. No cloud processing, no data uploads.",
    url: "https://innerzero.com/privacy",
  },
});

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-12 md:pt-36 md:pb-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Your Privacy, Protected
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            InnerZero is built from the ground up to keep your data private.
          </p>

          {/* Section 1: Plain-language explainer */}
          <ScrollReveal>
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-text-primary">
                How InnerZero Protects Your Privacy
              </h2>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  All AI processing happens on your hardware
                </li>
                <li className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  Memory and conversations are stored locally — never uploaded
                </li>
                <li className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  No account required to use InnerZero
                </li>
                <li className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  If you enable optional cloud mode, your prompts are sent to the AI provider (e.g. DeepSeek, Anthropic, OpenAI) and returned — InnerZero never stores or logs them
                </li>
                <li className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  If you use BYO API keys, requests go directly to the provider — InnerZero is not involved at all
                </li>
                <li className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  No telemetry, no tracking, no analytics on your usage
                </li>
              </ul>
            </section>
          </ScrollReveal>

          {/* Section 2: Formal privacy policy */}
          <ScrollReveal>
            <section className="mt-16 border-t border-border-default pt-12">
              <h2 className="text-2xl font-semibold text-text-primary">
                Privacy Policy
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Last updated: March 2026
              </p>

              <div className="mt-6 space-y-6 text-text-secondary leading-relaxed text-sm">
                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    1. What data the website collects
                  </h3>
                  <p>
                    When you create an account on innerzero.com, we collect your email address. Payment information is processed securely by Stripe — we never store your card details. If you join our waitlist, we store your email address. We may use privacy-respecting analytics (such as Plausible) in the future — never Google Analytics.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    2. What data the desktop app collects
                  </h3>
                  <p>
                    The InnerZero desktop application does not collect or transmit any personal data. All AI processing, conversations, memory, and documents remain on your local machine. No telemetry, analytics, or usage tracking is included.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    3. Cookies
                  </h3>
                  <p>
                    The InnerZero website uses only essential cookies for functionality (such as theme preference stored in localStorage). We do not use advertising or tracking cookies. If we add analytics in the future, we will update this policy and provide a cookie consent mechanism.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    4. GDPR compliance
                  </h3>
                  <p>
                    We comply with UK GDPR. You have the right to access, correct, or delete your personal data at any time. To make a data request, contact us at help@innerzero.com. We will respond within 30 days.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    5. Data processors
                  </h3>
                  <p>
                    We use the following third-party services to operate InnerZero:
                  </p>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>Vercel — website hosting</li>
                    <li>Stripe — payment processing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    6. Contact
                  </h3>
                  <p>
                    For any privacy-related questions or data requests, contact us at{" "}
                    <a href="mailto:help@innerzero.com" className="text-accent-gold hover:text-accent-gold-hover transition-colors">
                      help@innerzero.com
                    </a>.
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>
        </div>
      </Container>
    </div>
  );
}
