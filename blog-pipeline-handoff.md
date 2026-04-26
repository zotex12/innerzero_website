# InnerZero Blog Pipeline — Resume Guide

Paste this into a new Claude chat to resume the blog content pipeline. Claude will have full context for generating new posts that match the existing system.

---

## Context for Claude

I'm Louie, solo founder of InnerZero (local-first AI desktop assistant). I run a semi-automated weekly blog pipeline on innerzero.com. I need new blog posts added to my existing queue system.

### The system (already built, don't rebuild)

- **Repo:** `github.com/zotex12/innerzero_website` (private)
- **Queue location:** `blog-queue/` at repo root — drafts sit here until publish day
- **Live blog location:** `src/content/blog/*.mdx` — where posts render on innerzero.com
- **Auto-publish workflow:** `.github/workflows/blog-auto-publish.yml` — fires every Tuesday 09:00 UTC
- **Publish script:** `scripts/publish-next-blog-post.py` — picks lowest-numbered `NN-*.md`, fills date, strips HTML comment, writes to live dir, deletes from queue, commits
- **Frontmatter date placeholder:** `date: "PUBLISH_DATE_PLACEHOLDER"` (script replaces on publish)
- **Quick-edit checklist:** HTML comment block at top of every draft, starts with `<!-- QUICK-EDIT CHECKLIST` — stripped on publish

**Do NOT modify the workflow, script, or any existing live blog post.** Only add new drafts to `blog-queue/`.

### Rules for new posts (non-negotiable)

