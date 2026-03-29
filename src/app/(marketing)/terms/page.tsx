import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "InnerZero Terms of Service — subscription terms, licence scope, liability, and governing law.",
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
          <p className="mt-2 text-sm text-text-muted">Last updated: March 2026</p>

          <div className="mt-10 space-y-8 text-text-secondary leading-relaxed text-sm">
            <p className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning text-sm">
              Note: These are placeholder terms. Real legal text reviewed by a solicitor will replace this before launch.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                1. What InnerZero Is
              </h2>
              <p>
                InnerZero is a subscription-licensed desktop software application that provides a local AI assistant. The software runs on your personal computer and processes all AI tasks locally on your hardware.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                2. Subscription Terms
              </h2>
              <p>
                InnerZero requires an active subscription to use. Subscriptions are available on a monthly (£9.99/month) or annual (£79.99/year) basis. All subscriptions auto-renew unless cancelled before the next billing date. A 14-day free trial is available for new users — no card required.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                3. Refund Policy
              </h2>
              <p>
                We offer a 30-day money-back guarantee after your first payment. After 30 days, no refunds are issued, but you may cancel at any time to prevent future charges. Refunds are processed via Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                4. Licence Scope
              </h2>
              <p>
                Your subscription grants you a personal, non-transferable licence to use InnerZero on up to 2 devices. The software is licensed, not sold. You may not redistribute, reverse-engineer, or modify the software.
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
                We reserve the right to revoke access to InnerZero in cases of abuse or violation of these terms. You may terminate your account at any time from your account dashboard or by contacting support.
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
