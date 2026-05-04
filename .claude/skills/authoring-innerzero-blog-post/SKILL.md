---
name: authoring-innerzero-blog-post
description: Use when writing, drafting, editing, or rewriting blog posts for the InnerZero website at C:\Users\sumlu\Documents\innerzero_website. Triggers on tasks involving .mdx files in src/content/blog/, .md files in blog-queue/, or any request to author, draft, plan, or rewrite InnerZero blog content. Encodes InnerZero-specific copy rules (em dash ban, 12+ banned AI phrases, brand naming, voice), structure conventions (question-form h2s with answer-first chunks, FAQ section, summary box, comparison tables one-row-per-line), tag taxonomy (13 approved entries), internal linking discipline, AEO patterns for ChatGPT/Perplexity/Google AI Overviews citations, encryption/privacy claim discipline, and gotchas from 18+ shipped batch posts. Does NOT apply to general website pages, components, routes, the desktop app at C:\Users\sumlu\Documents\InnerZero, or the Summers Solutions site.
---

## Quick reference

- Published posts live at `src/content/blog/<slug>.mdx`. Queue drafts live at `blog-queue/<slug>.md` (note `.md`, not `.mdx`).
- Queue frontmatter `date:` carries a real ISO date (YYYY-MM-DD). The publish script picks the earliest queue file with `date <= today UTC`. There is NO `PUBLISH_DATE_PLACEHOLDER` in queue frontmatter; that token only survives in body copy for legacy "Last verified:" lines.
- Word count target: 1200-1800 (empirical ceiling on shipped corpus is 1791 from Batch 2).
- 12 validation gates run before commit. See "Validation gates before commit" section.
- Read "Gotchas" section every time. It captures bugs from 18+ shipped batch posts.

## When this skill applies

Triggers (use this skill):

- Writing a new blog post (queue or direct-publish)
- Editing or rewriting an existing post under `src/content/blog/` or `blog-queue/`
- Planning a batch of related posts (comparison, pillar, AEO category)
- Reviewing a draft for copy hygiene, structure, or AEO discipline
- Auditing a post against the banned-phrase or em-dash rules

Non-triggers (this skill does not apply):

- General website pages (homepage, pricing, /download, /privacy, /licence)
- React components, routes, design system, or styling work
- The desktop app at `C:\Users\sumlu\Documents\InnerZero` (different repo entirely)
- The Summers Solutions parent site
- next.config, package.json, deploy config, Vercel settings

## Repo layout for blog content

- `src/content/blog/*.mdx`: published posts. Live URL is `https://innerzero.com/blog/<slug>`.
- `blog-queue/*.md`: queued drafts. Extension is `.md`, NOT `.mdx`. The publish script renames during the move.
- Auto-publish cron: `0 9 * * 2,5` (Tuesday + Friday 09:00 UTC) via `.github/workflows/blog-auto-publish.yml`, executing `scripts/publish-next-blog-post.py`.
- On publish: queue file's leading QUICK-EDIT CHECKLIST HTML comment is stripped, any body-level `PUBLISH_DATE_PLACEHOLDER` tokens are substituted with the frontmatter date, the file is written to `src/content/blog/<original_stem>.mdx`, the queue `.md` is deleted, and `git add` + `git commit -m "Auto-publish: <slug>"` runs.
- PROJECT_MAP.md regeneration is NOT a website-publish concern. The publish script contains zero PROJECT_MAP references. PROJECT_MAP lives in the desktop repo and is regenerated there.
- Sitemap (next-sitemap) auto-includes published posts. `blog-queue/` is excluded from sitemap and from Next route discovery because BLOG_DIR is hardcoded to `src/content/blog` in `src/lib/blog.ts:5`.

## Frontmatter shape

The slug is derived from a frontmatter `slug:` field if present, otherwise from the filename minus `.mdx` (`src/lib/blog.ts:31`). Every Batch 1+2 post sets `slug:` explicitly. Match the corpus convention: include `slug:` in every new post.

Reading time is read from frontmatter, NOT auto-computed. `src/lib/blog.ts:39` reads `data.readingTime || ""` and there is no word-count code anywhere in blog.ts. Authors MUST set `readingTime: "X min read"`. Estimate at 200 words/minute and round up.

OG image is optional. The system falls back to `/banner.png` when `ogImage` is absent (`src/app/(marketing)/blog/[slug]/page.tsx:42`). Only set `ogImage:` when the post needs a custom image. Most posts omit it.

Literal example (copy and adapt for new posts):

```yaml
---
title: "Does InnerZero Work Offline?"
description: "InnerZero runs locally on your machine and works fully offline once models are installed. What works without internet, what needs a one-time download, and what cloud features look like."
date: "2026-05-21"
author: "Louie"
authorRole: "Founder"
slug: "does-innerzero-work-offline"
tags: ["local ai", "privacy", "features"]
readingTime: "5 min read"
featured: false
---
```

