"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange: setOpen }: MobileNavProps) {

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

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Full-screen opaque overlay — no page content visible behind menu */}
      <nav
        className={`mobile-nav-enter fixed inset-0 z-50 bg-bg-primary overflow-y-auto ${open ? "open" : ""}`}
        aria-label="Mobile navigation"
      >
        {/* Header row matching the main header height */}
        <div className="flex items-center justify-end h-16 px-4 sm:px-6">
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer"
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
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-text-secondary transition-colors hover:text-text-primary hover:bg-bg-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button href="/download" className="w-full" onClick={() => setOpen(false)}>
              Download Free
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
