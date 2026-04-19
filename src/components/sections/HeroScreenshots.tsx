import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Three product screenshots that ride directly under the hero. Each
// card is the CTA: clicking anywhere on it routes to /download. Card
// chrome is intentionally minimal (no fake browser title bars or
// window dots) so the screenshot itself carries the visual weight.
//
// Source files are ~2558x1350 (slightly wider than 16:9). All three
// use the same width/height props so Next.js reserves a consistent
// aspect ratio per card and the grid stays tidy without CLS.

const SCREENSHOTS = [
  {
    src: "/images/appchatpageimage.png",
    alt:
      "InnerZero chat interface showing a private AI conversation with Zero assistant running locally on a desktop PC",
    label: "Private Chat",
    sublabel: "Talk to Zero. Everything stays local.",
  },
  {
    src: "/images/appvoicepageimage.png",
    alt:
      "InnerZero voice mode with animated AI orb for speech interaction, all processing local with no audio uploaded",
    label: "Voice Mode",
    sublabel: "Full voice with local speech recognition.",
  },
  {
    src: "/images/appprivacypage.png",
    alt:
      "InnerZero My Privacy dashboard showing Offline, Private, and Cloud mode selector with connection log and privacy snapshot",
    label: "Your Privacy, Visible",
    sublabel: "See everything that leaves your machine.",
  },
] as const;

export function HeroScreenshots() {
  return (
    <section className="mt-10 mb-20 md:mt-14 md:mb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {SCREENSHOTS.map((item, i) => (
            <ScrollReveal key={item.src} delay={i * 100}>
              <Link
                href="/download"
                aria-label={`Download InnerZero - ${item.label} screenshot`}
                className="group relative block overflow-hidden rounded-xl border border-border-default bg-bg-card transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent-gold hover:shadow-[0_12px_32px_-8px_rgba(212,168,67,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              >
                <article>
                  <div className="relative overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={2558}
                      height={1350}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={i === 0}
                      className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="border-t border-border-default p-5 md:p-6">
                    <h3 className="mb-1 text-base font-semibold text-text-primary">
                      {item.label}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {item.sublabel}
                    </p>
                    <span className="mt-3 inline-flex translate-y-1 items-center gap-1 text-xs font-medium text-accent-gold opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      Download free &rarr;
                    </span>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
