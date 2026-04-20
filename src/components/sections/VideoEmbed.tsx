"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

// Click-to-play YouTube embed using the facade pattern. The resting
// state is a lightweight <img> thumbnail + play-button overlay; the
// real iframe (and the ~300KB of YouTube player JS) only mounts after
// the user clicks. Loads YouTube on youtube-nocookie.com for the
// privacy-enhanced tracking surface, which matches the site's
// privacy-first positioning.
//
// Kept in components/sections so the shared Container + ScrollReveal
// rhythm matches the rest of the marketing surfaces (HeroScreenshots
// uses the same dark 19:10 frame / ScrollReveal primitive / h2
// styling).

export interface VideoEmbedProps {
  videoId: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function VideoEmbed({
  videoId,
  title,
  subtitle,
  className,
}: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const headingId = `video-embed-${videoId}`;
  const posterUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const iframeSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-12 md:py-20", className)}
    >
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-4xl text-center">
            <h2
              id={headingId}
              className="text-3xl font-bold text-text-primary md:text-4xl"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                {subtitle}
              </p>
            )}

            <div className="mt-10 overflow-hidden rounded-xl border border-border-default bg-[#0a0a0f] p-3 md:p-4">
              <div className="relative aspect-video overflow-hidden rounded-md">
                {playing ? (
                  <iframe
                    src={iframeSrc}
                    title={title}
                    frameBorder="0"
                    allow="accelerated-2d-canvas; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label={`Play video: ${title}`}
                    className="group absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
                  >
                    {/* Plain <img> rather than Next/Image: the
                        YouTube thumbnail host is external and
                        unoptimised; using next/image would force a
                        remotePatterns entry in next.config.ts. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posterUrl}
                      alt={`${title} video thumbnail`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all duration-200 ease-out motion-safe:group-hover:scale-105 motion-safe:group-hover:bg-accent-gold motion-safe:group-hover:text-black"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        className="h-6 w-6 translate-x-0.5"
                      >
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
