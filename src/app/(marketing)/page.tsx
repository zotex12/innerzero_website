import { Hero } from "@/components/sections/Hero";
import { FeatureCards } from "@/components/sections/FeatureCards";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PrivacyStatement } from "@/components/sections/PrivacyStatement";
import { CTABanner } from "@/components/sections/CTABanner";

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <PrivacyStatement />
      <CTABanner />

      {/* JSON-LD: Organization + SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "InnerZero",
              url: "https://innerzero.com",
              description:
                "InnerZero is a private AI assistant that runs entirely on your PC.",
              brand: {
                "@type": "Brand",
                name: "InnerZero",
              },
              parentOrganization: {
                "@type": "Organization",
                name: "Summers Solutions",
                url: "https://summerssolutions.co.uk",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "InnerZero",
              applicationCategory: "DesktopEnhancement",
              operatingSystem: "Windows",
              description:
                "A private AI assistant that runs entirely on your PC. No cloud. No tracking.",
              offers: {
                "@type": "AggregateOffer",
                lowPrice: "6.67",
                highPrice: "9.99",
                priceCurrency: "GBP",
                offerCount: 2,
              },
            },
          ]),
        }}
      />
    </>
  );
}
