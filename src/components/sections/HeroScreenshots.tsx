"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Three product screenshots that ride directly under the hero. The
// image area opens a full-screen lightbox on click; a small "Download
// free" link sits in the bottom-right corner of each card as a
// separate, focus-isolated CTA so the two affordances don't fight.
//
// Source images are ~2558x1350 / 2555x1339 / 2555x1349 (all within 1%
// of 19:10), so each card uses an aspect-[19/10] wrapper with
// object-contain — the full UI shows without cropping or squashing.
//
// Frame is hard-coded dark (#0a0a0f) regardless of theme so the
// transition into the screenshot's own dark UI is seamless in both
// light and dark modes.

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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const prevOpenIndex = useRef<number | null>(null);

  // Focus management: on open, move focus to the close button. On
  // close (i.e. when openIndex transitions from a number back to
  // null), return focus to the card button that originally opened
  // the lightbox so keyboard users don't lose their place in the
  // grid.
  useEffect(() => {
    if (openIndex !== null) {
      closeButtonRef.current?.focus();
    } else if (prevOpenIndex.current !== null) {
      triggerRefs.current[prevOpenIndex.current]?.focus();
    }
    prevOpenIndex.current = openIndex;
  }, [openIndex]);

  // Escape-to-close. Listener only attaches while the lightbox is
  // open; cleanup removes it when openIndex flips to null or the
  // component unmounts.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex]);

  // Body scroll lock while the lightbox is open. Restore the prior
  // overflow value (rather than empty string) so we play nice with
  // any other component that might also want to lock scrolling.
  useEffect(() => {
    if (openIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openIndex]);

  const openItem = openIndex !== null ? SCREENSHOTS[openIndex] : null;

  return (
    <>
      <section className="mt-0 mb-20 md:mt-2 md:mb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {SCREENSHOTS.map((item, i) => (
              <ScrollReveal key={item.src} delay={i * 100}>
                <article className="group relative block overflow-hidden rounded-xl border border-border-default bg-bg-card transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent-gold hover:shadow-[0_12px_32px_-8px_rgba(212,168,67,0.2)]">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    aria-label={`Enlarge ${item.label} screenshot`}
                    ref={(el) => {
                      triggerRefs.current[i] = el;
                    }}
                    className="block w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
                  >
                    {/* Dark frame — matches the screenshot UI in both
                        themes so the boundary feels intentional in
                        light mode rather than abrupt. */}
                    <div className="relative overflow-hidden rounded-t-xl bg-[#0a0a0f] p-3 md:p-4">
                      <div className="relative aspect-19/10 overflow-hidden rounded-md">
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          priority={i === 0}
                          className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                        />
                      </div>
                    </div>
                    <div className="border-t border-border-default p-5 md:p-6">
                      <h3 className="mb-1 text-base font-semibold text-text-primary">
                        {item.label}
                      </h3>
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {item.sublabel}
                      </p>
                    </div>
                  </button>

                  {/* Sibling Link — sits absolutely in the bottom-right
                      so clicking it never bubbles into the lightbox
                      trigger above. Hover affordance from the parent
                      group still applies via group-hover. */}
                  <Link
                    href="/download"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-4 right-5 z-10 inline-flex translate-y-1 items-center gap-1 rounded text-xs font-medium text-accent-gold opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
                  >
                    Download free &rarr;
                  </Link>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {openItem && openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged screenshot"
          onClick={() => setOpenIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-8"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex(null);
            }}
            aria-label="Close enlarged screenshot"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-default bg-bg-card/80 text-text-primary transition-colors hover:bg-bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] max-w-[95vw] flex-col items-center gap-4"
          >
            <Image
              src={openItem.src}
              alt={openItem.alt}
              width={2558}
              height={1350}
              priority
              sizes="95vw"
              className="h-auto max-h-[80vh] w-auto max-w-[95vw] rounded-lg object-contain"
            />
            <div className="mx-auto max-w-2xl text-center text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">
                {openItem.label}.
              </span>{" "}
              {openItem.sublabel}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
