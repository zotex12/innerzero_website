# Citation eligibility tactics for InnerZero blog posts

## What this is

These four tactics close the gaps in skill v1 against the Princeton GEO study (Aggarwal et al., ACM SIGKDD 2024, arXiv:2311.09735). Apply them when writing or editing blog posts to improve odds of being cited by ChatGPT, Perplexity, Claude, and Google AI Overviews. Source attribution and specific numbers are the highest-impact moves; named-expert quotations the lowest. Each tactic includes empirical lift, concrete pattern, and an anti-pattern.

## When to load this doc

Auto-load when authoring or rewriting a blog post and the post does not already hit at least 3 of 4 tactics on first draft. Also load when the user asks for a "citation pass", "AEO pass", "GEO check", or "AI citation review" on an existing draft. Skip the load for announcement posts (release notes, version bumps), where the four tactics are over-engineered for a 400-word changelog summary.

## Princeton GEO study summary

The Princeton paper "GEO: Generative Engine Optimization" (Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan, Deshpande, ACM SIGKDD 2024, arXiv:2311.09735) tested six content optimisation strategies on 10,000 search queries across 10 generative engines. The study quantified which content patterns get cited most often by AI answer engines.

The six strategies and their measured lifts: external citation injection (+115% visibility lift for lower-ranked content), statistics addition (+41% Position-Adjusted Word Count), quotation addition (+28% Subjective Impression), authoritative language (modest positive lift), fluency optimisation (modest positive, partly covered by the existing skill v1 voice section), and keyword stuffing (the one anti-pattern).

The keyword-stuffing finding flips the SEO-era assumption. Stuffing the head keyword performed 10% WORSE than baseline (no optimisation at all). Repeating a term to game ranking algorithms reduces visibility under generative engines. Avoid it.

The three metrics the paper reports are not interchangeable. Note the distinctions when reading the lift numbers:

- Visibility: how often the page appears anywhere in the engine's response across the test queries. The +115% figure is a visibility lift for lower-ranked source pages.
- Position-Adjusted Word Count (PAWC): how much of the engine's response is sourced from the page, weighted by position in the answer. The +41% figure for statistics is a PAWC lift.
- Subjective Impression: human-rated relevance and usefulness of the page when surfaced. The +28% figure for quotations is a Subjective Impression lift.

The numbers describe different signals. They are not additive. A page that wins on Visibility may still lose on PAWC if its content is buried at the end of long generated answers.

## Tactic 1: Cite external sources (+115% lift for lower-ranked content)

Why it works: AI engines weight content with verifiable third-party sources higher because they can chain citation trust through their training data and retrieval indexes.

Pattern: when making a non-obvious claim, link to the original source.

- Research claim, link to the arXiv paper, ACM/IEEE paper, or peer-reviewed source.
- Vendor capability claim, link to the vendor's official docs or release notes.
- Statistic, link to the original survey or report, not a repackaged blog post.
- Standard or spec, link to the spec itself (RFC, W3C, MDN), not a tutorial.

Real example from corpus, `what-is-a-local-ai-assistant.mdx:21`:

> The key technology is [Ollama](https://ollama.com), which makes it simple to download and run open-source AI models locally.

This is a vendor-doc citation. Mid-strong, since the link goes to the homepage rather than to specific Ollama docs that ground the claim. A stronger version would link to `https://github.com/ollama/ollama` or to the relevant Ollama docs page for the specific capability being described.

Counter-example from corpus, `innerzero-vs-chatgpt.mdx:31`:

> ChatGPT's free tier is limited. The Plus subscription is $20/month. The Pro tier is $200/month. Over a year, that's $240 to $2,400.

The pricing claim is correct but unsourced. A citation pass would link to `https://openai.com/chatgpt/pricing` so the figures are verifiable, and so AI engines can chain the trust to OpenAI's authoritative page.

Anti-pattern: linking to AI-generated content farms, listicle blog spam, or paraphrased aggregators. The skill v1 internal-linking rule already bans these for outbound links. This rule extends it to all citations.

Volume target: 2 to 4 external source citations per post, in addition to internal links. Not every paragraph needs one. Cite where the claim is non-obvious or where authority matters most.

Recognising the gap: scan the post for unsupported claims of the form "X is the case" or "X does Y" without a link. Each one is a citation candidate. If the claim is a piece of common knowledge (water boils at 100C), no citation needed; if it would change a reader's belief about a product, paper, standard, or vendor, cite it.

## Tactic 2: Use statistics with attribution (+41% lift)

Why it works: numbers are extractable, citable units that AI engines prefer to lift verbatim.

Pattern: replace vague magnitude language with specific numbers. Where the number is not yours, attribute it.

- "InnerZero downloads have grown" becomes "InnerZero downloads grew from X to Y between [month] and [month]".
- "Most users prefer local AI" becomes "N% of [demographic] in [source] survey said they preferred local-first AI".

Real example from corpus, `run-ai-on-your-pc.mdx:25-26`:

> An NVIDIA GPU with 6+ GB VRAM (like a GTX 1660 or RTX 3060)

Specific hardware spec, attributable as InnerZero's own recommendation. The GPU model names anchor the claim concretely. Strong T2 example, no external attribution needed since it is a first-party product recommendation.

Counter-example from corpus, `ai-that-remembers.mdx:23`:

> ChatGPT's memory feature stores brief notes and summaries. It's more like a sticky note than a real history of your relationship with the AI.

This claims a third-party product capability with no source link. A citation pass would link to OpenAI's memory feature announcement or docs (for example `https://help.openai.com/en/articles/8590148-memory-faq`) so the claim is anchored to a citable source.

Anti-pattern: inventing statistics. NEVER make up a number. If a number is not in your hand or in a citable source, omit the statistic and use qualitative language instead.

Authoritative-source policy for InnerZero stats: only your own download counts, your own blog and site analytics, and your own product capabilities are citable as InnerZero claims. External claims need external sources. Vendor claims need vendor-doc links.

Hard rule: every statistic in the post is either (a) attributable to InnerZero's own data, (b) attributable to a linkable external source, or (c) cut.

Recognising the gap: scan the post for vague magnitudes ("most", "many", "a lot of", "huge", "tons of", "the vast majority"). Each one is a candidate for replacement with a specific number plus source, or a rewrite to a qualitative claim that does not pretend to be quantitative.

## Tactic 3: Add named-expert quotations (+28% lift)

Why it works: AI engines treat named-source quotes as higher-trust units. The quote attaches the claim to a real person and role, which the engine can cross-reference against its training data.

Pattern: when a topic has a recognised expert with a public statement, quote them by name with role.

- "Researchers think local AI is the future" becomes "Karthik Narasimhan, Princeton CS professor and co-author of the GEO paper, found that ...".
- "OpenAI engineers have warned about ..." becomes "[Name], [role at OpenAI], said in [source] that ...".

No examples found in the sampled InnerZero corpus. Louie's voice favours first-person assertion and product recommendation over named-expert citation. Expected outcome. The doc nonetheless asks for occasional named quotes on technical or research-heavy topics.

When NOT to force this: comparison posts comparing products often do not have natural named-expert quotes. Do not manufacture one. The +28% lift averages across post types; not every post benefits.

Anti-pattern: anonymous "industry experts say" or "many believe". This is the opposite of a named-expert quote and reduces trust. Either name the source or rewrite as a direct factual claim with citation.

Volume target: 0 to 2 named quotes per post. Zero is fine for product comparisons. One or two strengthens explainers and how-tos on technical or research-heavy topics.

Recognising the gap: scan the post for "experts say", "researchers think", "engineers warn", "the community believes", and similar anonymous attributions. Each one is either a quote candidate (find the actual person who said it) or a candidate for cutting (if no real quote exists). Manufacturing a fake quote, even paraphrased, is worse than zero quotes.

## Tactic 4: Use authoritative language (modest positive lift)

Why it works: AI engines key on phrases that signal grounded claims. The phrase plus a named source forms a compact citable unit.

Patterns that work:

- "Research from [institution] shows ..."
- "According to [source] ..."
- "[Source] found that ..."
- "[N] studies have demonstrated ..."

Patterns that do not work (filler, no grounding):

- "It is widely known that ..."
- "Many people say ..."
- "Studies have shown ..." (no source named)
- "Research suggests ..." (no source named)

No strong example found in the sampled InnerZero corpus. The corpus avoids the weak filler patterns above (which is good) but also misses the modest lift from the grounded patterns. Adding two or three properly cited authoritative-language phrases per post is the realistic improvement.

Counter-example from corpus, `innerzero-vs-chatgpt.mdx:49`:

> Many people will use both. ChatGPT for heavy tasks. InnerZero for everything personal, private, and daily.

"Many people" is the weak pattern. A citation pass would either rewrite as a direct claim with no audience generalisation, or link to a citable usage survey if one exists.

Counter-example from corpus, `customise-innerzero.mdx:79`:

> Most people prefer formatted.

Bare assertion of user preference with no survey data. Either cite a UX study, replace with a first-person observation ("I default to formatted; switch to plain text if you copy responses often"), or cut.

Hard rule: if the post uses an authoritative-language phrase, the source MUST be named in the same sentence or the next one. "Studies show" with no citation is filler and should be cut.

Recognising the gap: scan the post for "studies show", "research suggests", "it is widely known", "many believe", "experts agree", "data shows". Each is filler unless a named source follows. Either ground the claim with a citation in the same sentence or rewrite as a direct first-person assertion ("I tested this on five machines and found ...").

### Worked example: T1, T2, T4 applied together to one paragraph

Before (zero tactics applied):

> Local AI is the future. Many people prefer running models on their own hardware, and the technology is getting better every year. Studies have shown that local models can match cloud quality for everyday tasks.

This paragraph fails T1 (no citations), T2 (vague magnitudes, no numbers), T3 (no named expert), and T4 ("Studies have shown" with no source named). Three sentences, four gaps.

After (T1, T2, T4 applied; T3 skipped where unnatural):

> The Princeton GEO study (Aggarwal et al., ACM SIGKDD 2024, arXiv:2311.09735) found that AI engines weight content with verifiable third-party sources up to 115% higher when citing lower-ranked pages. Local-first AI fits this pattern. Models like Qwen3 (Alibaba release, 2025) and Llama 3 (Meta release notes) now run on consumer GPUs with 8 to 16 GB VRAM. The Hugging Face Open LLM Leaderboard shows several open models scoring within 5% of GPT-4 on MMLU benchmarks.

Three sentences, four citations, two specific numbers (8 to 16 GB VRAM; within 5% on MMLU), one named entity each for the GEO paper and the Open LLM Leaderboard. T3 (named-expert quote) was skipped because no public quote naturally fits the paragraph; manufacturing one would have been worse than the gap.

## Anti-pattern: keyword stuffing (-10% vs baseline)

Princeton finding: stuffing the head keyword performs WORSE than not optimising at all. The model penalises repetition.

Detection: any single noun phrase appearing more often than once per ~50 words is suspect. Quick density check on a 1500-word post: any term over 30 occurrences is borderline. Comparison posts naturally inflate the brand-mention rate (the post must name both products), so the rule of thumb relaxes for comparison-format posts. The spirit of the rule is "did the author force the keyword in unnatural places to game ranking?", not "did the post mention its subject often?".

Fix: vary phrasing, use synonyms, replace some occurrences with pronouns, or restructure. The skill v1 banned-phrase list already discourages padding; this rule extends to head-keyword discipline.

Real example from corpus: no posts flagged in the sampled six. One borderline case (`innerzero-vs-chatgpt.mdx`, 3.48% "InnerZero" density) is explained by comparison-post format requiring repeated brand mention, not by stuffing intent. Spirit of the rule preserved.

## Pre-publish self-check (8-of-8 scoring)

For each post, score 1 point per tactic clean. Target: 6+ before publish.

- [ ] T1: Post cites at least 2 external sources by name with links.
- [ ] T2: Every statistic is attributed to a citable source or InnerZero's own data.
- [ ] T3: Post includes 0 to 2 named-expert quotes (only where natural).
- [ ] T4: Authoritative-language phrases all have a named source in the same sentence.
- [ ] T5: Head keyword appears no more than once per ~50 words (no stuffing).
- [ ] T6: All 4 skill-v1 schema-emission rules hold (FAQ section present, etc.).
- [ ] T7: All skill-v1 banned-phrase rules hold (em dash ban, AI-phrase list, etc.).
- [ ] T8: All skill-v1 internal-linking rules hold (no duplicates, all targets exist).

Below 6/8: revise before commit. The skill v1 validation gates already enforce T6 to T8; T1 to T5 are the new tactics this doc introduces.

## When this doc does NOT apply

- Announcement posts (release notes, version bumps): T1 to T4 are over-engineered for a 400-word changelog summary. Apply skill v1 only.
- Pure how-to setup guides: T3 (named-expert quotes) often forces unnatural padding. Skip T3 if it does not fit.
- Pillar or definitional content (for example `/what-is-local-ai`): apply all four. These are the highest-impact pages for citation eligibility.
