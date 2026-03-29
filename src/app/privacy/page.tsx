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

              <div className="mt-6 space-y-6 text-text-secondary leading-relaxed">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    All AI runs on your hardware
                  </h3>
                  <p>
                    InnerZero downloads an AI model to your PC during setup. Every conversation, every query, every response is processed locally. Nothing is sent to a cloud server. There is no remote API handling your prompts.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Memory stays on your machine
                  </h3>
                  <p>
                    InnerZero&apos;s personal memory system stores everything in a local database on your computer. Your conversations, preferences, facts, and documents are never uploaded anywhere. If you delete InnerZero, you can delete all your data with it.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    The only network call: licence verification
                  </h3>
                  <p>
                    The only time InnerZero connects to the internet is to verify your subscription licence. This check sends only:
                  </p>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>Your licence token (a unique key, not your email or password)</li>
                    <li>A device fingerprint hash (a one-way hash — cannot identify your hardware)</li>
                    <li>App version and OS name (for update compatibility)</li>
                  </ul>
                  <p className="mt-2">
                    It does <strong>not</strong> send any conversation content, memory data, file contents, prompts, responses, or usage patterns. Ever.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    No telemetry, no tracking
                  </h3>
                  <p>
                    InnerZero does not include any analytics, telemetry, or tracking in the desktop app. We do not monitor how you use the app, what you ask, or how often you use it.
                  </p>
                </div>
              </div>
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
                    The InnerZero desktop application does not collect or transmit any personal data. All AI processing, conversations, memory, and documents remain on your local machine. The only outbound connection is licence verification, which sends a licence token, device fingerprint hash, app version, and operating system name.
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
