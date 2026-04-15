import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy | InnerZero: Private AI Assistant",
  description:
    "InnerZero keeps your data on your machine. No accounts, no tracking, no data collection. ICO registered (ZC122497). Read our full privacy policy.",
  openGraph: {
    title: "Privacy Policy | InnerZero: Private AI Assistant",
    description:
      "Your data stays on your machine. No accounts, no tracking, no data collection.",
    url: "https://innerzero.com/privacy",
  },
});

const FAQ_ITEMS = [
  {
    question: "Does InnerZero collect my data?",
    answer:
      "No. The InnerZero desktop application does not collect or transmit any personal data by default. All AI processing, conversations, memory, and documents remain on your local machine. No telemetry, analytics, or crash reporting is included.",
  },
  {
    question: "Where is my data stored with InnerZero?",
    answer:
      "All your conversations, memories, files, and settings are stored locally on your machine in a local database. Nothing is uploaded to any server unless you choose to enable optional cloud mode.",
  },
  {
    question: "Does InnerZero send data to the cloud?",
    answer:
      "Not by default. Cloud mode is optional and off by default. If you enable it, only your current prompt and a short conversation window are sent to the AI provider. Your full memory, files, and profile are never sent.",
  },
  {
    question: "Is InnerZero GDPR compliant?",
    answer:
      "Yes. Summers Solutions Ltd is registered with the UK Information Commissioner's Office (ICO), registration reference ZC122497. You have full rights to access, correct, delete, and export your data under UK GDPR.",
  },
  {
    question: "Who is the data controller for InnerZero?",
    answer:
      "Summers Solutions Ltd (Company No. 16448945), registered in England and Wales. For privacy enquiries, contact help@innerzero.com.",
  },
  {
    question: "Can I delete my InnerZero data?",
    answer:
      "Yes. All desktop data is stored locally on your machine and can be deleted at any time. If you have a website account, you can permanently delete it and all associated data from your account settings page.",
  },
];

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
            All conversations, memories, and files stay on your machine.
          </p>

          {/* Section 1: Plain-language explainer */}
          <ScrollReveal>
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-text-primary">
                How InnerZero Protects Your Privacy
              </h2>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    Everything stays local
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    All your conversations, memories, files, and settings are stored locally on your machine. All AI processing happens on your hardware. Nothing is uploaded unless you choose otherwise.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    No account required
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    You can use InnerZero without creating an account. No email, no sign-up, no personal information needed.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    No tracking or telemetry
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    InnerZero does not include telemetry, analytics, usage tracking, or crash reporting. Your usage is completely private.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    Cloud mode is optional
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    If you enable optional cloud mode, only your current prompt and a short conversation window are sent to the AI provider you select (such as DeepSeek, Anthropic, or OpenAI). Your full memory, files, and profile are never sent. InnerZero never stores or logs cloud prompts or responses.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    BYO API keys stay on your machine
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    If you use BYO (Bring Your Own) API keys, requests go directly from your machine to the provider. InnerZero is not involved at all. Keys are encrypted and stored locally.
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
                Last updated: April 2026
              </p>

              <div className="mt-6 space-y-6 text-text-secondary leading-relaxed text-sm">
                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    1. Who We Are
                  </h3>
                  <p>
                    InnerZero is provided by Summers Solutions Ltd (Company No. 16448945), registered in England and Wales at Mclaren Building, 46 The Priory Queensway, Birmingham, B4 7LR.
                  </p>
                  <p className="mt-2">
                    Summers Solutions Ltd is registered with the UK Information Commissioner&apos;s Office (ICO) as a data controller. Registration reference: ZC122497. You can verify this on the{" "}
                    <a
                      href="https://ico.org.uk/ESDWebPages/Entry/ZC122497"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                    >
                      ICO register
                    </a>.
                  </p>
                  <p className="mt-2">
                    For privacy enquiries:{" "}
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
                    <li>Your memory database, full conversation history, personal profile facts, or file contents</li>
                    <li>Your IP address is not included in the data sent to AI providers and is not stored in InnerZero application logs</li>
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
                    11. Data Retention and Deletion
                  </h3>
                  <p>
                    All desktop data is stored locally on your machine and can be deleted at any time by you. Account data (email address) is retained for as long as your account is active. Waitlist data is retained until the waitlist is no longer needed, after which it will be deleted. You can permanently delete your account and all associated data at any time from your{" "}
                    <Link href="/account/settings" className="text-accent-gold hover:text-accent-gold-hover transition-colors">account settings page</Link>.
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

          {/* Trust and compliance */}
          <ScrollReveal>
            <section className="mt-12 rounded-xl border border-border-default bg-bg-card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Trust and Compliance
              </h2>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal" />
                  ICO registered:{" "}
                  <a
                    href="https://ico.org.uk/ESDWebPages/Entry/ZC122497"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                  >
                    ZC122497
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal" />
                  Company: Summers Solutions Ltd (Company No. 16448945)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal" />
                  Jurisdiction: England and Wales
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-teal" />
                  Contact:{" "}
                  <a href="mailto:help@innerzero.com" className="text-accent-gold hover:text-accent-gold-hover transition-colors">
                    help@innerzero.com
                  </a>
                </li>
              </ul>
            </section>
          </ScrollReveal>
        </div>
      </Container>

      {/* JSON-LD: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
