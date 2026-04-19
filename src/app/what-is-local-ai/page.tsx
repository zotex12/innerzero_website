import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/JsonLd";
import { createMetadata } from "@/lib/metadata";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";
const PUBLISHED = "2026-04-19";
const MODIFIED = "2026-04-19";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/what-is-local-ai" },
  // Absolute title bypasses the "%s | InnerZero..." template so the page
  // ranks cleanly against the bare "What is local AI" query.
  title: { absolute: "What is Local AI? - InnerZero" },
  description:
    "Local AI is artificial intelligence that runs on your own PC. Models download once, inference is local, and no data leaves your machine.",
  openGraph: {
    title: "What is Local AI? - InnerZero",
    description:
      "Plain-English guide to local AI: how it works, what hardware you need, and how it compares to cloud AI.",
    url: "https://innerzero.com/what-is-local-ai",
    type: "article",
  },
});

// Anchor ids match the question-style h2 headings (lowercase kebab). The
// table of contents links point to these; the AEO answer chunk sits
// directly under each heading so LLMs and rich-result crawlers pick it
// up as the canonical answer for the question.
const TOC: { id: string; label: string }[] = [
  { id: "what-is-local-ai", label: "What is local AI?" },
  { id: "how-does-local-ai-work", label: "How does local AI work?" },
  {
    id: "local-ai-vs-cloud-ai",
    label: "What is the difference between local AI and cloud AI?",
  },
  {
    id: "hardware-for-local-ai",
    label: "What hardware do I need to run local AI?",
  },
  { id: "is-local-ai-free", label: "Is local AI free?" },
  { id: "is-local-ai-private", label: "Is local AI private?" },
  { id: "local-ai-offline", label: "Can local AI work offline?" },
  {
    id: "what-models-can-i-run",
    label: "What AI models can I run locally?",
  },
  { id: "what-can-i-do", label: "What can I do with local AI?" },
  { id: "how-innerzero-fits", label: "How does InnerZero fit?" },
  { id: "faq", label: "Frequently asked questions" },
];

// FAQ section: these Q&A pairs go into the FAQPage JSON-LD. The h2
// questions above are structural navigation, not FAQ-formatted for
// snippet extraction, so they stay out of the schema per the task.
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Do I need a GPU for local AI?",
    answer:
      "No, but it helps. Small models like Qwen 3 4B and Gemma 3 4B run on CPU alone, slowly but usably, on any modern laptop. A dedicated GPU with 8GB of VRAM or more makes mid-range models (8B to 14B) feel responsive. Serious reasoning models (30B and up) need 24GB of VRAM or a pair of consumer cards.",
  },
  {
    question: "How much does it cost to run local AI?",
    answer:
      "The software and models are free. You pay for hardware once (a consumer laptop or desktop you probably already own), plus the electricity each inference uses. Running a 14B model on a desktop GPU for an hour of active use typically costs a few pence in UK electricity. There is no per-token or subscription charge.",
  },
  {
    question: "Is local AI as good as ChatGPT?",
    answer:
      "For daily tasks like writing, summarising, and conversational help, modern open-source models are competitive with GPT-4-class cloud models. For the hardest reasoning and coding problems, frontier cloud models (Claude Opus, GPT-5, Gemini 2.5 Pro) still lead. The honest answer is that local AI is good enough for most work and you reach for cloud only when the task requires it.",
  },
  {
    question: "Can I use my own Claude or GPT API key?",
    answer:
      "Yes. InnerZero supports bring-your-own-key for seven providers including Anthropic, OpenAI, Google, and DeepSeek. Keys are encrypted and stored on your machine. Requests go directly from your device to the provider, with no InnerZero server in the middle and no markup on the provider's own token pricing.",
  },
  {
    question: "What is Ollama?",
    answer:
      "Ollama is an open-source runtime that downloads and serves local language models on your computer. It exposes a simple HTTP API that applications like InnerZero call to generate text, embeddings, and vision outputs. You can think of it as the engine; InnerZero is the interface.",
  },
  {
    question: "What is LM Studio?",
    answer:
      "LM Studio is a desktop application that does the same job as Ollama (downloading and serving local language models) with a built-in chat UI and model browser. InnerZero works with either backend, so you can pick whichever you already have installed.",
  },
  {
    question: "Is local AI safe to use for sensitive documents?",
    answer:
      "Yes. Local AI never sends document contents to a third-party server. Your files stay on your disk, your prompts stay in local memory, and the model weights are static files that cannot phone home. This makes local AI well suited to confidential work such as legal drafts, medical notes, or private journals.",
  },
  {
    question: "Can I run local AI on a Mac or Linux?",
    answer:
      "Ollama and LM Studio both run on macOS, Linux, and Windows. Open-source models run anywhere those runtimes run. InnerZero is currently a Windows desktop app, but the local AI stack underneath is cross-platform.",
  },
];