Field reference:

| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | yes | The h1. Avoid title case where it harms readability. Wrap in double quotes. |
| description | string | yes | 1-2 sentences. Used for og:description, twitter:description, RSS, JSON feed, and llms.txt. Wrap in double quotes. |
| date | string | yes | ISO `YYYY-MM-DD`. In queue files this is the scheduled publish date. Wrap in double quotes. |
| updated | string | no | ISO date. Set when materially refreshing a published post. |
| author | string | no | Defaults to `"Louie"` if absent. |
| authorRole | string | no | Defaults absent. Corpus uses `"Founder"`. |
| slug | string | no | Falls back to filename. Set explicitly to match corpus convention. |
| tags | string array | yes | 2-4 entries from the approved taxonomy. Use SPACES not hyphens. |
| readingTime | string | yes | Format `"N min read"`. Manual. |
| featured | boolean | no | Defaults to `false`. Reserve `true` for hero-card posts only. |
| ogImage | string | no | Falls back to `/banner.png`. Omit unless a custom image exists. |
| draft | boolean | no | Only honoured by RSS/JSON feed (excludes from feed). Not used in shipped corpus. |

## Approved tag taxonomy (14 entries)

The corpus uses SPACES, not hyphens. Audited via `grep -h "^tags:" src/content/blog/*.mdx` across all 28 published posts. New tags require explicit Louie approval. Pick 2-4 per post.

- `announcement`
- `automation`
- `claude`
- `cloud ai`
- `coding agent`
- `comparison`
- `features`
- `getting started`
- `guide`
- `innerzero`
- `local ai`
- `memory`
- `privacy`
- `voice`

## Structure conventions

- Word count: 1200-1800 target. Comparison posts trend 1600-1700. Empirical ceiling on the corpus is 1791 (Batch 2).
- Summary box at top: 2-3 sentences answering the implicit question in the title. Acts as the answer-first chunk for AEO featured-snippet capture. Render as a markdown blockquote with a bold lead, e.g. `> **Quick summary**` followed by 3-5 bullets.
- 4-6+ question-style h2s. Use the literal question a reader would type into search. Good: `## Does InnerZero work offline?`. Bad: `## Offline functionality`. Bad: `## How offline works`.
- Answer-first chunk pattern under each h2: the FIRST 2-3 sentences are a direct declarative answer, no preamble, no "Let's dive in", no "Great question". THEN longer detail.
- 1+ comparison table where the topic supports it. CRITICAL: every table row MUST be on its own line. Single-line collapsed tables fail to render. GFM is wired via `remark-gfm` (phase blog_render_gfm_enable, 2026-05-03).
- 3+ internal links per post pointing to existing blog posts or pillar pages. Audit every linked slug exists on disk before commit.
- Internal links MUST use the no-trailing-slash convention: `/blog/<slug>`, NOT `/blog/<slug>/`. Centralised in `src/lib/metadata.ts:absoluteUrl()`.
- `## Frequently asked questions` section at the bottom (exact heading, case-insensitive). Triggers FAQPage JSON-LD via `src/lib/blog-faq.ts`. Include 4-6 h3 questions. Question max 300 chars, answer max 2000 chars (extractFaqs hard limits at `src/lib/blog-faq.ts:24-25`).
- First-person voice (`I built`, `I tested`, `I noticed`) for opinion or experience claims. Plural (`we`, `InnerZero`) for company-level statements.

## Copy hygiene rules

These rules push out of default LLM behaviour. Apply them every time.

EM DASH BAN: never use the em dash character (Unicode U+2014, the wide horizontal dash that LLMs default to) anywhere in customer-facing copy. Use commas, periods, parentheses, or restructure the sentence. The /blog corpus is fully clean of this character. Do not regress.

BANNED AI PHRASES (zero occurrences across the post; case-insensitive grep). Each phrase is shown below as two adjacent inline-code tokens so this skill body itself does not trigger the audit when authors grep their own posts. Treat the two tokens as one phrase when reading.

- `In` `conclusion`
- `Further` `more` (the conjunctive adverb)
- `More` `over` (the conjunctive adverb)
- `dive` `into`
- `del` `ve`
- `un` `lock`
- `lever` `age`
- `seam` `less`
- `ro` `bust`
- `em` `bark`
- `har` `ness`
- `ele` `vate`
- `Whether` `you're` (sentence opener)
- `power` `ful` (must appear zero times per file)

BRAND NAMING (strict):

