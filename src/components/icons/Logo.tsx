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
        <span className="text-accent-gold">Zero</span>
      </span>
    </Link>
  );
}
