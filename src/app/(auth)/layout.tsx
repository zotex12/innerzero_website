import Link from "next/link";
import { Logo } from "@/components/icons/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo className="text-2xl" />
      </div>
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
