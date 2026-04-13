import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Privacy",
  description:
    "InnerZero privacy: all AI runs locally on your PC. No cloud processing, no data uploads, no tracking. Read our full privacy policy.",
  openGraph: {
    title: "Privacy | InnerZero. Private AI Assistant",
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
                  Memory and conversations are stored locally, never uploaded
                </li>
                <li className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  No account required to use InnerZero
                </li>
                <li className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  If you enable optional cloud mode, your prompts are sent to the AI provider (e.g. DeepSeek, Anthropic, OpenAI) and returned. InnerZero never stores or logs them
                </li>
                <li className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-teal" />
                  If you use BYO API keys, requests go directly to the provider. InnerZero is not involved at all
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
                Last updated: April 2026
              </p>

              <div className="mt-6 space-y-6 text-text-secondary leading-relaxed text-sm">
                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    1. Who We Are
                  </h3>
                  <p>
                    InnerZero is provided by Summers Solutions Ltd (Company No. 16448945), registered in England and Wales at Mclaren Building, 46 The Priory Queensway, Birmingham, B4 7LR.
                    {process.env.NEXT_PUBLIC_ICO_REGISTRATION_NUMBER && (
                      <> Summers Solutions Ltd is registered with the Information Commissioner&apos;s Office (ICO). Registration number: {process.env.NEXT_PUBLIC_ICO_REGISTRATION_NUMBER}.</>
                    )}
                    {" "}For privacy enquiries:{" "}
                    <a href="mailto:help@innerzero.com" className="text-accent-gold hover:text-accent-gold-hover transition-colors">
                      help@innerzero.com
                    </a>.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    2. What Data the Desktop App Collects
                  </h3>
                  <p>
                    The InnerZero desktop application does not collect or transmit any personal data by default. All AI processing, conversations, memory, and documents remain on your local machine. No telemetry, analytics, usage tracking, or crash reporting is included.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    3. Cloud Mode
                  </h3>
                  <p>
                    If you enable the optional Cloud Mode, your prompts are sent to the third-party AI provider you select (such as DeepSeek, OpenAI, Anthropic, Google AI, or Qwen/DashScope) and responses are returned to your device. InnerZero does not store, log, intercept, or read your prompts or responses at any point. Each AI provider has its own privacy policy governing how they handle your data; you should review the relevant provider&apos;s privacy policy before enabling Cloud Mode.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    4. Cloud AI Service (Managed Subscription)
                  </h3>
                  <p>
                    When you use InnerZero&apos;s managed Cloud AI service (optional paid subscription), the following data is sent to our proxy server:
                  </p>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>Your message text and a short recent conversation window (last 4 exchanges)</li>
                    <li>Your model preference</li>
                  </ul>
                  <p className="mt-2 font-semibold text-text-primary">What is NOT sent:</p>
                  <ul className="mt-1 list-disc pl-6 space-y-1">
                    <li>Your memory database, full conversation history, personal profile facts, file contents, or your IP address (stripped at our proxy before forwarding to the AI provider)</li>
                  </ul>
                  <p className="mt-2">
                    Your prompts are forwarded to the selected AI provider and the response is returned to you. InnerZero does not store, read, or log the content of your prompts or AI responses.
                  </p>
                  <p className="mt-2">
                    Proxy logs are limited to: timestamp, plan tier, model used, and usage count deducted. These are retained for 30 days for billing dispute resolution only, then automatically deleted.
                  </p>
                  <p className="mt-2">
                    AI providers process your data under their own privacy policies and our Data Processing Agreements (DPAs):
                  </p>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>Microsoft Azure (DeepSeek): EU West Europe region, covered by Microsoft DPA</li>
                    <li>Google: covered by Google Cloud Data Processing Addendum</li>
                    <li>Anthropic: covered by Anthropic DPA</li>
                  </ul>
                  <p className="mt-2">
                    When using BYO (Bring Your Own) API keys, your prompts are sent directly to the provider from your device. InnerZero&apos;s servers are not involved.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    5. BYO API Keys
                  </h3>
                  <p>
                    If you use the BYO (Bring Your Own) API key feature, your API keys are encrypted and stored locally on your device only. Keys are never transmitted to Summers Solutions Ltd or any InnerZero server. Requests using BYO keys go directly from your machine to the provider.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    6. Unrestricted Mode
                  </h3>
                  <p>
                    Enabling Unrestricted Mode does not cause any additional data to be collected or transmitted. The uncensored models run locally on your device, and all generated content remains on your machine.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    7. Voice and Microphone
                  </h3>
                  <p>
                    If you use InnerZero&apos;s voice features, the application accesses your microphone to capture speech for local speech-to-text processing. All audio is processed locally on your device using offline speech recognition models. No audio recordings are transmitted, stored, or sent to any server. Audio data is processed in real-time and discarded immediately after transcription. If Cloud Voice mode is enabled, your transcribed text (not audio) is sent to OpenAI for response generation; see Section 3 (Cloud Mode) for details.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    8. What Data the Website Collects
                  </h3>
                  <p>
                    When you create an account on innerzero.com, we collect your email address. If you join our waitlist, we store your email address. Payment information for supporter memberships and donations is processed by Ko-fi and PayPal; we do not receive or store your payment card details. If future cloud plans are offered via Stripe, Stripe will process payments; we will never store card details directly.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    9. Cookies
                  </h3>
                  <p>
                    The InnerZero website uses only essential cookies for functionality (such as authentication session cookies and theme preference stored in localStorage). We do not use advertising, marketing, or third-party tracking cookies. If we add privacy-respecting analytics in the future (such as Plausible), we will update this policy accordingly.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    10. Data Processors
                  </h3>
                  <p>
                    We use the following third-party services:
                  </p>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>Supabase: authentication and database hosting (EU region)</li>
                    <li>Vercel: website hosting and deployment</li>
                    <li>Ko-fi and PayPal: supporter membership and donation payment processing</li>
                    <li>Stripe: cloud AI subscription and credit pack payment processing</li>
                    <li>Formspree: contact form submissions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    11. Data Retention
                  </h3>
                  <p>
                    Account data (email address) is retained for as long as your account is active. Waitlist data is retained until the waitlist is no longer needed, after which it will be deleted. You can permanently delete your account and all associated data at any time from your{" "}
                    <a href="/account/settings" className="text-accent-gold hover:text-accent-gold-hover transition-colors">account settings page</a>.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    12. Your Rights (UK GDPR)
                  </h3>
                  <p>
                    Under UK GDPR, you have the right to: access your personal data; correct inaccurate data; request deletion of your data; object to processing; request data portability; and withdraw consent at any time. To exercise any of these rights, contact{" "}
                    <a href="mailto:help@innerzero.com" className="text-accent-gold hover:text-accent-gold-hover transition-colors">
                      help@innerzero.com
                    </a>. We will respond within 30 days.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    13. Children
                  </h3>
                  <p>
                    InnerZero is not intended for children under 13. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has provided us with personal data, contact us and we will delete it promptly.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    14. Changes to This Policy
                  </h3>
                  <p>
                    We may update this privacy policy from time to time. Changes will be reflected on this page with an updated date.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    15. Contact
                  </h3>
                  <p>
                    For any privacy-related questions or data requests:{" "}
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