- Product name is "InnerZero" (one word, capital I, capital Z). NEVER "Inner Zero". Lowercase "innerzero" only inside the slogan and inside URLs.
- Casual reference: "Zero".
- Tagline (only when verbatim quoted): `inner peace. inner joy. innerzero.` (all lowercase, three full stops).
- Currency: GBP only (£). No $ or € in pricing claims.
- Local app: "Free to download" or "Free". NEVER "free forever", "always free", "for life", "permanent".
- Cloud plans: always "optional", never "required".

VOICE: direct, factual, slightly conversational. Match the existing /blog corpus tone. Read 2-3 recent comparison posts before drafting if unsure.

## AEO and SEO patterns

- Question-form h2s + answer-first chunks are the load-bearing AEO mechanism for ChatGPT, Perplexity, and Google AI Overviews citations.
- `llms.txt` at `https://innerzero.com/llms.txt` is the LLM-facing site description. New pillar topics may warrant new entries; raise to Louie before adding.
- BlogPosting JSON-LD is auto-emitted on every post by `src/app/(marketing)/blog/[slug]/page.tsx`. No author action.
- FAQPage JSON-LD is auto-emitted IF the post body contains a `## Frequently asked questions` section parseable by `src/lib/blog-faq.ts`. Always include this section.
- Internal-link anchor text should be keyword-rich and descriptive. Not "click here". Not the bare URL.
- `/what-is-local-ai` is the local-AI category pillar. Many existing posts link to it. Link from new local-AI posts when topically relevant.
- robots.txt allows `/` and disallows `/account/*` and `/api/*`. Sitemap is auto-generated. No manual edits needed.

## Internal linking discipline

- Every internal link target must exist on disk. Before commit: `ls src/content/blog/*.mdx` and verify each linked slug is present.
- No duplicate internal links inside a single post. If `/blog/innerzero-vs-jan` is linked once, do NOT link it again later in the same post. Pick the best location.
- Prefer linking newer or canonical posts over deprecated ones.
- External links: licensed websites only. Do not link to AI-generated competitor blog posts.

## Encryption and privacy claim discipline

- The memory database is plain SQLite. Protection comes from OS-level disk encryption (BitLocker on Windows, FileVault on macOS, LUKS on Linux). NOT app-level encryption.
- Application-level Fernet encryption applies ONLY to: BYO API keys (`api_keys.py` in the desktop repo) and Telegram bot tokens (`integrations/telegram_settings.py` in the desktop repo).
- Cloud mode forwards only the current prompt with assembled context. The full memory database, files, profile facts, and prior conversation history are never sent.
- Microphone audio: processed locally. Raw audio is never uploaded. Cloud Voice Standard mode sends only transcript text.
- Connection log is local-only, viewable in app, daily rotation, not uploaded.
- Regulatory: ICO ZC122497. Company No. 16448945.
- If a post cites vendor ToS language, re-verify the quote against the current ToS the day BEFORE publish. Add an inline `Last verified [date]` stamp where it matters.

## Architecture moat (what stays private)

ALLOWED public mentions: Ollama, LM Studio, Qwen3, Gemma3, gpt-oss families, faster-whisper STT, Kokoro TTS, Silero VAD, SQLite, Python with PyWebView, "sleep and reflection" as a general phrase.

NOT ALLOWED in public copy:

- Internals of the 8-layer memory system
- Sleep-pipeline pass numbers or sequence
- Retrieval strategy specifics (cosine thresholds, recency decay, candidate confidence values)
- Confidence routing details
- Hidden orchestration internals
- Agent loop iteration caps
- policy_gate tier names
- Automation specialist mode names

If a post would naturally call for a private item, generalise. Good: "InnerZero processes conversations overnight to extract facts and prune duplicates". Bad: "Pass 5 of the sleep pipeline runs fact extraction with Ollama against unprocessed memories from the last 7 days at 0.6 confidence".

## Queue mechanics

Queue posts at `blog-queue/<slug>.md`:

- Top of file MAY contain an HTML comment block titled `QUICK-EDIT CHECKLIST` listing items to verify the week of publish (version numbers, vendor quotes, model names, ToS snapshots). The block is stripped on publish by `scripts/publish-next-blog-post.py`. The stripper's regex requires the literal `QUICK-EDIT CHECKLIST` substring inside an HTML comment at the very start of the file (after optional whitespace and BOM). The first checklist item across the corpus is a universal "verify no factual claims are stale".

  Empirical shape (first lines of `blog-queue/ai-coding-agent-sandbox-safety.md`):

  ```
  <!--
  QUICK-EDIT CHECKLIST (before publish day):
  - [ ] Verify no factual claims are stale (agent safety models, competitor feature sets)
  - [ ] Re-check Cursor Composer, Continue, Aider, and Devin current sandbox behaviour
  - [ ] Confirm InnerZero's approval flow description still matches what ships
  - [ ] Update if any major AI coding tool has added or removed safety features
  - [ ] Refresh the examples of "things an agent shouldn't do" if new incidents have become public
  -->
  ```

