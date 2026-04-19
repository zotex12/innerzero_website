// Shared helpers for the RSS and JSON feed endpoints. Plain TypeScript, no
// third-party dependency. Template strings + escaping done by hand per the
// project rule against unnecessary packages.

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com";
export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, "");

/**
 * XML-escape a string. Covers all five characters that matter for text
 * nodes and attribute values: & < > " '. Applied to every user-sourced
 * field before it lands in an XML document.
 */
export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Strip common markdown syntax to produce a plain-text excerpt. Not a full
 * markdown parser. Removes code fences, inline code, links (keeps the
 * label), bold/italic, headings, blockquote arrows, list markers, and
 * HTML tags. Enough for a 200-char excerpt preview; not structurally
 * correct for any other use.
 */
export function stripMarkdown(src: string): string {
  let text = src;
  // Fenced code blocks ```lang\n...\n```
  text = text.replace(/```[\s\S]*?```/g, " ");
  // Inline code `...`
  text = text.replace(/`[^`]*`/g, " ");
  // Images ![alt](url) -> alt (don't emit the URL)
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  // Links [label](url) -> label
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // HTML-style tags
  text = text.replace(/<[^>]+>/g, " ");
  // Horizontal rules and leading #, >, *, -, numbered markers
  text = text.replace(/^\s{0,3}(?:#{1,6}\s+|>+\s*|[-*+]\s+|\d+\.\s+)/gm, "");
  // Bold/italic markers
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

/**
 * Truncate to roughly `max` characters at the nearest word boundary, never
 * mid-word. Adds an ellipsis only when truncation actually happened.
 */
export function truncateAtWord(src: string, max = 200): string {
  if (src.length <= max) return src;
  const slice = src.slice(0, max + 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice.slice(0, max);
  return cut.trimEnd() + "\u2026";
}

/**
 * Build an excerpt for a post. Prefers the frontmatter description when
 * present, otherwise the first ~200 plain-text characters of the MDX body.
 *
 * Ordering discipline (strict): strip markdown -> truncate at word
 * boundary -> return plain text. Any XML-safe transformation (xmlEscape
 * for normal fields, CDATA wrap for RSS <description>) is the caller's
 * final step. Escaping BEFORE truncation is forbidden: word-boundary
 * slicing can cut through "&amp;" leaving "&am", which feed readers
 * HTML-decode and flag as "Named entity expected. Got none." in the W3C
 * feed validator. Escape is always the last transformation on the
 * string heading into the XML template, never an intermediate step.
 */
export function buildExcerpt(params: {
  description?: string;
  content?: string;
  max?: number;
}): string {
  const max = params.max ?? 200;

  // Step 1: resolve the plain-text source. Frontmatter description is
  // already plain text; MDX body needs markdown stripped.
  const desc = (params.description || "").trim();
  const plain = desc !== "" ? desc : stripMarkdown(params.content || "");

  // Step 2: truncate at a word boundary. Operating on plain text (never
  // pre-escaped) means there are no HTML entities to slice through.
  // Final trim in case truncateAtWord received an already-short string
  // with trailing whitespace (it only trimEnds on the truncation branch).
  return truncateAtWord(plain, max).trim();
}

/**
 * Wrap a string as an RSS CDATA payload for the <description> field.
 * CDATA sidesteps the double-decoding that trips HTML parsers inside
 * some RSS readers (feed XML entity decode -> reader HTML parse), which
 * is what the W3C feed validator flags with "Named entity expected.
 * Got none." on otherwise-valid entity references.
 *
 * Guards:
 * - Empty input still emits an empty CDATA block so <description> is
 *   never missing from an item.
 * - Literal "]]>" in the payload is split into two adjacent CDATA
 *   sections via the canonical "]]]]><![CDATA[>" trick so the XML
 *   stays well-formed. (Not expected in practice, but cheap defence.)
 * - Trailing whitespace on the excerpt is trimmed before wrapping.
 *
 * Everything inside CDATA is treated as literal text by XML parsers, so
 * ampersands, angle brackets, smart quotes, em dashes, and em spaces
 * all pass through untouched. No xmlEscape required (and none wanted,
 * since &amp; inside CDATA would render literally as "&amp;").
 */
export function toRssCdata(text: string): string {
  const trimmed = (text || "").trim();
  if (trimmed === "") return "<![CDATA[]]>";
  const safe = trimmed.includes("]]>")
    ? trimmed.replace(/]]>/g, "]]]]><![CDATA[>")
    : trimmed;
  return `<![CDATA[${safe}]]>`;
}

/**
 * RFC 822 date for RSS. Node/Edge both expose Date.prototype.toUTCString()
 * which emits the correct format (e.g., "Fri, 18 Apr 2026 00:00:00 GMT").
 */
export function toRfc822(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return new Date(0).toUTCString();
  return d.toUTCString();
}

/**
 * Resolve a path (relative or absolute URL) against SITE_URL. Leaves
 * already-absolute URLs untouched.
 */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (!pathOrUrl.startsWith("/")) return `${SITE_URL}/${pathOrUrl}`;
  return `${SITE_URL}${pathOrUrl}`;
}
