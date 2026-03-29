import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-bg-card p-6 md:p-8",
        hover &&
          "transition-all duration-150 hover:scale-[1.02] hover:border-accent-gold hover:shadow-[0_0_20px_rgba(212,168,67,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}
