import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { FeatureCards } from "@/components/sections/FeatureCards";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PrivacyStatement } from "@/components/sections/PrivacyStatement";
import { CTABanner } from "@/components/sections/CTABanner";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/" },
  title: "InnerZero. Free Private AI Assistant That Runs on Your PC",
  description:
    "InnerZero is a free private AI assistant that runs entirely on your PC. No cloud. No tracking. Just you and your AI.",
  openGraph: {
    title: "InnerZero. Free Private AI Assistant That Runs on Your PC",
    description:
      "InnerZero is a free private AI assistant that runs entirely on your PC. No cloud. No tracking. Just you and your AI.",
    url: "https://innerzero.com",
  },
});

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <PrivacyStatement />
      <CTABanner />

      {/* JSON-LD: Organization + SoftwareApplication + WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://innerzero.com/#organization",
              name: "InnerZero",
              url: "https://innerzero.com",
              description:
                "InnerZero is a free private AI assistant that runs entirely on your PC. No cloud, no tracking, no subscription required.",
              foundingDate: "2025",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Birmingham",
                addressCountry: "GB",
              },
              logo: {
                "@type": "ImageObject",
                url: "https://innerzero.com/images/logo.png",
              },
              sameAs: [
                "https://x.com/InnerZero_ai",
                "https://www.instagram.com/innerzero_ai",
                "https://www.linkedin.com/company/innerzero",
                "https://discord.gg/rn9SPXgThT",
                "https://github.com/zotex12/innerzero-releases",
              ],
              parentOrganization: {
                "@type": "Organization",
                name: "Summers Solutions",
                url: "https://summerssolutions.co.uk",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": "https://innerzero.com/#software",
              name: "InnerZero",
              applicationCategory: "UtilitiesApplication",
              applicationSubCategory: "AI Assistant",
              operatingSystem: "Windows, macOS, Linux",
              softwareVersion: "0.1.2",
              description:
                "A free private AI assistant that runs entirely on your PC. No cloud. No tracking. No subscription.",
              url: "https://innerzero.com",
              downloadUrl: "https://innerzero.com/download",
              featureList: [
                "Runs 100% locally — no cloud required",
                "Persistent memory system",
                "Voice and text interaction",
                "30+ built-in tools",
                "Document upload and Q&A",
                "Offline Wikipedia knowledge packs",
                "Screen automation",
                "Optional cloud AI via BYO API keys",
              ],
              publisher: {
                "@id": "https://innerzero.com/#organization",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "GBP",
                availability: "https://schema.org/InStock",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://innerzero.com/#website",
              name: "InnerZero",
              url: "https://innerzero.com",
              publisher: {
                "@id": "https://innerzero.com/#organization",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://innerzero.com/blog?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
          ]),
        }}
      />
    </>
  );
}
