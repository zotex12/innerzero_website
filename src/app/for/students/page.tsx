import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { PersonaPage, type PersonaPageProps } from "../PersonaPage";

const DESCRIPTION =
  "InnerZero is a free AI assistant for students. Runs offline, needs no account, and stays off your university's network.";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/for/students" },
  title: { absolute: "AI for Students - InnerZero" },
  description: DESCRIPTION,
  openGraph: {
    title: "AI for Students - InnerZero",
    description: DESCRIPTION,
    url: "https://innerzero.com/for/students",
    type: "article",
  },
});

const PAGE_DATA: PersonaPageProps = {
  slug: "students",
  persona: "students",
  h1: "AI for students",
  description: DESCRIPTION,
  leadPain:
    "Students get squeezed between a paid-AI subscription they cannot afford, a campus network that may log cloud AI traffic, and free tiers that ration usage the night before a deadline. Most assistants also require an email and a credit card before you can do anything useful.",
  leadFit:
    "InnerZero is free, runs fully on your laptop so nothing touches your university's network, and works offline in the library or on the bus. No account, no email, no trial.",
  whyBullets: [
    {
      title: "Free to download",
      detail:
        "No trial, no usage caps, no credit card. Local chat, voice, memory, and knowledge packs are all included at zero cost.",
    },
    {
      title: "No account means no email list",
      detail:
        "You can install and use InnerZero without signing up or entering an email. Your name does not end up on any vendor list.",
    },
    {
      title: "Offline in dorms and libraries",
      detail:
        "WiFi in student housing is unreliable. InnerZero keeps working when the connection drops. Once a model is downloaded, nothing else needs the internet.",
    },
    {
      title: "Knowledge packs for factual questions",
      detail:
        "Install an offline Wikipedia pack so the assistant can cross-check facts locally. Helpful for reducing hallucinations in notes or revision.",
    },
    {
      title: "Works on a laptop you already own",
      detail:
        "A mid-range laptop with 16 GB RAM handles a small model. A gaming laptop or a fresh MacBook with 16 GB unified memory handles the mid-range models comfortably.",
    },
  ],
  howCards: [
    {
      title: "Free means free",
      body: (
        <>
          Local models and all core features are free with no tier above
          you. Optional cloud plans exist if you ever want a frontier model,
          but they are genuinely optional. See{" "}
          <Link
            href="/pricing"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            the pricing page
          </Link>
          .
        </>
      ),
    },
    {
      title: "Offline study",
      body: (
        <>
          Chat, voice mode, and knowledge packs all keep working with the
          WiFi off. Ideal for bus commutes, patchy campus WiFi, and
          concentration sessions with distractions off.{" "}
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
          Offline Wikipedia lets the assistant cite real articles instead of
          making things up. Useful when you want a fact check without
          opening ten browser tabs.{" "}
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
  ],
  faqItems: [
    {
      question: "Is InnerZero actually free, or is it a trial?",
      answer:
        "Actually free, forever, for personal use. There is no time limit, no usage cap, no hidden feature gate. Optional paid extras exist (cloud AI subscription, business licence) but nothing in the core local experience is behind a paywall.",
    },
    {
      question: "Will my university see what I am asking InnerZero?",
      answer:
        "If you stay in local mode, no network traffic leaves your laptop when you use the AI. The university's proxy and firewall see nothing because nothing is sent. Optional cloud mode is explicitly opt-in; leave it off and you are fully local.",
    },
    {
      question: "Can I use InnerZero for coursework?",
      answer:
        "Check your institution's policy first. InnerZero is a tool; responsible use is on you. It is well suited to brainstorming, restructuring notes, explaining concepts, revising code, and drafting practice essays. It is not a plagiarism-laundering service and should not be used as one.",
    },
    {
      question: "Does InnerZero need internet once set up?",
      answer:
        "Only if you want to update, install a new model, or turn on optional cloud mode. For normal chat, voice, and document Q&A with a downloaded model, the internet can stay off.",
    },
    {
      question: "Can InnerZero cite sources for my essay?",
      answer:
        "Knowledge packs let it reference offline Wikipedia articles, which is a reasonable starting point. For journal articles or primary sources you will still need a proper library database. The assistant can help you draft and structure the citations once you have them.",
    },
    {
      question: "What if my laptop does not have a GPU?",
      answer:
        "A CPU-only laptop with 16 GB RAM still runs the smallest models (4B parameter range) at an acceptable pace for study. It is slower than a GPU setup but genuinely usable for chat and short-form tasks.",
    },
  ],
  relatedBlog: [
    { slug: "ai-without-subscription", title: "AI without a subscription" },
    { slug: "innerzero-is-live", title: "InnerZero is live" },
    { slug: "knowledge-packs-explained", title: "Knowledge packs explained" },
  ],
  publishedDate: "2026-04-19",
  modifiedDate: "2026-04-19",
};

export default function StudentsPage() {
  return <PersonaPage {...PAGE_DATA} />;
}
