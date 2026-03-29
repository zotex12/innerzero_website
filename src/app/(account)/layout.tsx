import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Logo } from "@/components/icons/Logo";
import {
  LayoutDashboard,
  CreditCard,
  Monitor,
  Settings,
} from "lucide-react";

const SIDEBAR_LINKS = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/billing", label: "Billing", icon: CreditCard, disabled: true },
  { href: "/account/devices", label: "Devices", icon: Monitor, disabled: true },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border-default bg-bg-secondary p-4">
          <div className="mb-6">
            <Logo />
          </div>
          <nav className="flex flex-col gap-1" aria-label="Account navigation">
            {SIDEBAR_LINKS.map((link) => {
              const Icon = link.icon;
              if (link.disabled) {
                return (
                  <span
                    key={link.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted cursor-not-allowed"
                    title="Coming soon"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    <span className="ml-auto text-xs text-text-muted">Soon</span>
                  </span>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile sidebar nav */}
        <div className="md:hidden flex gap-2 overflow-x-auto border-b border-border-default bg-bg-secondary px-4 py-2 fixed top-16 left-0 right-0 z-20">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon;
            if (link.disabled) {
              return (
                <span
                  key={link.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-text-muted whitespace-nowrap cursor-not-allowed"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </span>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-text-secondary whitespace-nowrap transition-colors hover:bg-bg-card hover:text-text-primary"
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Main content */}
        <main id="main-content" className="flex-1 p-6 md:p-8 mt-10 md:mt-0">
          <div className="mx-auto max-w-3xl">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
