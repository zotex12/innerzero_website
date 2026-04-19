import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { PersonaPage, type PersonaPageProps } from "../PersonaPage";

const DESCRIPTION =
  "InnerZero processes sensitive documents locally and offers optional bring-your-own-key access to frontier models when a task genuinely needs one.";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/for/researchers" },
  title: { absolute: "AI for Researchers - InnerZero" },
  description: DESCRIPTION,
  openGraph: {
    title: "AI for Researchers - InnerZero",
    description: DESCRIPTION,
    url: "https://innerzero.com/for/researchers",
    type: "article",
  },
});

const PAGE_DATA: PersonaPageProps = {
  slug: "researchers",
  persona: "researchers",
  h1: "AI for researchers",
  description: DESCRIPTION,
  leadPain:
    "Research often involves sensitive sources, unpublished data, or interview transcripts that cannot go through a third party's logging pipeline. Provider retention policies change, API terms shift, and your supervisor is right to be cautious about what lands in a cloud prompt.",
  leadFit:
    "InnerZero processes documents entirely on your hardware by default and offers an optional bring-your-own-key path to Claude Opus 4.7 or Gemini 2.5 Pro for tasks where a frontier model earns its keep. Cloud use is explicit, auditable, and on your own provider account.",
  whyBullets: [
    {
      title: "No third-party retention of your sources",
      detail:
        "Local processing means transcripts, draft papers, and raw data never reach a server owned by someone else. There is no retention policy to keep track of.",
    },
    {
      title: "Frontier models when you actually need them",
      detail:
        "For heavy summarisation or synthesis tasks, add your Anthropic or Google key. Prompts go directly to the provider, with no InnerZero server in the path.",
    },
    {
      title: "Project-scoped memory",
      detail:
        "Scope the assistant's memory to one paper or one dataset at a time, so context does not leak between unrelated projects.",
    },
    {
      title: "Document Q&A with no upload",
      detail:
        "Drop a PDF, transcript, or spreadsheet into InnerZero and query it locally. The file stays on your disk.",
    },
    {
      title: "Knowledge packs for factual grounding",
      detail:
        "Offline Wikipedia reduces hallucination risk when you want a sanity check on a definition, date, or name.",
    },
  ],
  howCards: [
    {
      title: "Local document Q&A",
      body: (
        <>
          Upload a PDF, DOCX, or spreadsheet and ask questions privately.
          All parsing and embedding happens on your machine.{" "}
          <Link
            href="/features"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            See the features list
          </Link>
          .
        </>
      ),
    },
    {
      title: "BYO frontier models",
      body: (
        <>
          Claude Opus 4.7 and Gemini 2.5 Pro are available via your own
          provider account. Pay the provider directly, no markup from
          InnerZero.{" "}
          <Link
            href="/blog/claude-opus-4-7-byo-keys"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            BYO setup guide
          </Link>
          .
        </>
      ),
    },
    {
      title: "Privacy by construction",
      body: (
        <>
          Zero telemetry, zero analytics, zero outbound calls by default.
          When cloud mode is enabled, every connection is listed in an
          in-app log.{" "}
          <Link
            href="/blog/how-innerzero-stays-private"
            className="text-accent-gold transition-colors hover:text-accent-gold-hover"
          >
            How privacy works
          </Link>
          .
        </>
      ),
    },
  ],
  faqItems: [
    {
      question: "Does InnerZero retain my documents or prompts?",
      answer:
        "No. In default local mode, nothing is uploaded or logged off-device. Conversation history is stored in a local SQLite file you control; delete it whenever you want. Optional cloud mode forwards only the current prompt to the provider you chose, and InnerZero does not store or log that content.",
    },
    {
      question: "Can I use frontier models without giving up data control?",
      answer:
        "Yes, with BYO keys. Add your Anthropic, OpenAI, or Google key and the request goes directly from your machine to the provider. The provider's retention policy applies on their side, but there is no InnerZero-operated proxy storing anything.",
    },
    {
      question: "How does InnerZero compare to ChatGPT for literature review?",
      answer:
        "Honestly: frontier cloud models still lead on hardest-case synthesis and very long context. For a literature review where you want a frontier model, use BYO keys. For everything earlier in the workflow (reading, tagging, extracting, note-making) a local model on your machine is typically good enough and keeps your sources private.",
    },
    {
      question: "Is there a connection log I can audit?",
      answer:
        "Yes. InnerZero shows every outbound connection it makes with a filterable log. Useful for demonstrating to a supervisor, ethics board, or collaborator that nothing left the machine during a given session.",
    },
    {
      question: "Will the coding agent see my raw data files?",
      answer:
        "Only if you explicitly put them in its output folder. The agent is scoped by default; it does not read arbitrary parts of your disk. You can point it at a specific working directory per project and revoke access when you are done.",
    },
  ],
  relatedBlog: [
    {
      slug: "how-innerzero-stays-private",
      title: "How InnerZero stays private",
    },
    { slug: "local-ai-vs-cloud-ai", title: "Local AI vs cloud AI" },
    { slug: "ai-that-remembers", title: "AI that remembers" },
  ],
  publishedDate: "2026-04-19",
  modifiedDate: "2026-04-19",
};

export default function ResearchersPage() {
  return <PersonaPage {...PAGE_DATA} />;
}
