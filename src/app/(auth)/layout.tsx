import Link from "next/link";
import Image from "next/image";

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
          <span className="text-accent-gold">Zero</span>
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 text-sm text-text-muted">
        <Link
          href="/"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          &larr; Back to home
        </Link>
      </p>
    </div>
  );
}
