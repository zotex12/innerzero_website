import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/privacy" },
  // Absolute title bypasses the "%s | InnerZero..." template in
  // src/lib/metadata.ts. Without absolute, the brand appears twice in
  // the rendered <title> because this page's title already contains
  // "InnerZero". Same pattern as the home page and /about.
  title: {
    absolute: "Privacy Policy | InnerZero: Private AI Assistant",
  },
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
      "All your conversations, memories, files, and settings are stored locally on your machine in a local database. Nothing is uploaded to any server unless you choose to enable optional cloud mode or send us feedback from the app.",
  },
  {
    question: "Does InnerZero send data to the cloud?",
    answer:
      "Not by default. Cloud mode is optional and off by default. If you enable it, for text chat only your current prompt and a short conversation window are sent to the AI provider, and your full memory, files, and profile are never sent. If you use cloud voice in speech-to-speech mode or a managed voice subscription, your spoken audio is also sent to OpenAI to generate the reply.",
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
                    If you enable optional cloud mode, for text chat only your current prompt and a short conversation window are sent to the AI provider you select (such as DeepSeek, Anthropic, or OpenAI), and your full memory, files, and profile are never sent. InnerZero never stores or logs cloud prompts or responses. If you use cloud voice in speech-to-speech mode or a managed voice subscription, your spoken audio is also sent directly to OpenAI to generate the reply; see the Voice and Microphone section below.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    Optional Google connectors stay private
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    Optional Google connectors are read-only or narrowly scoped. Read-only Gmail with metadata only (sender, subject, snippet). Message bodies are never fetched or stored. Calendar integration uses two-way Google Calendar sync; private events stay on your machine.
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

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    Action Hub is opt-in and yours to approve
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    The optional Action Hub uses your own Apify API key for web research and can help you fill in job applications. Research parameters go to Apify under your own account. Application details you save are sent from your machine straight to the job site you choose, and only after you approve each submission. InnerZero does not receive, store, or proxy any of it.
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
                Last updated: 2026-08-26
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
                  <h4 className="text-sm font-semibold text-text-primary mt-4 mb-1">
                    In-app feedback and optional diagnostic logs
                  </h4>
                  <p>
                    The app has a feedback box you can use to send us a message (the message is optional when you attach a log, see below). When you send one, the message you typed, your app version and operating system are emailed to our support inbox, and a record is stored in our Supabase database so we can respond and keep track of reports. That record holds the message, app version, operating system, the app&apos;s network user agent string, and a salted one-way hash of your IP address that we use only to limit abuse of the feedback service (never the address itself). Nothing is sent unless you press Send.
                  </p>
                  <p className="mt-2">
                    You can choose to attach a window of the app&apos;s own activity log to a feedback message (the last 15 minutes, hour or 24 hours, all entries or errors only). Before it leaves your device the log is reduced to event names, timestamps, short technical labels, numbers and sizes: your prompts, the assistant&apos;s replies, file names and paths, your user name and any other written content are removed. The exact text that will be sent is available in a preview inside the feedback box, so you can check it before you press Send. The attached log is emailed to our support inbox with your message. The stored record notes only whether a log was attached, which window you chose and its size, never the log itself. If you do not choose to attach a log, none is sent.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    3. Cloud Mode
                  </h3>
                  <p>
                    If you enable the optional Cloud Mode, your prompts are sent to the third-party AI provider you select (such as DeepSeek, OpenAI, Anthropic, Google AI, Qwen/DashScope, xAI, or Kimi) and responses are returned to your device. InnerZero does not store, log, intercept, or read your prompts or responses at any point. Each AI provider has its own privacy policy governing how they handle your data; you should review the relevant provider&apos;s privacy policy before enabling Cloud Mode.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Telegram bridge (optional)
                  </h3>
                  <p>
                    InnerZero offers an optional Telegram bridge for mirroring chat messages between your desktop and your phone, and for receiving Proactive Assistant briefings on your phone. The bridge is off by default and must be explicitly enabled in Settings.
                  </p>
                  <p className="mt-2">
                    When enabled, messages and briefings routed through the bridge are processed by Telegram&apos;s servers under their privacy policy and terms of service. Your Telegram bot token is encrypted and stored locally on your device only. You may disable the bridge at any time from Settings.
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
                    Your prompts are routed to one of our AI subprocessors according to your plan tier, and the response is returned to you. If the model is temporarily unavailable, your request may be retried with the same provider or returned as an error, in which case the app falls back to your local model where one is installed; your prompts are not rerouted to any cloud provider not listed below. InnerZero does not store or log the content of your prompts or AI responses, and does not access them for human review.
                  </p>
                  <p className="mt-2">
                    Proxy logs are limited to: timestamp, plan tier, model used, and usage count deducted. To prevent duplicate billing and abuse, the proxy may also retain billing-integrity records consisting of a request identifier, a one-way fingerprint of the request (a cryptographic hash that is not designed to be reversible and does not contain a copy of your text), the usage units charged, and timestamps. All of these records are retained for up to 30 days for billing dispute resolution and abuse prevention, then automatically deleted.
                  </p>
                  <p className="mt-2">
                    Your prompts may be processed by one or more of the following AI subprocessors. The exact provider depends on your plan, current model availability, and our routing configuration at the time of your request. Each processes data under its own privacy policy and, where applicable, a data processing agreement:
                  </p>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>DeepSeek (direct API): covered by DeepSeek&apos;s privacy policy and API terms</li>
                  </ul>
                  <p className="mt-2">
                    If you use managed voice, your spoken audio is processed by an additional subprocessor for the audio itself:
                  </p>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>OpenAI (Realtime voice model): processes your spoken audio during managed voice sessions. Your audio streams directly from your device to OpenAI and does not pass through our proxy server, and InnerZero does not receive or store it. Covered by OpenAI&apos;s privacy policy and API terms.</li>
                  </ul>
                  <p className="mt-2">
                    Managed voice works differently from managed text. Our proxy only issues a short-lived session credential and records the session minutes used for billing, so your voice audio never reaches our servers. See Section 7 (Voice and Microphone) for details.
                  </p>
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
                    If you use InnerZero&apos;s voice features, the application accesses your microphone to capture speech. By default, and whenever cloud voice is off, all audio is processed locally on your device using offline speech recognition models: no audio recordings are transmitted, stored, or sent to any server, and audio is discarded immediately after transcription.
                  </p>
                  <p className="mt-2">
                    If you enable cloud voice, how your speech is handled depends on the mode you choose:
                  </p>
                  <ul className="mt-2 list-disc pl-6 space-y-1">
                    <li>In text-in mode (including the standard and premium cloud voice options), your speech is transcribed locally first, and only the transcribed text, not your audio, is sent to OpenAI to generate a response.</li>
                    <li>In speech-to-speech mode, and for managed voice subscriptions, your raw microphone audio is streamed directly from your device to OpenAI&apos;s Realtime service, which returns spoken audio. Your audio goes directly from your device to OpenAI; it does not pass through InnerZero&apos;s servers, and InnerZero never receives or stores it. OpenAI processes this audio as a subprocessor under its own privacy policy and API terms. For managed voice, InnerZero&apos;s server only issues a short-lived session credential and records the session minutes used for billing; it never handles your audio.</li>
                  </ul>
                  <p className="mt-2">
                    Speech-to-speech voice is off by default, is blocked entirely in Offline and Private modes, and is gated behind a one-time in-app notice explaining that the Privacy Blacklist cannot scrub raw audio. See Section 4 (Cloud AI Service) for the managed subprocessor list.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Proactive Assistant (optional)
                  </h3>
                  <p>
                    Proactive Assistant briefings may pull from your local memory, connected mail (if Gmail is enabled), and knowledge packs to compose briefing output. Composition happens on your machine. If you have routed automation tasks to a cloud model, that routing is covered by the Cloud Mode disclosures above.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Action Hub: web research and job applications (optional)
                  </h3>
                  <p>
                    The optional Action Hub has two parts, both off by default and both run from your machine.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-text-primary">Web research.</span> Research uses your own Apify API key. When you start a research task, only your run parameters (such as search terms or target URLs) and your Apify token are sent to Apify&apos;s servers to run the scraper. Your memory database, files, and profile are never sent. Your Apify token is encrypted and stored locally on your device. Apify processes your request under its own terms of service and privacy policy. You are responsible for what you choose to research and for complying with the terms of any site you target.
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-text-primary">Job applications.</span> If you use the job-application assistant, the profile details you enter (such as your name, contact details, CV information, answers, and an optional AI-tailored note) are submitted directly from your machine to the third-party job or company website you choose. InnerZero does not receive, store, or proxy this information. Each submission requires your explicit approval, and you can keep the assistant to draft-only and review everything first. The destination website processes your details under its own privacy policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    8. What Data the Website Collects
                  </h3>
                  <p>
                    When you create an account on innerzero.com, we collect your email address. Payment information for InnerZero Pro, cloud plans, and Business Licences is processed by Stripe, and payment information for one-off donations is processed by Ko-fi and PayPal; we never receive or store your payment card details.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Newsletter subscriptions (optional)
                  </h3>
                  <p>
                    If you choose to subscribe to our email list, we store your email address, the date you subscribed, and which page you subscribed from. We use this only to send you occasional product updates. Your email is stored in our Supabase database and never shared with third parties. You can unsubscribe from any email we send, or request deletion by contacting{" "}
                    <a href="mailto:help@innerzero.com" className="text-accent-gold hover:text-accent-gold-hover transition-colors">
                      help@innerzero.com
                    </a>.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    9. Cookies
                  </h3>
                  <p>
                    InnerZero is built privacy-first, and that principle extends to this website. We collect the bare minimum needed for the site to function. No advertising. No marketing. No third-party tracking. No fingerprinting.
                  </p>
                  <p className="mt-2">
                    The InnerZero website sets only essential cookies for core functionality. They are listed below.
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm border border-border-default">
                      <thead>
                        <tr className="border-b border-border-default bg-bg-card">
                          <th className="px-3 py-2 text-left font-semibold text-text-primary">Cookie group</th>
                          <th className="px-3 py-2 text-left font-semibold text-text-primary">Set by</th>
                          <th className="px-3 py-2 text-left font-semibold text-text-primary">Purpose</th>
                          <th className="px-3 py-2 text-left font-semibold text-text-primary">Type</th>
                          <th className="px-3 py-2 text-left font-semibold text-text-primary">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border-default">
                          <td className="px-3 py-2 align-top">Authentication session</td>
                          <td className="px-3 py-2 align-top">Supabase</td>
                          <td className="px-3 py-2 align-top">Keeps you signed in to your account when you log in</td>
                          <td className="px-3 py-2 align-top">First-party, essential</td>
                          <td className="px-3 py-2 align-top">Session</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 align-top">Bot protection challenge</td>
                          <td className="px-3 py-2 align-top">Cloudflare Turnstile</td>
                          <td className="px-3 py-2 align-top">Verifies submissions on login, registration, forgot password, and newsletter signup forms</td>
                          <td className="px-3 py-2 align-top">Third-party, essential</td>
                          <td className="px-3 py-2 align-top">Up to 30 minutes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3">
                    We also use Vercel Analytics for aggregate site traffic insights. It is cookieless by design and uses anonymised page-view signals only. No persistent identifier is set on your device.
                  </p>
                  <p className="mt-2">
                    Your theme preference (dark or light mode) is stored in your browser&apos;s localStorage, not in a cookie. It never leaves your device.
                  </p>
                  <p className="mt-3">We do not use:</p>
                  <ul className="mt-1 list-disc pl-6 space-y-1">
                    <li>Advertising or marketing cookies</li>
                    <li>Third-party tracking pixels (no Google Analytics, no Facebook Pixel, no equivalent)</li>
                    <li>Cross-site behavioural profiling</li>
                    <li>Fingerprinting</li>
                  </ul>
                  <p className="mt-3">
                    You can clear or block cookies through your browser&apos;s settings. Doing so will prevent login and form submissions from working, since both rely on essential cookies.
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
                    <li>Cloudflare Turnstile: bot-detection challenge on form submissions (United States); processes IP address and ephemeral challenge signals per Cloudflare&apos;s privacy policy. The challenge is essential for form security and is not used to track or profile you across the site.</li>
                    <li>Ko-fi and PayPal: one-off donation payment processing</li>
                    <li>Stripe: InnerZero Pro, cloud AI subscription, Business Licence, and credit pack payment processing</li>
                    <li>Formspree: contact form submissions</li>
                    <li>Resend: delivery of in-app feedback emails (your message and, if you attached one, the redacted activity log) to our support inbox (United States); processes the email content under its data processing terms</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    11. Data Retention and Deletion
                  </h3>
                  <p>
                    All desktop data is stored locally on your machine and can be deleted at any time by you. Feedback messages and any attached redacted log are kept only for as long as we need them to investigate and respond, and are deleted on request via the contact address below. Account data (email address) is retained for as long as your account is active. You can permanently delete your account and all associated data at any time from your{" "}
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
