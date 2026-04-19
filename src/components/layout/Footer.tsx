import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/icons/Logo";
import { Container } from "@/components/ui/Container";
import { FOOTER_COLUMNS } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-default bg-bg-secondary py-12 md:py-16">
      <Container>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo className="mb-4 inline-flex" imageSize={24} />
            <p className="text-sm text-text-secondary leading-relaxed">
              Your AI. Your machine. Your data.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Machine-readable feed links: RSS, JSON Feed, and llms.txt */}
        <div className="mt-8 text-xs text-text-muted">
          <a
            href="/feed.xml"
            className="transition-colors hover:text-text-secondary"
          >
            RSS
          </a>
          <span className="mx-2">&middot;</span>
          <a
            href="/api/feed"
            className="transition-colors hover:text-text-secondary"
          >
            JSON
          </a>
          <span className="mx-2">&middot;</span>
          <a
            href="/llms.txt"
            className="transition-colors hover:text-text-secondary"
          >
            llms.txt
          </a>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border-default pt-8 text-center text-sm text-text-muted md:flex-row md:justify-between">
          <p>&copy; {year} InnerZero. All rights reserved.</p>
          <div className="flex flex-col items-center gap-1 md:items-end">
            <p>
              Built by{" "}
              <a
                href="https://summerssolutions.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary transition-colors hover:text-text-primary"
              >
                Summers Solutions
              </a>
            </p>
            {process.env.NEXT_PUBLIC_ICO_REGISTRATION_NUMBER && (
              <p className="text-xs">
                ICO Registration: {process.env.NEXT_PUBLIC_ICO_REGISTRATION_NUMBER}
              </p>
            )}
          </div>
          <a
            href="http://validator.w3.org/feed/check.cgi?url=https%3A//innerzero.com/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            title="Validate InnerZero RSS feed"
            aria-label="Validate InnerZero RSS feed with W3C"
            className="inline-flex items-center gap-2 text-xs text-text-muted transition-colors hover:text-text-secondary md:ml-4"
          >
            <Image
              src="/images/valid-rss.png"
              alt="Valid RSS feed"
              width={88}
              height={31}
              className="h-6 w-auto opacity-70 transition-opacity hover:opacity-100"
            />
          </a>
        </div>
      </Container>
    </footer>
  );
}
