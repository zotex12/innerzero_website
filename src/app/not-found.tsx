import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { NOT_FOUND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

// Secondary recovery links: a bare single-CTA 404 is a dead end on a
// content-heavy site, so offer the most likely destinations.
const RECOVERY_LINKS = [
  { label: "Download", href: "/download" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center pt-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-6xl font-bold text-accent-gold">404</p>
          <h1 className="mt-4 text-2xl font-bold text-text-primary md:text-3xl">
            {NOT_FOUND.headline}
          </h1>
          <p className="mt-4 text-text-secondary">{NOT_FOUND.description}</p>
          <div className="mt-8">
            <Button href="/">{NOT_FOUND.cta}</Button>
          </div>
          <nav
            aria-label="Popular pages"
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
          >
            {RECOVERY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded text-text-secondary transition-colors hover:text-accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </div>
  );
}
