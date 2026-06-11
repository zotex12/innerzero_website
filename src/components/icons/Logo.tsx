import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  imageSize?: number;
}

export function Logo({ className, imageSize = 32 }: LogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 text-xl font-bold tracking-tight", className)}>
      <Image
        src="/images/logo.png"
        alt="InnerZero logo"
        width={imageSize}
        height={imageSize}
        className="shrink-0"
      />
      <span>
        <span className="text-text-primary">Inner</span>
        {/* Use the solid brand accent so the "Zero" wordmark matches the
            bright yellow used on buttons in light mode (and the gold in
            dark mode). Not --accent-gold, which deepens in light mode for
            body-text contrast. Logo text is exempt from the WCAG contrast
            rule. */}
        <span className="text-accent-gold-solid">Zero</span>
      </span>
    </Link>
  );
}
