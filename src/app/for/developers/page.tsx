import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { PersonaPage, type PersonaPageProps } from "../PersonaPage";

const DESCRIPTION =
  "InnerZero runs open-source coding models locally and lets you add your own Claude or GPT key when a task needs frontier reasoning, with no middleman.";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/for/developers" },
  title: { absolute: "AI for Developers - InnerZero" },
  description: DESCRIPTION,
  openGraph: {
    title: "AI for Developers - InnerZero",
    description: DESCRIPTION,
    url: "https://innerzero.com/for/developers",
    type: "article",
  },
});

const PAGE_DATA: PersonaPageProps = {
  slug: "developers",
  persona: "developers",
  h1: "AI for developers",
  description: DESCRIPTION,
  leadPain:
    "Developers worry about proprietary code leaving their machine every time they touch a cloud AI. IDE plugins log prompts, browser extensions sync history, and the strongest models are hosted on servers owned by whichever company your employer may not want you sharing code with.",
  leadFit:
    "InnerZero runs open-source coding models locally and gives you an optional bring-your-own-key path to frontier models (Claude Opus 4.7, GPT-5, Gemini 2.5 Pro) when a task genuinely needs one, with no middleman and no markup on provider pricing.",
  whyBullets: [
    {
      title: "Code never leaves your disk by default",
      detail:
        "Local inference means your prompts, your source, and your AI memory all stay on your machine. No upload, no training on your work, no chance of a prompt landing in someone else's log.",
    },
    {
      title: "No subscription for daily tasks",
      detail:
        "Boilerplate, tests, refactors, and explanations run on a local model you download once. Free forever, no per-seat billing.",
    },
    {
      title: "Sandboxed coding agent",
      detail:
        "InnerZero's agent edits files in a scoped output folder, not root, and shows you the diff before it lands. No accidental rm -rf on your home directory.",
    },
    {
      title: "Frontier models on your own account",
      detail:
        "When you want Claude Opus 4.7 for a hard reasoning problem, add your Anthropic key and the request goes directly to Anthropic. InnerZero adds zero markup.",
    },
    {
      title: "Works offline",
      detail:
        "Long flights, secure air-gapped sites, and networks that block outbound HTTPS all stop being a problem.",
    },
  ],
  howCards: [
    {
      title: "Local coding models",
      body: (
        <>
          Qwen 3 variants in the 8B to 30B range run on a standard gaming GPU
          at IDE-adjacent speed. See{" "}
          <Link
            href="/models"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            supported models
          </Link>{" "}
          or{" "}
          <Link
            href="/blog/ollama-desktop-app"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            the Ollama desktop app guide
          </Link>
          .
        </>
      ),
    },
    {
      title: "Frontier models via BYO keys",
      body: (
        <>
          Add your Anthropic, OpenAI, or Google key in Settings, then pick
          Claude Opus 4.7 or GPT-5 for specialist work. Keys are encrypted on
          your machine; requests go direct.{" "}
          <Link
            href="/blog/claude-opus-4-7-byo-keys"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            See the Opus 4.7 setup guide
          </Link>
          .
        </>
      ),
    },
    {
      title: "Sandbox-first agent",
      body: (
        <>
          The coding agent scopes writes to a configurable output folder,
          surfaces each change before it applies, and never touches your
          system files unless you explicitly widen the scope. See{" "}
          <Link
            href="/features"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            the features list
          </Link>
          .
        </>
      ),
    },
  ],
  faqItems: [
    {
      question: "Is my code private when I use InnerZero's coding agent?",
      answer:
        "Yes. With the default local models, every inference happens on your GPU and no code ever leaves your machine. If you enable bring-your-own-key cloud mode, only the prompt you send is routed directly to the provider you configured; InnerZero's servers are not in the path.",
    },
    {
      question: "Can I use Claude Opus 4.7 for coding with InnerZero?",
      answer:
        "Yes. Add your Anthropic API key in Settings and pick claude-opus-4-7 as your Specialist model. The coding agent will route reasoning-heavy steps to Opus and keep routine edits on a local model. You pay Anthropic directly at their published rates.",
    },
    {
      question: "What local models are good for code?",
      answer:
        "Qwen 3 8B handles autocomplete-style tasks and simple edits on modest hardware. Qwen 3 30B is the sweet spot for multi-file refactors on a 24 GB GPU. gpt-oss 120B is the top end for workstations with 48 GB VRAM or more.",
    },
    {
      question: "Does InnerZero integrate with VS Code or JetBrains?",
      answer:
        "InnerZero is a standalone desktop app, not an editor plugin. It shines for longer tasks (planning, refactors, file ops) where an editor sidebar feels cramped. For tight inline completion, use your editor's own AI alongside InnerZero.",
    },
    {
      question: "How does the coding agent avoid deleting my files?",
      answer:
        "All file operations happen in a configurable output folder, sandboxed from the rest of your disk. Destructive changes require confirmation, and the agent surfaces every diff before applying it. Emergency stop halts all activity with a single keystroke.",
    },
  ],
  relatedBlog: [
    {
      slug: "ollama-desktop-app",
      title: "Ollama desktop app",
    },
    {
      slug: "claude-opus-4-7-byo-keys",
      title: "Claude Opus 4.7 via BYO keys",
    },
    {
      slug: "innerzero-vs-lm-studio",
      title: "InnerZero vs LM Studio",
    },
  ],
  publishedDate: "2026-04-19",
  modifiedDate: "2026-04-20",
  heroScreenshot: {
    src: "/images/appagentpageimage.png",
    alt:
      "InnerZero AI Specialists page showing the Coding specialist agent connected to Zero, with Automation and Art specialists marked coming soon",
    caption:
      "Zero's Coding Specialist handles code tasks in a separate model, hot-swapped in VRAM, with approval gates before any file changes.",
  },
};

export default function DevelopersPage() {
  return <PersonaPage {...PAGE_DATA} />;
}
