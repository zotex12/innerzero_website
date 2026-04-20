import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

// Server-rendered FAQ for the homepage. Native <details>/<summary>
// disclosure: zero JS, keyboard-accessible by default. The 5-item
// array is exported so the homepage page.tsx can build matching
// FAQPage JSON-LD from the same source — keeps the schema text in
// lockstep with the displayed copy with no risk of drift.

export interface HomeFAQItem {
  question: string;
  answer: string;
}

export const HOME_FAQ: HomeFAQItem[] = [
  {
    question: "Is InnerZero really free?",
    answer:
      "Yes. The desktop app is completely free. No trial, no subscription, no account required. It runs on your own hardware using open source AI models.",
  },
  {
    question: "Does my data leave my machine?",
    answer:
      "No. All AI processing, memory, and conversations stay on your PC by default. If you choose to enable cloud mode, only the prompts you send are forwarded to the AI provider and returned. InnerZero never stores or reads them.",
  },
  {
    question: "What platforms does it run on?",
    answer:
      "Windows, macOS, and Linux. Download the installer for your platform from the download page.",
  },
  {
    question: "Do I need a powerful PC?",
    answer:
      "No. InnerZero detects your hardware on first launch and picks the right AI model for your system. It runs on modest laptops with 16 GB of RAM, and scales up to high-end workstations with 64 GB and a GPU.",
  },
  {
    question: "Can I use Claude, GPT, or Gemini with InnerZero?",
    answer:
      "Yes. Add your own API keys for Anthropic, OpenAI, Google, DeepSeek, and more. Your keys stay on your machine. Zero markup. Or subscribe to a managed cloud plan from £9.99 per month.",
  },
];

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function HomeFAQ() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 md:py-28">
      <Container>
        <SectionHeader
          title="Questions, answered"
          subtitle="Everything you need to know before you download."
        />
        <div className="mx-auto max-w-3xl space-y-3">
          {HOME_FAQ.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-border-default bg-bg-card px-6 py-4 transition-colors hover:border-border-hover [[open]]:border-accent-gold/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-base font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
