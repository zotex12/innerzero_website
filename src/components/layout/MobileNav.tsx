"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { DiscordIcon } from "@/components/icons/DiscordIcon";
import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NAV_LINKS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange: setOpen }: MobileNavProps) {
  const drawerId = useId();
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Move focus into the drawer when it opens; return focus to trigger when it closes.
  useEffect(() => {
    if (!open) return;
    const first = drawerRef.current?.querySelector<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
  }, [open]);

  // Escape closes the drawer; Tab cycles focus inside it.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusables = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  function close() {
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls={drawerId}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Full-screen opaque drawer. mobile-nav-enter handles the slide/fade. */}
      <nav
        ref={drawerRef}
        id={drawerId}
        className={`mobile-nav-enter fixed inset-0 z-50 bg-bg-primary overflow-y-auto ${open ? "open" : ""}`}
        aria-label="Mobile navigation"
        aria-modal="true"
        role="dialog"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-end h-16 px-4 sm:px-6">
          <button
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-8">
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-text-secondary transition-colors hover:text-text-primary hover:bg-bg-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t border-border-default/50" />

          <Link
            href={user ? "/account" : "/login"}
            onClick={close}
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium text-text-secondary transition-colors hover:text-text-primary hover:bg-bg-secondary"
          >
            <User className="h-5 w-5" />
            {user ? "Account" : "Log In"}
          </Link>

          <div className="my-4 border-t border-border-default/50" />

          {/* Socials grouped tight; theme toggle separated by margin-left auto
              so it visually reads as a utility control, not a third social. */}
          <div className="flex items-center px-2">
            <div className="flex items-center gap-2">
              <a
                href="https://discord.gg/rn9SPXgThT"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join InnerZero Discord community"
                title="Join Discord"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:text-[#5865F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
              >
                <DiscordIcon className="w-5 h-5 shrink-0" />
              </a>
              <a
                href="https://github.com/zotex12/innerzero-releases"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View InnerZero on GitHub"
                title="View on GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
              >
                <GitHubIcon />
              </a>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
