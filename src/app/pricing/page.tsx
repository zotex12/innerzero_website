import type { Metadata } from "next";
import { PricingCard } from "@/components/sections/PricingCard";
import { FAQ } from "@/components/sections/FAQ";
import { createMetadata } from "@/lib/metadata";
import { FAQ_DATA } from "@/lib/constants";

export const metadata: Metadata = createMetadata({
  title: "Pricing",
  description:
    "InnerZero pricing: £9.99/month or £79.99/year. Everything included, no tiers, no limits. 14-day free trial, no card required.",
  openGraph: {
    title: "Pricing | InnerZero — Private AI Assistant",
    description:
      "InnerZero pricing: £9.99/month or £79.99/year. 14-day free trial.",
    url: "https://innerzero.com/pricing",
  },
});

export default function PricingPage() {
  return (
    <>
      <section className="pt-28 md:pt-36">
        <div className="mx-auto max-w-3xl text-center px-4">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            One plan. Everything included. No surprises.
          </p>
        </div>
      </section>

      <PricingCard />
      <FAQ />

      {/* JSON-LD: Product + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: "InnerZero",
              description:
                "A private AI assistant that runs entirely on your PC.",
              brand: { "@type": "Brand", name: "InnerZero" },
              offers: [
                {
                  "@type": "Offer",
                  price: "9.99",
                  priceCurrency: "GBP",
                  priceValidUntil: "2027-12-31",
                  availability: "https://schema.org/PreOrder",
                  name: "Monthly",
                },
                {
                  "@type": "Offer",
                  price: "79.99",
                  priceCurrency: "GBP",
                  priceValidUntil: "2027-12-31",
                  availability: "https://schema.org/PreOrder",
                  name: "Annual",
                },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ_DATA.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            },
          ]),
        }}
      />
    </>
  );
}
