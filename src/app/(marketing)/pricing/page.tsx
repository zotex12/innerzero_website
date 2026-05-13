import type { Metadata } from "next";
import { PricingSection } from "@/components/sections/PricingSection";
import { createMetadata } from "@/lib/metadata";
import { FAQ_DATA, CLOUD_FAQ } from "@/lib/constants";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/pricing" },
  // Absolute title bypasses the "%s | InnerZero..." template in
  // src/lib/metadata.ts. Without absolute, the brand appears twice in
  // the rendered <title> because this page's title already contains
  // "InnerZero". Same pattern as the home page and /about.
  title: {
    absolute: "Pricing | InnerZero: Free AI, Business Licence, Optional Cloud",
  },
  description:
    "InnerZero is free for personal use. Business Licence from £19.99/seat/month or £129.99/seat/year. Optional cloud AI plans from £9.99/month. Add your own API keys for free.",
  openGraph: {
    title: "Pricing | InnerZero: Free AI, Business Licence, Optional Cloud",
    description:
      "InnerZero is free for personal use. Business Licence from £19.99/seat/month or £129.99/seat/year. Optional cloud AI plans from £9.99/month.",
    url: "https://innerzero.com/pricing",
  },
});

export default function PricingPage() {
  return (
    <>
      <section className="pt-28 md:pt-36">
        <div className="text-center px-4">
          <h1 className="mx-auto max-w-4xl text-balance text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Free to download.
            <span className="block text-balance">Optional extras when you want them.</span>
          </h1>
          <p className="mx-auto max-w-2xl mt-4 text-lg text-text-secondary">
            InnerZero is a complete AI assistant that runs on your PC, no subscription required.
          </p>
        </div>
      </section>

      <PricingSection />

      {/* JSON-LD: SoftwareApplication + FAQPage. Offers expanded to an array:
          the free desktop app (£0), Business Licence annual (AggregateOffer
          with the £129.99-£149.99 volume range, offerCount=2 for the two
          Stripe tiers), and Business Licence monthly (£19.99 flat per seat).
          25+ seats is enterprise contact and intentionally not in the schema. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "InnerZero",
              applicationCategory: "DesktopEnhancement",
              operatingSystem: "Windows, macOS, Linux",
              description:
                "A free private AI assistant that runs entirely on your PC. No subscription required. Optional Business Licence for commercial use.",
              offers: [
                {
                  "@type": "Offer",
                  name: "InnerZero (personal use)",
                  price: "0",
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                },
                {
                  "@type": "AggregateOffer",
                  name: "Business Licence (annual)",
                  description:
                    "Per-seat annual Business Licence, volume-tiered for 5+ seats.",
                  lowPrice: "129.99",
                  highPrice: "149.99",
                  priceCurrency: "GBP",
                  offerCount: 2,
                  availability: "https://schema.org/InStock",
                  eligibleQuantity: {
                    "@type": "QuantitativeValue",
                    minValue: 1,
                    maxValue: 24,
                    unitText: "seats",
                  },
                },
                {
                  "@type": "Offer",
                  name: "Business Licence (monthly)",
                  description: "Per-seat monthly Business Licence.",
                  price: "19.99",
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                  eligibleQuantity: {
                    "@type": "QuantitativeValue",
                    minValue: 1,
                    maxValue: 24,
                    unitText: "seats",
                  },
                },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [...FAQ_DATA, ...CLOUD_FAQ].map((item) => ({
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