// Comparison table rows for the local vs cloud vs hybrid section. Kept
// in a separate array so the table can render consistently and so the
// copy is easy to audit against the "honest trade-offs" rule.
const COMPARISON_ROWS: {
  row: string;
  local: string;
  cloud: string;
  hybrid: string;
}[] = [
  {
    row: "Privacy",
    local: "Full. Nothing leaves your device.",
    cloud: "Depends on provider terms. Prompts reach provider servers.",
    hybrid: "Local by default. Cloud only for messages you explicitly send.",
  },
  {
    row: "Cost",
    local: "Free forever. Electricity is the only marginal cost.",
    cloud: "Subscription or pay-per-token. Scales with usage.",
    hybrid: "Free for local tasks. You pay the provider only for cloud calls.",
  },
  {
    row: "Performance",
    local: "Depends on your hardware. A mid-range PC runs an 8B model smoothly.",
    cloud: "Datacenter GPUs. Consistent, fast, no local resources used.",
    hybrid: "Local for daily use, cloud for heavy reasoning when you want it.",
  },
  {
    row: "Capability",
    local: "Strong on most tasks. Open-source models up to gpt-oss 120B.",
    cloud: "Frontier models (Claude, GPT-5, Gemini) still lead on hardest tasks.",
    hybrid: "Broad daily competence locally, frontier reach from cloud when needed.",
  },
];

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 scroll-mt-24 text-2xl font-bold text-text-primary md:text-3xl"
    >
      {children}
    </h2>
  );
}