- Frontmatter `date:` carries a REAL ISO date (the scheduled publish date). The publish script picks the earliest queue file with `date <= today UTC`, with filename alphabetical tie-break. The pre-2026-05-03 `PUBLISH_DATE_PLACEHOLDER` literal in frontmatter is gone; the only place that token may still appear is body copy (e.g. inline "Last verified:" lines), where the publish script substitutes it using the frontmatter date.
- File extension is `.md`, NOT `.mdx`. The publish script renames during the move.
- Target on publish: `src/content/blog/<slug>.mdx`. A pre-existing target file is a fatal error (publish exits 1).
- Manual run: `gh workflow run blog-auto-publish.yml` for a real publish, or `gh workflow run blog-auto-publish.yml -f dry_run=true` for a dry-run that prints the first 40 lines of the transformed content without writing or committing.
- PROJECT_MAP.md regen: NOT triggered by the publish script. Website publishes do not touch PROJECT_MAP.

## Validation gates before commit

Run all 12 before staging the change.

1. Em-dash audit: zero U+2014 characters in the new or edited file (run a search for the literal Unicode codepoint).
2. Banned-phrase audit: zero occurrences of the full banned list (case-insensitive grep).
3. `power` + `ful` count: zero per file.
4. `Whether` + `you're` count: zero per file.
5. Internal link target audit: every `/blog/<slug>` link has a corresponding `.mdx` on disk.
6. No duplicate internal links inside the same post.
7. Cross-batch h2 dedup: scan corpus. The universal `## Frequently asked questions` is the only allowed repeat.
8. Frontmatter parses as valid YAML, all required fields present, tags from the approved 13-entry set only.
9. Word count between 1200 and 1800.
10. `## Frequently asked questions` section present with 4-6 h3 questions inside it.
11. `npm run build` clean (catches MDX syntax errors).
12. After publish: curl-grep on the live URL confirms `<table>` elements render and FAQ JSON-LD is emitted in `<head>`.

## Gotchas

The highest-signal section. Read every time.

1. Tables collapse if rows are not on separate lines. GFM is wired via remark-gfm (phase blog_render_gfm_enable, 2026-05-03). One row per line, period.
2. `.md` for queue, `.mdx` for published. A `.mdx` file in `blog-queue/` will not be picked up by the publish script. A `.md` file in `src/content/blog/` will not render (BLOG_DIR filter at `src/lib/blog.ts:26` requires `.mdx`).
3. Queue date is a REAL date (YYYY-MM-DD), NOT a placeholder. Today's date or any past date triggers immediate publish on the next cron tick. Future dates queue cleanly.
4. Reading time is MANUAL, not auto-computed. Set `readingTime: "N min read"` in frontmatter. Estimate at 200 words/minute and round up.
5. Do not trust chat memory for which posts exist. `ls src/content/blog/*.mdx` is truth. The corpus grows on Tue and Fri.
6. Encryption-at-rest claims must be grounded. Memory is plain SQLite plus OS disk encryption. Only BYO API keys and Telegram tokens are app-level Fernet-encrypted.
7. No duplicate internal links. A past phase caught duplicates and consolidated to single mentions.
8. Vendor ToS quotes go stale fast. Re-verify the day before publish.
9. Cross-batch h2 dedup is enforced. If a new h2 matches an existing h2 (other than the universal FAQ heading), rewrite.
10. Use model FAMILY names, not exact strings, in evergreen posts. "Qwen3", "Gemma3", not "qwen3:14b-q4_K_M".
11. Public-copy reach. Each published post hits sitemap, RSS feed, JSON feed, llms.txt context, and triggers a Vercel auto-deploy. Treat as customer-facing law on first commit.
12. Trailing slash discipline. Internal links use `/blog/<slug>`, not `/blog/<slug>/`. Centralised in `src/lib/metadata.ts:absoluteUrl()`.
13. Tags use SPACES, not hyphens. `"local ai"` not `"local-ai"`. `"coding agent"` not `"coding-agent"`. Audited across all 28 published posts.
14. PROJECT_MAP.md is a desktop-repo concern only. Website publishes do not regenerate it.

## References

When authoring or rewriting a post, also load:

- `references/citation-eligibility-tactics.md`: Princeton GEO study tactics for AI citation eligibility (external citations, statistics, quotations, authoritative language, plus the keyword-stuffing anti-pattern). Auto-load when a draft does not hit at least 3 of 4 missing tactics on first pass, or when the user asks for a "citation pass" / "AEO pass" / "GEO check".
