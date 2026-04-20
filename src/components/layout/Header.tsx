"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/icons/Logo";
import { DiscordIcon } from "@/components/icons/DiscordIcon";
import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MobileNav } from "@/components/layout/MobileNav";
import { HeaderAuth } from "@/components/layout/HeaderAuth";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Header gets solid background when scrolled OR when mobile menu is open
  const solidBg = scrolled || mobileMenuOpen;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 h-16 transition-colors duration-200",
        mobileMenuOpen
          ? "bg-bg-primary border-b border-border-default"
          : solidBg
            ? "bg-bg-primary/80 border-b border-border-default"
            : "bg-transparent",
        // backdrop-blur creates a containing block that traps fixed-position
        // children (the mobile nav overlay) inside the 64px header. Only apply
        // blur when scrolled and menu is closed.
        scrolled && !mobileMenuOpen && "backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* External community links. Sized + spaced to match the
              ThemeToggle button (h-9 w-9 rounded-lg, gap-2 between
              cluster items) so the cluster reads as one consistent
              control group. */}
          <a
            href="https://discord.gg/rn9SPXgThT"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join InnerZero Discord community"
            title="Join Discord"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:text-[#5865F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold cursor-pointer"
          >
            <DiscordIcon className="w-5 h-5 shrink-0" />
          </a>
          <a
            href="https://github.com/zotex12/innerzero-releases"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View InnerZero on GitHub"
            title="View on GitHub"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold cursor-pointer"
          >
            <GitHubIcon />
          </a>
          <ThemeToggle />
          <HeaderAuth />
          <MobileNav open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        </div>
      </div>
    </header>
  );
}
