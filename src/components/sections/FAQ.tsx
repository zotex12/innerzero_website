"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FAQ_DATA, type FAQItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FAQProps {
  className?: string;
}

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border-default">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="pr-4 text-sm font-medium text-text-primary md:text-base">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div className={cn("faq-content", open && "open")}>
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-text-secondary">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ({ className }: FAQProps) {
  return (
    <section className={cn("py-12 md:py-20", className)}>
      <Container>
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about InnerZero."
        />
        <ScrollReveal>
          <div className="mx-auto max-w-2xl">
            {FAQ_DATA.map((item) => (
              <FAQAccordionItem key={item.question} item={item} />
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
