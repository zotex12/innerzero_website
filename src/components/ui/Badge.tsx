import { cn } from "@/lib/utils";

type BadgeVariant = "gold" | "teal" | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  gold: "bg-accent-gold-muted text-accent-gold",
  teal: "bg-accent-teal-muted text-accent-teal",
  default: "bg-bg-card text-text-secondary border border-border-default",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
