import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { PersonaPage, type PersonaPageProps } from "../PersonaPage";

const DESCRIPTION =
  "InnerZero gives writers persistent local memory, offline voice dictation, and a tuneable AI personality, with nothing uploaded to a third-party server.";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/for/writers" },
  title: { absolute: "AI for Writers - InnerZero" },
  description: DESCRIPTION,
  openGraph: {
    title: "AI for Writers - InnerZero",
    description: DESCRIPTION,
    url: "https://innerzero.com/for/writers",
    type: "article",
  },
});

const PAGE_DATA: PersonaPageProps = {
  slug: "writers",
  persona: "writers",
  h1: "AI for writers",
  description: DESCRIPTION,
  leadPain:
    "Writers lose memory across tools. A chatbot forgets your book's style by Tuesday, a cloud service may train on your unpublished drafts, and a voice app sends your dictation to a third-party server for transcription.",
  leadFit:
    "InnerZero keeps a persistent local memory of your style, characters, and project notes, transcribes dictation on your own machine, and runs fully offline if you want a deadline session with no internet at all.",
  whyBullets: [
    {
      title: "Persistent memory across sessions",
      detail:
        "Tell InnerZero about your voice, characters, themes, or preferred structure once. It carries that context into every future conversation until you edit or delete it.",
    },
    {
      title: "Local dictation",
      detail:
        "Push-to-talk or wake-word voice mode uses local speech recognition. No audio is sent anywhere, so pre-publication drafts stay yours.",
    },
    {
      title: "Offline mode",
      detail:
        "Write on a train, plane, or cabin with no internet. Chat, voice, and knowledge packs all keep working.",
    },
    {
      title: "Tuneable AI personality",
      detail:
        "Set the assistant's tone to match your voice, your editor's voice, or a specific character. Not a corporate-neutral default.",
    },
    {
      title: "Free forever, no deadline paywall",
      detail:
        "No subscription means the AI does not suddenly stop the night before your manuscript is due.",
    },
  ],
  howCards: [
    {
      title: "Long-form memory",
      body: (
        <>
          InnerZero builds a local memory of your project and resurfaces
          style rules, character names, and recurring themes across
          sessions.{" "}
          <Link
            href="/blog/ai-that-remembers"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            How memory works
          </Link>
          .
        </>
      ),
    },
    {
      title: "Voice dictation",
      body: (
        <>
          Local speech-to-text via faster-whisper, so your dictation never
          touches a third-party server. Useful for first drafts, voice
          memos, and walking-thinking sessions.{" "}
          <Link
            href="/blog/voice-mode-innerzero"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            Voice mode details
          </Link>
          .
        </>
      ),
    },
    {
      title: "Custom voice and tone",
      body: (
        <>
          Pick from several personality presets or define your own (prose
          stylist, dry copy editor, stage director). See{" "}
          <Link
            href="/blog/customise-innerzero"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            customising InnerZero
          </Link>
          .
        </>
      ),
    },
  ],
  faqItems: [
    {
      question: "Will InnerZero train on my writing?",
      answer:
        "No. Local models are static files; they do not learn from your use. If you enable optional cloud mode, the provider's training policy applies to that provider, and you can audit each call in InnerZero's connection log.",
    },
    {
      question: "Can I dictate novels, essays, or articles?",
      answer:
        "Yes. Voice mode is designed for long dictation. Speech is transcribed locally by faster-whisper, then the assistant can edit, restructure, or just capture the dictation into a note.",
    },
    {
      question: "Which local model is best for long-form writing?",
      answer:
        "Qwen 3 14B or 30B is the practical sweet spot on a consumer GPU. The 30B variant handles long context and subtle voice matching. Gemma 3 is a solid lighter alternative for faster iteration.",
    },
    {
      question: "Can I use cloud AI for structural editing?",
      answer:
        "Yes, optionally. Add your Anthropic or OpenAI key and send specific passages to a frontier model for structural editing or pacing notes. Cloud mode is opt-in and each request is logged in-app.",
    },
    {
      question: "Does InnerZero remember my project between sessions?",
      answer:
        "Yes. Memory persists in a local SQLite file on your disk. You can scope memory by project so the assistant stays focused on one book or article at a time, and you can export or delete the file at any time.",
    },
  ],
  relatedBlog: [
    { slug: "ai-that-remembers", title: "AI that remembers" },
    { slug: "voice-mode-innerzero", title: "Voice mode in InnerZero" },
    { slug: "customise-innerzero", title: "Customising InnerZero" },
  ],
  publishedDate: "2026-04-19",
  modifiedDate: "2026-04-19",
};

export default function WritersPage() {
  return <PersonaPage {...PAGE_DATA} />;
}