function Answer({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-lg text-text-secondary md:text-xl">{children}</p>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-base text-text-secondary">{children}</p>;
}

export default function WhatIsLocalAiPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What is Local AI?",
    description:
      "Plain-English guide to local AI: how it works, what hardware you need, and how it compares to cloud AI.",
    author: {
      "@type": "Person",
      name: "Louie",
    },
    publisher: {
      "@type": "Organization",
      name: "InnerZero",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/what-is-local-ai`,
    },
    image: `${SITE_URL}/og-default.png`,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="pt-28 pb-16 md:pt-36 md:pb-24">
      <Container>
        <article className="mx-auto max-w-3xl">
          {/* Hero */}
          <header>
            <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              What is local AI?
            </h1>
            <p className="mt-5 text-lg text-text-secondary md:text-xl">
              Local AI is artificial intelligence that runs entirely on your
              own computer. The model lives on your disk, inference happens on
              your CPU or GPU, and no conversation leaves your machine unless
              you explicitly choose to send it somewhere else.
            </p>
          </header>

          {/* Table of contents */}
          <nav
            aria-label="On this page"
            className="mt-10 rounded-xl border border-border-default bg-bg-card p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              On this page
            </p>
            <ol className="mt-3 space-y-1.5 text-sm text-text-secondary">
              {TOC.map((item, i) => (
                <li key={item.id} className="flex gap-3">
                  <span className="shrink-0 tabular-nums text-text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={`#${item.id}`}
                    className="transition-colors hover:text-accent-gold"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* 1. Definition */}
          <SectionHeading id="what-is-local-ai">
            What is local AI?
          </SectionHeading>
          <Answer>
            Local AI is artificial intelligence that runs on your own hardware
            instead of on a remote server. The language model weights sit on
            your disk, inference executes on your CPU or GPU, and the full
            conversation stays in local memory.
          </Answer>
          <Body>
            Cloud AI (ChatGPT, Claude.ai, Gemini) sends each prompt you type
            to a company&apos;s servers. A language model running in their
            datacenter generates a reply, which travels back over the
            internet. Local AI removes that round trip. The model file lives
            on your machine, and when you ask it a question your CPU or GPU
            does the thinking. &quot;Runs on your hardware&quot; means exactly
            that: no cloud tenant, no API call, no provider log of what you
            asked.
          </Body>

          {/* 2. How it works */}
          <SectionHeading id="how-does-local-ai-work">
            How does local AI work?
          </SectionHeading>
          <Answer>
            You install a local runtime (Ollama or LM Studio), download an
            open-source model file once, and from then on every prompt runs
            inference locally. The model never phones home and no request
            leaves your device.
          </Answer>
          <Body>
            The steps in practice: the runtime downloads the model weights
            (typically a few gigabytes) from a public registry, caches them
            on disk, and exposes a local HTTP endpoint on your own machine.
            Applications like InnerZero call that endpoint the same way a web
            app would call a cloud API, except the call never touches the
            internet. Inference uses your GPU first (fast) and falls back to
            CPU (slower but workable) if the model is larger than your VRAM.
            InnerZero is the front end: it handles the chat window, memory,
            voice, knowledge packs, and tools. The heavy lifting happens in
            Ollama or LM Studio, which we treat as swappable engines.
          </Body>

          {/* 3. Comparison */}
          <SectionHeading id="local-ai-vs-cloud-ai">
            What is the difference between local AI and cloud AI?
          </SectionHeading>
          <Answer>
            Local AI wins on privacy, cost, and offline use. Cloud AI wins on
            raw capability for frontier reasoning tasks. Hybrid means local by
            default with cloud available when a task needs it; it is what
            InnerZero supports via optional API keys and managed cloud.
          </Answer>
          <Body>
            The honest trade-off looks like this:
          </Body>
          <div className="mt-5 overflow-x-auto rounded-xl border border-border-default bg-bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border-default text-left">
                  <th
                    scope="col"
                    className="p-4 text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    &nbsp;
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    Local AI
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    Cloud AI
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    Hybrid
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.row}
                    className={
                      i === COMPARISON_ROWS.length - 1
                        ? ""
                        : "border-b border-border-default"
                    }
                  >
                    <th
                      scope="row"
                      className="p-4 align-top font-semibold text-text-primary"
                    >
                      {row.row}
                    </th>
                    <td className="p-4 align-top text-text-secondary">
                      {row.local}
                    </td>
                    <td className="p-4 align-top text-text-secondary">
                      {row.cloud}
                    </td>
                    <td className="p-4 align-top text-text-secondary">
                      {row.hybrid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Body>
            For a deeper walkthrough of the trade-offs, see{" "}
            <Link
              href="/blog/local-ai-vs-cloud-ai"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              local AI vs cloud AI
            </Link>
            .
          </Body>

          {/* 4. Hardware */}
          <SectionHeading id="hardware-for-local-ai">
            What hardware do I need to run local AI?
          </SectionHeading>
          <Answer>
            Any modern laptop can run a small model (4B parameters) on CPU
            alone. A consumer GPU with 8 to 16 GB of VRAM comfortably runs
            the mid-range models most users reach for. Frontier models in the
            30B to 120B range need a high-end GPU or multi-card setup.
          </Answer>
          <Body>
            InnerZero ships with a tier ladder so the right model gets picked
            automatically for your machine. Entry tier (8 to 16 GB VRAM) runs
            Qwen 3 8B for chat and code. Standard tier (16 to 24 GB VRAM)
            steps up to Qwen 3 30B for stronger reasoning. Pro tier (48 to 80
            GB VRAM or a pair of cards) runs gpt-oss 120B for heavy tasks.
            Enterprise and frontier tiers push into multi-GPU workstations
            and the 235B class. For the full matrix, see the{" "}
            <Link
              href="/models"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              supported models page
            </Link>
            , and for a practical buying guide read{" "}
            <Link
              href="/blog/hardware-for-local-ai"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              hardware for local AI
            </Link>
            .
          </Body>

          {/* 5. Free */}
          <SectionHeading id="is-local-ai-free">
            Is local AI free?
          </SectionHeading>
          <Answer>
            Yes. The open-source models and the runtimes that serve them are
            free to download and use. InnerZero itself is free forever for
            personal use. Your only marginal cost is the electricity each
            inference uses.
          </Answer>
          <Body>
            The realistic catch is not money, it is time and hardware. A
            model big enough to feel useful wants a decent GPU, which you
            either already have or buy once. First-time setup (installing the
            runtime, downloading a model) takes half an hour end to end.
            After that, every prompt is free. Compare this to a cloud
            subscription at £15 to £20 a month: local breaks even in well
            under a year of regular use. See{" "}
            <Link
              href="/blog/ai-without-subscription"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              AI without a subscription
            </Link>{" "}
            for the full maths.
          </Body>

          {/* 6. Privacy */}
          <SectionHeading id="is-local-ai-private">
            Is local AI private?
          </SectionHeading>
          <Answer>
            Yes. By default, no prompt, file, or memory leaves your machine.
            The model is a static file; it has no network access of its own.
            Only you see what you type and what the AI says back.
          </Answer>
          <Body>
            The caveat is that &quot;private&quot; depends on the app wrapper
            you use. InnerZero is designed so local mode truly is local: no
            telemetry, no analytics, no crash reports, no cloud sync.
            Optional cloud mode exists (for tasks where you want a frontier
            model) but is strictly opt-in, and even then only the current
            prompt plus a short conversation window is sent, never your full
            memory or files. For the formal statement of what is and is not
            collected, see the{" "}
            <Link
              href="/privacy"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              privacy policy
            </Link>
            .
          </Body>

          {/* 7. Offline */}
          <SectionHeading id="local-ai-offline">
            Can local AI work offline?
          </SectionHeading>
          <Answer>
            Yes. Once the model is downloaded, local AI runs with no internet
            connection at all. Planes, trains, remote cabins, air-gapped
            work laptops: all fine.
          </Answer>
          <Body>
            The one caveat is first-time setup. Installing the runtime and
            downloading the model weights does require internet, because the
            weights live in a public registry. After that single download,
            you can disconnect permanently and the AI still works. For
            reference material that also needs to be available offline, see{" "}
            <Link
              href="/blog/use-ai-offline"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              using AI offline
            </Link>{" "}
            and the knowledge-packs feature covered in{" "}
            <Link
              href="/blog/knowledge-packs-explained"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              knowledge packs explained
            </Link>
            .
          </Body>

          {/* 8. Models */}
          <SectionHeading id="what-models-can-i-run">
            What AI models can I run locally?
          </SectionHeading>
          <Answer>
            The three families InnerZero installs by default are Qwen 3,
            Gemma 3, and gpt-oss. Together they cover everything from a 1B
            voice model on a basic laptop up to a 235B reasoning model on a
            datacenter-class workstation.
          </Answer>
          <Body>
            Qwen 3 (by Alibaba) is the daily-driver family: Apache 2.0
            licensed, sizes from 4B to 235B, strong at chat and code. Gemma 3
            (by Google) covers the smaller sizes well and powers voice
            transcription. gpt-oss (OpenAI&apos;s open-weight release, 120B)
            is the top end of the default install on high-memory machines.
            For the complete catalogue and hardware mapping, see the{" "}
            <Link
              href="/models"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              models page
            </Link>
            .
          </Body>

          {/* 9. Capabilities */}
          <SectionHeading id="what-can-i-do">
            What can I do with local AI?
          </SectionHeading>
          <Answer>
            The same tasks people use ChatGPT for, minus the cloud round
            trip: writing, coding, summarising, planning, answering
            questions about your own documents, voice chat, image
            understanding.
          </Answer>
          <Body>The practical surface area looks like this:</Body>
          <ul className="mt-3 space-y-2 text-base text-text-secondary">
            <li>
              <strong className="text-text-primary">Chat:</strong> day-to-day
              conversation, idea sparring, writing help.
            </li>
            <li>
              <strong className="text-text-primary">Code:</strong> reading,
              writing, debugging, explaining across common languages.
            </li>
            <li>
              <strong className="text-text-primary">Voice:</strong> push to
              talk, wake words, fully local speech-to-text.
            </li>
            <li>
              <strong className="text-text-primary">Knowledge packs:</strong>{" "}
              your own PDFs, notes, or reference material as offline context.
            </li>
            <li>
              <strong className="text-text-primary">Tools:</strong> local
              file access, search, and calculators where supported by the
              front end.
            </li>
          </ul>

          {/* 10. InnerZero */}
          <SectionHeading id="how-innerzero-fits">
            How does InnerZero fit?
          </SectionHeading>
          <Answer>
            InnerZero is a desktop app that turns a local runtime (Ollama or
            LM Studio) into a polished daily assistant. It adds memory,
            voice, tools, knowledge packs, and an optional cloud layer for
            when you want a frontier model.
          </Answer>
          <Body>
            The separation of concerns is intentional: Ollama and LM Studio
            are excellent engines but offer only a developer-oriented chat UI.
            InnerZero is the interface that makes local AI feel like a
            product instead of a tinkering project. Cloud is optional and
            always opt-in: add your own API key for any of seven providers,
            or subscribe to the managed plan. Either way, local stays free
            forever. Start at the{" "}
            <Link
              href="/features"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              features page
            </Link>
            , grab the installer from the{" "}
            <Link
              href="/download"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              download page
            </Link>
            , or see the full breakdown on the{" "}
            <Link
              href="/pricing"
              className="text-accent-gold transition-colors hover:text-accent-gold-hover"
            >
              pricing page
            </Link>
            .
          </Body>

          {/* 11. FAQ */}
          <SectionHeading id="faq">
            Frequently asked questions
          </SectionHeading>
          <div className="mt-6 divide-y divide-border-default rounded-xl border border-border-default bg-bg-card">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="p-5">
                <h3 className="text-base font-semibold text-text-primary">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Further reading */}
          <section className="mt-14 rounded-xl border border-border-default bg-bg-card p-6">
            <h2 className="text-lg font-semibold text-text-primary">
              Further reading
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-text-secondary sm:grid-cols-2">
              <li>
                <Link
                  href="/blog/what-is-a-local-ai-assistant"
                  className="transition-colors hover:text-accent-gold"
                >
                  What is a local AI assistant
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/run-ai-on-your-pc"
                  className="transition-colors hover:text-accent-gold"
                >
                  How to run AI on your PC
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/best-free-ai-windows-2026"
                  className="transition-colors hover:text-accent-gold"
                >
                  Best free AI for Windows in 2026
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/things-you-can-do-with-innerzero"
                  className="transition-colors hover:text-accent-gold"
                >
                  Things you can do with InnerZero
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/ollama-desktop-app"
                  className="transition-colors hover:text-accent-gold"
                >
                  Ollama desktop app
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/what-models-does-innerzero-use"
                  className="transition-colors hover:text-accent-gold"
                >
                  What models does InnerZero use
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="transition-colors hover:text-accent-gold"
                >
                  All articles
                </Link>
              </li>
            </ul>
          </section>
        </article>
      </Container>

      <JsonLd data={[articleJsonLd, faqJsonLd]} />
    </div>
  );
}
