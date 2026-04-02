import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { Container } from "@/components/ui/Container";
import { FOOTER_COLUMNS } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-default bg-bg-secondary py-12 md:py-16">
      <Container>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
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

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-border-default pt-8 text-center text-sm text-text-muted md:flex-row md:justify-between">
          <p>&copy; {year} InnerZero. All rights reserved.</p>
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
        </div>
      </Container>
    </footer>
  );
}
