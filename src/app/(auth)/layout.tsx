import Link from "next/link";
import Image from "next/image";

// Phase CSP-split. Auth pages handle credentials and keep the strong
// per-request nonce CSP from src/middleware.ts. Nonces inject only during
// dynamic rendering, so this group must render dynamically. Without this pin
// these pages would prerender as static (this layout reads no dynamic APIs),
// the nonce would be absent, and 'strict-dynamic' would block Turnstile and
// the login scripts.
export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex flex-col items-center gap-3">
        <Image
          src="/images/logo.png"
          alt="InnerZero logo"
          width={48}
          height={48}
        />
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-text-primary">Inner</span>
          {/* Solid brand accent to match the brand yellow (see Logo.tsx). */}
          <span className="text-accent-gold-solid">Zero</span>
        </span>
      </Link>
      <main id="main-content" className="w-full max-w-sm">{children}</main>
      <nav
        aria-label="Legal and home"
        className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-text-muted"
      >
        <Link
          href="/"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          &larr; Back to home
        </Link>
        <Link
          href="/privacy"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          Terms
        </Link>
      </nav>
    </div>
  );
}
