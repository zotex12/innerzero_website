import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "InnerZero Terms of Service — free desktop software, optional paid services, liability, and governing law.",
  openGraph: {
    title: "Terms of Service | InnerZero",
    description: "InnerZero Terms of Service.",
    url: "https://innerzero.com/terms",
  },
});

export default function TermsPage() {
  return (
    <div className="pt-28 pb-12 md:pt-36 md:pb-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-text-muted">Last updated: April 2026</p>

          <div className="mt-10 space-y-8 text-text-secondary leading-relaxed text-sm">
            <p className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning text-sm">
              Note: These are placeholder terms. Real legal text reviewed by a solicitor will replace this before launch.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                1. What InnerZero Is
              </h2>
              <p>
                InnerZero is free desktop software that provides a local AI assistant. The software runs on your personal computer and processes all AI tasks locally on your hardware. No subscription, account, or payment is required to use the core software.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                2. Optional Paid Services
              </h2>
              <p>
                InnerZero offers optional paid services that are separate from the free desktop software:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><strong>Cloud AI plans:</strong> Optional monthly subscriptions for access to premium cloud AI models through InnerZero. These plans have credit-based allowances and are billed monthly via Stripe.</li>
                <li><strong>Supporter membership:</strong> A voluntary monthly donation (£4.99/month) to support InnerZero development. Includes perks such as a supporter badge, extra themes, early access, and a Discord role.</li>
                <li><strong>Founder purchase:</strong> A one-time £79 purchase, limited to the first 100 buyers. Includes permanent supporter perks and access to the future hosted version.</li>
              </ul>
              <p className="mt-2">
                All paid services auto-renew (where applicable) unless cancelled before the next billing date. You can cancel at any time from your account dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                3. Refund Policy
              </h2>
              <p>
                We offer a 30-day money-back guarantee on first payments for cloud plans and supporter memberships. After 30 days, no refunds are issued, but you may cancel at any time to prevent future charges. Refunds are processed via Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                4. Licence Scope
              </h2>
              <p>
                InnerZero is free to use on any number of personal devices. The software is licensed, not sold. You may not redistribute, reverse-engineer, or modify the software.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                5. Intellectual Property
              </h2>
              <p>
                InnerZero and all related trademarks, logos, and code are the property of Summers Solutions. Content you create using InnerZero belongs to you.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                6. Limitation of Liability
              </h2>
              <p>
                InnerZero is provided &quot;as is&quot; without warranty. We make no guarantees about the accuracy of AI-generated output. InnerZero is not a substitute for professional advice. We are not liable for any damages arising from the use of the software.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                7. Termination
              </h2>
              <p>
                We reserve the right to revoke access to paid services in cases of abuse or violation of these terms. The free desktop software will continue to function regardless. You may terminate your account at any time from your account dashboard or by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                8. Governing Law
              </h2>
              <p>
                These terms are governed by the laws of England and Wales. Any disputes will be resolved in the courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                9. Contact
              </h2>
              <p>
                For questions about these terms, contact us at{" "}
                <a
                  href="mailto:help@innerzero.com"
                  className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                >
                  help@innerzero.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