**Voice and writing rules:**
- No em dashes anywhere. Use commas, periods, parentheses, or "and"
- Contractions allowed (don't, you're, it's)
- Varied sentence length, occasional one-sentence paragraphs for impact
- First-person ("I", "we") where natural
- Specific numbers, not vague claims
- Opinions with conviction, not hedged
- Honest about tradeoffs
- British spellings where natural

**Banned phrases/patterns:**
- "In conclusion", "Furthermore", "Moreover", "Additionally"
- "It's important to note", "It's worth mentioning"
- "Dive into", "Unlock", "Leverage", "Navigate the landscape"
- "In today's fast-paced world", "Cutting-edge", "Game-changing", "Revolutionary"
- "Seamless", "Robust", "Powerful"
- Three-part rhythmic lists ("faster, smarter, safer")
- "Not only X but also Y"
- Uniform paragraph length
- Closing with "key takeaway" or similar

**Architecture privacy — NEVER reveal:**
- 8-layer memory system (just say "memory" or "local memory")
- Sleep/reflection pipeline internals (just say "the assistant learns over time")
- Retrieval re-ranking, confidence routing, tool shortcut system
- Phase numbers
- Virtual FS overlay, XML tool format, hot-swap VRAM mechanism
- Agent-scoped memory isolation
- Two-gate approval system internals (just say "asks before writing files")

**Safe to mention (public surface):**
- Runs locally via Ollama or LM Studio
- 7 cloud providers via BYO keys or managed subscription
- Voice interaction (STT, TTS)
- Projects with document knowledge
- Coding agent with approval gates
- Hardware tier auto-detection, frontier tier
- Offline mode, privacy blacklist, connection log
- 5 themes, one unlockable (Neon Tokyo)
- Business licence
- Telegram remote access
- Supported models: qwen2.5-coder family, qwen3-coder, codellama, codestral, codegemma, deepseek-coder-v2, etc.

### Per-post SEO requirements

- 1200-1800 words (2000+ for comparison pieces)
- Primary keyword in H1, first 100 words, and at least one H2
- Meta description 140-160 chars, keyword included
- Minimum 3 internal links to other innerzero.com pages or blog posts
- One external authoritative link where relevant (Anthropic docs, Ollama docs, etc.)
- Alt text on any images

### Per-post AEO requirements

- 4-6 H2 sections phrased as questions
- Each H2 answered in 2-3 declarative sentences immediately after heading (LLM-quotable chunk)
- One comparison table if topic supports
- FAQ section at bottom with 3-5 Q&A pairs, Q as H3, A as 2-3 sentences
- Summary box at top: 3-4 bullet takeaways under 100 words total
- Bold key claims in each section's opening paragraph

### Frontmatter format (copy exactly)

```
---
title: "Title Case Title Here"
description: "140-160 char meta description with keyword, reads naturally."
date: "PUBLISH_DATE_PLACEHOLDER"
author: "Louie"
authorRole: "Founder"
slug: "url-slug-here"
tags: ["tag1", "tag2", "tag3"]
readingTime: "X min read"
featured: false
---
```

### Quick-edit checklist block (required at top of each post, after frontmatter)

```
<!--
QUICK-EDIT CHECKLIST (before publish day):
- Verify no factual claims are stale
- [post-specific bullet 1]
- [post-specific bullet 2]
- [post-specific bullet 3]
-->
```

This block is automatically stripped by the publish script. Use it to remind yourself what to verify the week of publish (model versions, pricing, vendor quotes, etc.).

---

## Existing blog inventory (for duplicate avoidance)

Before drafting, Claude MUST read the current live blog directory (`src/content/blog/*.mdx`) and the queue (`blog-queue/`) to avoid duplicate topics.

Posts published so far (original 25 + queued 10):
- ai-that-remembers, ai-without-subscription, best-free-ai-windows-2026, customise-innerzero, hardware-for-local-ai, how-innerzero-stays-private, innerzero-is-live, innerzero-vs-chatgpt, innerzero-vs-gpt4all, innerzero-vs-jan, innerzero-vs-lm-studio, knowledge-packs-explained, local-ai-vs-cloud-ai, ollama-desktop-app, open-source-ai-models-explained, remote-ollama-innerzero, run-ai-on-your-pc, things-you-can-do-with-innerzero, unrestricted-mode-explained, use-ai-offline, voice-mode-innerzero, what-is-a-local-ai-assistant, what-models-does-innerzero-use, why-we-built-innerzero, why-your-ai-should-remember-you
- claude-opus-4-7-byo-keys, offline-coding-agent, innerzero-vs-cursor, ai-prompt-training-comparison, multi-model-concurrency, cloud-credits-vs-byo-keys, hidden-costs-of-local-ai, offline-ai-for-sensitive-work, ai-coding-agent-sandbox-safety, frontier-tier-hardware-local-ai

**Always check the actual directory — this list will be out of date. Read the files.**

---

## Workflow for adding new posts

### Step 1: Confirm topics with Louie

Before drafting, propose a topic list. Each topic should:
- Have a clear primary keyword (search intent)
- Not duplicate existing posts (comparisons/sharp angles are fine, rehashes aren't)
- Tie to something concrete (product feature, news event, user pain point)

### Step 2: Check duplicates

Read `src/content/blog/*.mdx` filenames and `blog-queue/*.md` filenames. Flag any overlaps.

### Step 3: Decide filename numbering

Check what's currently in `blog-queue/`. If queue is empty, start at `01-`. If queue has existing posts, continue the sequence (e.g. if `04-*.md` is the highest, start new ones at `05-`).

The script picks lowest-numbered file each Tuesday, so numbering = publish order.

### Step 4: Draft posts to `blog-queue/NN-slug.md`

Follow all rules above. Include quick-edit checklist block. Use `PUBLISH_DATE_PLACEHOLDER` for date.

### Step 5: Verify no accidental publishing

Do NOT modify:
- `src/content/blog/*.mdx` (live posts)
- `.github/workflows/blog-auto-publish.yml`
- `scripts/publish-next-blog-post.py`
- `src/lib/blog.ts` (blog index)
- Sitemap config, robots.txt, Next.js config

### Step 6: Commit and push

```
git add blog-queue/
git commit -m "Blog queue: add N more posts for weekly auto-publish"
git push
```

That's it. The cron picks them up on subsequent Tuesdays.

---

## What to tell Louie when starting

Ask before drafting:

1. **How many new posts?** (typical batch: 5-10)
2. **Any specific topics in mind?** Or should you propose topics based on recent InnerZero developments / current AI news?
3. **Any product updates since last batch?** (new version, new features, new models supported)
4. **Anything to promote deliberately?** (e.g. "I just shipped X, can we get a post about it?")

Then propose a topic list, wait for confirmation, check duplicates, draft.

---

## Common failure modes to avoid

1. **Em dash slipping in.** Always grep the drafts for em dashes before committing. Most common failure.
2. **Architecture leak.** Stating implementation details instead of user-facing behaviour. Re-read drafts asking "would a user or a developer write this?"
3. **Duplicate topic.** Skipping the inventory check and writing a post that overlaps an existing one.
4. **Numbering collision.** Writing `01-new-post.md` when `01-existing-queued-post.md` is still in the queue.
5. **Modifying live posts.** Only touch `blog-queue/`, never `src/content/blog/`.
6. **AI-voice drift.** Reading back a draft and noticing it sounds generic or corporate. Fix with: more first-person, more opinion, more specific numbers, shorter sentences.

---

## Useful context from previous batches

**Voice guideline that works:** "InnerZero isn't the fastest local AI assistant. It's probably not the prettiest. But if you want something that runs entirely on your machine, remembers what you tell it, and has a coding agent that won't touch files without asking, it's the only thing I've found that actually does all three."

**Structure that works for comparison posts:** Summary box → "What is X and Y" → comparison table → "Where X wins" → "Where Y wins" → "Which should you pick" → FAQ.

**Structure that works for how-to posts:** Summary box → "What you need first" → numbered steps → "Common problems" → FAQ.

**Structure that works for opinion/tradeoff posts:** Hook paragraph with a concrete example → "The honest tradeoffs" section → "When this matters" → "When it doesn't" → closing stance.

---

## Auto-publish system reminders

- Cron: `"0 9 * * 2"` (Tuesday 09:00 UTC)
- Manual trigger: `gh workflow run blog-auto-publish.yml`
- Dry-run: `gh workflow run blog-auto-publish.yml -f dry_run=true`
- Works from `C:\Users\sumlu\Documents\innerzero_website`
- Workflow picks LOWEST-numbered `NN-*.md` each run — controls publish order

To skip a week: temporarily disable workflow in GitHub Actions settings, or rename the next-in-queue file (e.g. add a `z-` prefix so it sorts last).

To push a post early: manually trigger the workflow with `gh workflow run blog-auto-publish.yml` from the repo folder. It publishes the next queued post immediately.

---

## Summary

New chat → paste this doc → tell Claude how many posts you want → confirm topics → Claude drafts to `blog-queue/` with correct numbering → Claude commits and pushes → the cron handles the rest.

No rebuilding, no new infrastructure, no manual publishing. Just content.
