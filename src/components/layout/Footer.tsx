import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/icons/Logo";
import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { DiscordIcon } from "@/components/icons/DiscordIcon";
import { XIcon } from "@/components/icons/XIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import { KoFiIcon } from "@/components/icons/KoFiIcon";
import { Container } from "@/components/ui/Container";
import { FOOTER_COLUMNS } from "@/lib/constants";

// Community links live in the Footer rather than constants.ts so the
// per-link icon component (a React reference, not data) can stay
// alongside the JSX that consumes it. Each entry pairs the inline
// SVG icon with its own brand hover colour; constants.ts holds an
// empty Community placeholder so column ordering stays declarative.
type CommunityLink = {
  label: string;
  href: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  hoverClass: string;
};

const COMMUNITY_LINKS: CommunityLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/zotex12/innerzero-releases",
    ariaLabel: "View InnerZero on GitHub",
    icon: GitHubIcon,
    hoverClass: "hover:text-text-primary",
  },
  {
    label: "Discord",
    href: "https://discord.gg/rn9SPXgThT",
    ariaLabel: "Join InnerZero Discord community",
    icon: DiscordIcon,
    hoverClass: "hover:text-[#5865F2]",
  },
  {
    label: "X",
    href: "https://x.com/InnerZero_ai",
    ariaLabel: "Follow InnerZero on X",
    icon: XIcon,
    hoverClass: "hover:text-text-primary",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/innerzero_ai",
    ariaLabel: "Follow InnerZero on Instagram",
    icon: InstagramIcon,
    hoverClass: "hover:text-[#E4405F]",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/innerzero",
    ariaLabel: "Follow InnerZero on LinkedIn",
    icon: LinkedInIcon,
    hoverClass: "hover:text-[#0A66C2]",
  },
  {
    label: "Ko-fi",
    href: "https://ko-fi.com/innerzero",
    ariaLabel: "Support InnerZero on Ko-fi",
    icon: KoFiIcon,
    hoverClass: "hover:text-[#FF5E5B]",
  },
];

function CommunityColumn() {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Community
      </h3>
      <ul className="flex flex-col gap-2">
        {COMMUNITY_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
                className={`-mx-1 inline-flex items-center gap-2 rounded-md px-1 py-0.5 text-sm text-text-secondary transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary ${link.hoverClass}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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

          {/* Link columns. Community is rendered via the bespoke
              CommunityColumn so its icon-row entries with brand
              hover colours don't have to round-trip through the
              constants schema. */}
          {FOOTER_COLUMNS.map((col) =>
            col.title === "Community" ? (
              <CommunityColumn key={col.title} />
            ) : (
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
            ),
          )}
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
