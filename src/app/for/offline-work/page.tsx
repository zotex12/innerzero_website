import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { PersonaPage, type PersonaPageProps } from "../PersonaPage";

const DESCRIPTION =
  "InnerZero runs fully offline after setup: chat, voice, memory, and knowledge packs all work without internet. Built for travel, fieldwork, and air-gapped sites.";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/for/offline-work" },
  title: { absolute: "AI for Offline Work - InnerZero" },
  description: DESCRIPTION,
  openGraph: {
    title: "AI for Offline Work - InnerZero",
    description: DESCRIPTION,
    url: "https://innerzero.com/for/offline-work",
    type: "article",
  },
});

const PAGE_DATA: PersonaPageProps = {
  slug: "offline-work",
  persona: "offline workers",
  h1: "AI for offline work",
  description: DESCRIPTION,
  leadPain:
    "Fieldwork, long flights, security-conscious sites, and remote cabins share one constraint: no reliable internet. Most AI assistants become paperweights the moment you disconnect, because inference, memory, and even settings sync all route through the cloud.",
  leadFit:
    "InnerZero runs fully offline after initial setup, keeps its memory on your disk, and bundles offline Wikipedia so factual answers still work when the router is unplugged. Cloud mode is strictly opt-in; offline is the default.",
  whyBullets: [
    {
      title: "Full chat and voice mode with no internet",
      detail:
        "Once a local model is downloaded, every conversation, transcription, and voice reply happens on your own machine. No connection required.",
    },
    {
      title: "Knowledge packs for offline facts",
      detail:
        "Best of Wikipedia or Simple English Wikipedia run as local databases the assistant can search. Factual grounding without a live web.",
    },
    {
      title: "Memory persists across disconnected sessions",
      detail:
        "Your local SQLite memory file does not care about the network. Notes, profile facts, and conversation history all stay intact through disconnections.",
    },
    {
      title: "Runs in flight, at remote sites, or behind an air gap",
      detail:
        "Nothing about InnerZero assumes a persistent connection. It works at 30,000 feet, in a cabin, or on a workstation in a locked-down lab.",
    },
    {
      title: "Cloud stays strictly opt-in",
      detail:
        "Cloud mode is off by default, toggleable per session, and every outbound call is logged. You can use it for a moment, turn it off, and be confident the next chat is local again.",
    },
  ],
  howCards: [
    {
      title: "Offline after setup",
      body: (
        <>
          Install the app and one model while online. After that, every
          feature runs without internet for as long as you want.{" "}
          <Link
            href="/blog/use-ai-offline"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            Using AI offline
          </Link>
          .
        </>
      ),
    },
    {
      title: "Knowledge packs",
      body: (
        <>
          Two Wikipedia packs (95K curated articles or 280K Simple English
          articles) ship as downloadable local databases with full-text
          search.{" "}
          <Link
            href="/blog/knowledge-packs-explained"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            Knowledge packs explained
          </Link>
          .
        </>
      ),
    },
    {
      title: "Remote Ollama over LAN",
      body: (
        <>
          Keep a beefy GPU at base camp and run a thin client on a laptop
          in the field. InnerZero connects to a remote Ollama over your
          local network when cloud is not an option.{" "}
          <Link
            href="/blog/remote-ollama-innerzero"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            Remote Ollama guide
          </Link>
          .
        </>
      ),
    },
  ],
  faqItems: [
    {
      question: "What exactly works offline with InnerZero?",
      answer:
        "Chat, voice mode (input and output), document Q&A on local files, knowledge packs, memory, timers, alarms, notes, and every built-in tool that does not require a live network (search is the obvious exception). The full default experience is designed to run disconnected.",
    },
    {
      question: "What needs internet at least once?",
      answer:
        "Installing the app, downloading a model, installing a knowledge pack, and checking for updates. These are one-off setup steps. After that, you can stay offline indefinitely.",
    },
    {
      question: "Can I use InnerZero on a plane?",
      answer:
        "Yes. Airline WiFi is expensive and flaky; InnerZero does not need it. Set up at home, put the laptop in your bag, and chat or dictate through the flight without paying for in-flight internet.",
    },
    {
      question: "Does voice mode work offline?",
      answer:
        "Yes, fully. Speech-to-text runs locally via faster-whisper, text-to-speech runs locally via Kokoro. Your audio never leaves the machine. Optional cloud voice exists (OpenAI TTS) but it is off unless you enable it.",
    },
    {
      question: "Will the AI hallucinate facts without internet?",
      answer:
        "Any language model can hallucinate. The honest mitigation is a knowledge pack. InnerZero can cross-reference its answer against the offline Wikipedia database for factual questions, which meaningfully reduces made-up answers compared to an unaided model.",
    },
  ],
  relatedBlog: [
    { slug: "use-ai-offline", title: "Using AI offline" },
    { slug: "knowledge-packs-explained", title: "Knowledge packs explained" },
    { slug: "remote-ollama-innerzero", title: "Remote Ollama with InnerZero" },
  ],
  publishedDate: "2026-04-19",
  modifiedDate: "2026-04-19",
};

export default function OfflineWorkPage() {
  return <PersonaPage {...PAGE_DATA} />;
}
