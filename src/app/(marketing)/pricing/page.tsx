import type { Metadata } from "next";
import { PricingSection } from "@/components/sections/PricingSection";
import { createMetadata } from "@/lib/metadata";
import { FAQ_DATA, CLOUD_FAQ } from "@/lib/constants";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/pricing" },
  title: "Pricing | InnerZero: Free AI, Business Licence, Optional Cloud",
  description:
    "InnerZero is free for personal use. Business licence £50/year. Optional cloud AI coming soon. Add your own API keys for free.",
  openGraph: {
    title: "Pricing | InnerZero: Free AI, Business Licence, Optional Cloud",
    description:
      "InnerZero is free for personal use. Business licence £50/year. Optional cloud AI coming soon.",
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

      {/* JSON-LD: SoftwareApplication + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "InnerZero",
              applicationCategory: "DesktopEnhancement",
              operatingSystem: "Windows",
              description:
                "A free private AI assistant that runs entirely on your PC. No subscription required.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "GBP",
                availability: "https://schema.org/InStock",
              },
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
