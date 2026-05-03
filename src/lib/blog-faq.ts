/**
 * Pure FAQ extractor for blog post bodies.
 *
 * Locates a "Frequently asked questions" h2 section in raw markdown,
 * walks h3 questions until the next h2 or end-of-body, and returns
 * plain-text Q&A pairs suitable for a JSON-LD FAQPage schema.
 *
 * No fs reads, no network, no side effects. Input is a markdown
 * string, output is an array. On any structural ambiguity the
 * function returns an empty array rather than emit malformed data,
 * so JSON-LD output is always either valid or absent.
 */

export interface FaqEntry {
  question: string;
  answer: string;
}

const FAQ_SECTION_HEADING_RE = /^##\s+frequently asked questions\s*$/im;
const NEXT_H2_RE = /^##\s+/m;
const QUESTION_RE = /^###\s+(.+?)\s*$/;
const SECTION_HEADING_RE = /^#{1,6}\s+/;

const MAX_QUESTION_CHARS = 300;
const MAX_ANSWER_CHARS = 2000;

/**
 * Strip markdown formatting from an answer paragraph block so the
 * resulting text matches what JSON-LD answer engines expect.
 */
function stripMarkdownInline(text: string): string {
  let out = text;

  // Markdown links: [text](url) -> text
  out = out.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // Bold: **foo** -> foo and __foo__ -> foo
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  out = out.replace(/__([^_]+)__/g, "$1");

  // Italic: *foo* -> foo and _foo_ -> foo
  // Run after bold so the inner * pairs do not steal characters.
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2");
  out = out.replace(/(^|[^_])_([^_\n]+)_/g, "$1$2");

  // Inline code: `foo` -> foo
  out = out.replace(/`([^`]+)`/g, "$1");

  return out;
}

/**
 * Normalise a captured question. Strips a trailing question mark if
 * present, then re-adds a single ? when the question lacks terminal
 * punctuation. JSON-LD readers prefer well-formed sentences.
 */
function normaliseQuestion(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const stripped = trimmed.replace(/\?+\s*$/, "").trim();
  if (!stripped) return "";
  if (/[.!?]$/.test(stripped)) return stripped;
  return stripped + "?";
}

/**
 * Collapse a multi-paragraph answer body into a single plain-text
 * line: blank lines and runs of whitespace become single spaces.
 */
function flattenAnswer(lines: string[]): string {
  // Group lines into paragraphs separated by blank lines.
  const paragraphs: string[] = [];
  let buffer: string[] = [];
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (line.trim() === "") {
      if (buffer.length > 0) {
        paragraphs.push(buffer.join(" "));
        buffer = [];
      }
      continue;
    }
    buffer.push(line.trim());
  }
  if (buffer.length > 0) paragraphs.push(buffer.join(" "));

  const joined = paragraphs.join(" ");
  return stripMarkdownInline(joined).replace(/\s+/g, " ").trim();
}

/**
 * Locate the FAQ section in the body and slice it to the bounds of
 * the next h2 or end-of-string. Returns null if no FAQ heading is
 * present.
 */
function sliceFaqSection(body: string): string | null {
  const headingMatch = FAQ_SECTION_HEADING_RE.exec(body);
  if (!headingMatch) return null;
  const start = headingMatch.index + headingMatch[0].length;
  const tail = body.slice(start);

  // Find the next h2 boundary inside the tail. NEXT_H2_RE has the
  // multiline flag, so it locates the first ^## line.
  const nextH2 = NEXT_H2_RE.exec(tail);
  if (!nextH2) return tail;
  return tail.slice(0, nextH2.index);
}

export function extractFaqs(body: string): FaqEntry[] {
  if (typeof body !== "string" || body.length === 0) return [];

  const section = sliceFaqSection(body);
  if (section === null) return [];

  const lines = section.split(/\r?\n/);
  const entries: FaqEntry[] = [];

  let currentQuestion: string | null = null;
  let currentAnswerLines: string[] = [];

  const commit = () => {
    if (currentQuestion === null) return;
    const question = normaliseQuestion(currentQuestion);
    const answer = flattenAnswer(currentAnswerLines);

    if (
      question.length > 0 &&
      question.length <= MAX_QUESTION_CHARS &&
      answer.length > 0 &&
      answer.length <= MAX_ANSWER_CHARS
    ) {
      entries.push({ question, answer });
    }

    currentQuestion = null;
    currentAnswerLines = [];
  };

  for (const line of lines) {
    const qMatch = QUESTION_RE.exec(line);
    if (qMatch) {
      // Flush the previous Q&A before starting a new one.
      commit();
      currentQuestion = qMatch[1];
      currentAnswerLines = [];
      continue;
    }

    if (currentQuestion === null) continue;

    // Defensive: any heading inside the FAQ body that is NOT an h3
    // (e.g. h4, h5, an h2 we somehow missed) ends the current Q&A
    // without starting a new one.
    if (SECTION_HEADING_RE.test(line) && !line.startsWith("### ")) {
      commit();
      continue;
    }

    currentAnswerLines.push(line);
  }

  // Flush the final Q&A after the loop.
  commit();

  return entries;
}
