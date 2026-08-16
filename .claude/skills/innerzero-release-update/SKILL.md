---
name: innerzero-release-update
description: Use when updating the InnerZero marketing website, the GitHub releases README, the Discord announcement, and the newsletter release email for a new desktop version release. Triggers on requests like "update the site for v0.1.8", "a new version is out, update everything", "refresh the website for the release", or "update the releases README". A full runbook covering which pages and files to change, the desktop version-surface check, the exact-asset-name download caveat, validation, review, the announcement, and the email to subscribers.
---

# InnerZero release update runbook

After a new InnerZero desktop version `vX.Y.Z` is built and published, update three surfaces: the marketing website (`C:\Users\sumlu\Documents\innerzero_website`), the GitHub releases README (`zotex12/innerzero-releases`), and the Discord announcement. This is cross-repo. Do the steps in order.

## Step 0 — Ground truth (do this first)

- Confirm the version `vX.Y.Z`.
- Read the ACTUAL GitHub release so you use real values, not assumptions. GitHub MCP `get_latest_release` (or `get_release_by_tag`) on `zotex12/innerzero-releases`. Record the EXACT asset filenames and byte sizes:
  - `InnerZero-Setup-X.Y.Z.exe`, `InnerZero-Setup-X.Y.Z-mac.dmg`, `InnerZero-X.Y.Z-x86_64.AppImage` (convert bytes to GB/MB, GiB-based: bytes / 1073741824).
- **Exact-filename caveat (critical):** the website `/download/thanks` resolver matches the release asset by EXACT `name`. Any filename mismatch silently falls back to the releases page, so every website filename must equal the real asset name.
- Verify the desktop version surfaces in `C:\Users\sumlu\Documents\InnerZero`: `VERSION` (the next dev cycle, e.g. X.Y.Z+1), `installer/innerzero.iss` `MyAppVersion`, and `BUILDLOG.md` (`--- Unreleased (vX.Y.Z+1) ---` marker plus the `vX.Y.Z Released` row). `version_gate.py` `MINIMUM_VERSION` is the forced-update FLOOR, not the current version, so leave it unless a forced update is intended. The desktop "cut the released row and open the next dev cycle" is a desktop-side step documented in the desktop `.claude/rules/build-and-install.md` "Version tracking" section; if it has not been done, flag it as a separate desktop task.

## Step 1 — Get the FULL feature list (do not under-scope)

- A release bundles EVERYTHING shipped since the previous public release, not just the headline. Read the desktop `BUILDLOG.md` release row plus `git -C <desktop> log --oneline` since the prior release to enumerate every user-facing feature.
- Cross-check with a review pass (the `codex:codex-rescue` agent, or the `opencode-reviewer` DeepSeek agent) asked specifically to "find user-facing features missing from the website". This catches what the first pass misses.
- Verify each feature actually SHIPPED via git log; a "deferred" plan note can be stale (a feature marked deferred may in fact have shipped later in the cycle).

## Step 2 — Website pages to update

- `src/app/(marketing)/download/DownloadCards.tsx`: the `VERSION` const, the three `size` fields, and the macOS `note` (signing / notarisation status).
- `src/app/(marketing)/download/page.tsx`: the "see what's new in vX" hero link, the size-note callout, the JSON-LD `softwareVersion`, the three JSON-LD offer URLs (must be the exact asset filenames), and the macOS offer `operatingSystem`.
- `src/app/(marketing)/page.tsx`: the home JSON-LD `softwareVersion` and `featureList` (add new headline features).
- `src/app/(marketing)/changelog/page.tsx`: PREPEND a new `Release` object (`version`, `date`, `releaseDate`, `latest: true`) with New / Improved / Fixed groups, and REMOVE `latest: true` from the previous entry. The `changelog.xml` RSS route reads the same `RELEASES` array, so this updates the page and the feed together. Make the entry comprehensive (the full feature list from Step 1).
- `src/lib/constants.ts`: `FEATURE_CARDS` (home cards; keep the `FeatureCards.tsx` grid balanced for the card count), `PRICING_FREE.features`, `SYSTEM_REQUIREMENTS` (keep it cross-platform), and `COMING_SOON_FEATURES` (move any now-shipped items out).
- `src/app/(marketing)/features/page.tsx`: add `SECTIONS` items or sections for the new features; keep the primary / secondary `bg` ALTERNATION correct (inserting a section flips the `bg` of every following section, so re-balance); update the features JSON-LD description; import any new lucide icons.
- `src/components/sections/HomeFAQ.tsx`: add or adjust FAQ entries (this array also feeds the FAQPage JSON-LD; keep the item-count comment accurate).
- `public/llms.txt` and `public/llms-full.txt`: the version label, install sizes, download URLs (exact filenames), and the new features in the feature lists. These are AEO files for AI crawlers. Gotcha: llms-full.txt states the backend/engine list in MULTIPLE places (the intro paragraph, the "manage models yourself" sentence, and the Technical architecture "Local AI backend:" line); update every one, not just the first hit.
- `src/app/models/page.tsx` and `src/app/what-is-local-ai/page.tsx`: the supported-models page and the local-AI education page both state the backend/engine list in prose and FAQ answers (what-is-local-ai's `FAQ_ITEMS` also feeds its FAQPage JSON-LD). The v0.1.8 update missed both; they are easy to forget because they live outside `(marketing)/`.
- **`src/lib/models.ts` (the /models catalogue) whenever the desktop model catalogue changed:** mirror the desktop `api_keys.PROVIDER_MODELS` picker EXACTLY (the desktop keeps some older ids live; do not guess retirements) and bump `lastReviewed`. Feeds the /models ItemList JSON-LD. The v0.2.0 update missed it (shipped a two-release-stale catalogue).
- **`src/lib/features/*.ts` (the feature category pages):** stat tiles, capability bodies, and FAQ answers state theme counts, engine lists, sizes, and shipped/coming-soon status, and every FAQ feeds FAQPage JSON-LD. Bump the touched category's `modified` date. The v0.2.0 update missed the theme count, an engine list x4, a stale comingSoon (cloud vision had shipped), and a size.
- **`src/app/for/*.tsx` (persona landing pages):** name specific frontier models as the current BYO offer, in prose and FAQPage JSON-LD; swap to the current flagships when the catalogue moves. Missed in v0.2.0 (still recommending a prior-generation model).
- **`public/llms-full.txt` states the MODEL CATALOGUE in TWO places** (the cloud-mode paragraph near the top AND the "Supported API providers" section deep in the file) on top of the backend-list multi-site gotcha above; grep the whole file for every provider name, and also check its install steps and Coming Soon list for claims a release has obsoleted.
- `src/components/sections/HomeFAQ.tsx` + `src/components/sections/IntegrationsSection.tsx`: hardware claims and the engine/connector grid drift too (grid tiles need logo assets in `public/images/integrations/` - never source new logos without approval).
- **Capability-mention sweep (mandatory when a release adds or changes a backend, engine, provider, platform, or connector):** the fixed file list above is NOT sufficient. Grep the whole site for every place the OLD capability set is stated and update each one, e.g. for engines: `grep -rlE "Ollama|LM Studio" src/ public/ --include="*.tsx" --include="*.ts" --include="*.txt"` then check each hit file for the new capability. Judge each mention in context (educational prose, FAQ answers, JSON-LD, and AEO files usually need the update; blog-post links, logo grids, and legal copy about software actually DISTRIBUTED usually do not; a capability that ships inert or BYO-only must be framed as such, never as bundled or managed).
- `src/app/(marketing)/privacy/page.tsx` and `terms/page.tsx`: ONLY if the release adds NEW third-party data flows or processors (a new connector, a scraping or automation service, new PII egress). Add interim copy flagged "pending solicitor review". Do NOT renumber Terms sections; house new clauses in an existing adjacent section plus the liability and indemnification carve-out lists plus the third-party-software inventory. Note any controllership position for the operator's solicitor to confirm.
- `src/content/blog/*.mdx` (optional): sweep for stale facts (old version, "Windows only", theme counts).

## Step 3 — GitHub releases README (`zotex12/innerzero-releases`)

- GitHub MCP `get_file_contents` on `README.md` to get its blob SHA; `get_latest_release` for the exact asset names and sizes.
- Update: the version line, the download table (filenames, `/releases/download/vX/...` URLs, sizes), the macOS install note (signing / notarisation), a SHA256 checksums note, a "What's New in vX" section, and fold the new headline features into Key Features.
- Write back via `create_or_update_file` (path `README.md`, branch `main`, `sha` = the blob SHA, em-dash-free commit message).

## Step 4 — Validate

- `npm run lint` and `npm run build`. Next 16 runs TypeScript at build time, not ESLint, so the pre-existing `Turnstile.tsx` `react-hooks/refs` lint errors are not yours and do not block the build.
- Greps: no stray old version (except historical changelog rows and a deliberate "fixes the vPREV issue" sentence); no em dashes or emojis in customer copy; exactly one changelog `latest: true`; every download asset filename equals the real release asset.

## Step 5 — Audit + review

- Run the repo's `/pre-audit` (if not folded into planning) and `/post-audit`. Run a diff review (`codex:codex-rescue` or `opencode-reviewer` / DeepSeek). Apply non-blocking fixes, re-validate. `/codex:adversarial-review` is user-triggered only and cannot be launched by the model.

## Step 6 — Commit + push

- Stage explicit paths only (never `git add -A`). One commit, no em dashes, no emojis. Push to `main`. If the blog auto-publisher cron raced the push (rejected), `git fetch origin main` then `git rebase origin/main` then push; it is clean because the files differ.

## Step 7 — Discord announcement (post it via Postiz)

- Build the announcement from the template at `.ai/templates/discord-release-announcement.md` (under 2000 characters, `@everyone`, bullets, British English, no em dashes or emojis, modest accurate framing, honest platform caveats).
- The operator's local Postiz MCP server is connected (tools `mcp__postiz__integrationList`, `mcp__postiz__integrationSchema`, `mcp__postiz__integrationSchedulePostTool`, and others), and the Discord announcements bot is wired into it (integration `platform: "discord"`, currently named "pantheon"). So post the announcement straight to Discord through Postiz, not just as a copy-paste block.
- Posting goes to a public channel, so show the operator the final message and get a go-ahead before publishing, unless they tell you to just post it.
- Flow to post:
  1. `mcp__postiz__integrationList` and pick the entry with `platform: "discord"` (currently "pantheon"). Resolve the `id` dynamically; do NOT hardcode it (it changes if the integration is reconnected).
  2. `mcp__postiz__integrationSchema` with `platform: "discord"`, `isPremium: false` to learn the required `settings` (for example the target channel).
  3. `mcp__postiz__integrationSchedulePostTool` with one `socialPost`: `integrationId` = the discord id, `isPremium: false`, `date` = the current UTC time for an immediate post, `shortLink: false`, `type: "now"` (or `"schedule"` with a future UTC `date`, or `"draft"`), `settings` from the schema, and `postsAndComments: [{ content: <HTML>, attachments: [] }]`.
  4. The content must be HTML: wrap each line in `<p>`, render bullets as `<ul><li>...</li></ul>` (or `<p>` lines). Allowed tags only: h1, h2, h3, u, strong, li, ul, p (never combine u and strong). Whether `@everyone` actually pings depends on the Postiz / Discord webhook config, so confirm that with the operator.
  5. Report the result (post id and status).
- If Postiz is unavailable (server not running at localhost:4007, or the tools error), fall back to returning the message in a fenced code block for manual posting. Always keep the plain copy-paste block available so the operator can review or post by hand.
- Optional: the same flow can cross-post a shorter version to X, Mastodon, or Bluesky using their integrations from `integrationList`.

## Step 8 — Email the newsletter list (release-update email)

- After the site, the README, and Discord are done, send the "new version is out" email to the `newsletter_subscribers` list via Resend. The sender is `updates@innerzero.com` (domain `innerzero.com` is verified in Resend). The runner lives at `scripts/release-email/` and runs LOCALLY (no public send endpoint on the live site).
- Prerequisite (one-time): `RESEND_API_KEY` must be in `.env.local`. If a send command reports it missing, stop and ask the operator to add it; do NOT edit `.env.local` yourself.
- Flow:
  1. Edit `scripts/release-email/release.json` for this release: `version`, `dateLabel`, `subject`, `preheader`, `intro`, and the `New` / `Improved` / `Fixed` highlight arrays. Keep it to the highlights, not the full changelog. Same copy rules as the site (British English, no em dashes, no emojis, no "forever / always free / permanent").
  2. Dry run and eyeball the preview, then show the operator: `node --env-file=.env.local scripts/release-email/send.mjs` (writes `scripts/release-email/preview.html`, sends nothing).
  3. Send a single real test to the operator: `node --env-file=.env.local scripts/release-email/send.mjs --test louie@innerzero.com`.
  4. Only after the operator approves, send to everyone: `node --env-file=.env.local scripts/release-email/send.mjs --send`. A `.sent-log.json` guard blocks a second send of the same version unless `--force` is passed.
- Every email carries a working unsubscribe link (`/unsubscribe?token=...`) and a one-click `List-Unsubscribe` header handled by `/api/newsletter/unsubscribe`. Do not remove these.
- To change the email DESIGN edit `scripts/release-email/template.mjs`; to change the WORDS edit `release.json`. See `scripts/release-email/README.md`.

## Hard conventions

- British English. No em dashes. No emojis. No invented stats, ratings, or download counts. No "free forever" / "always free" / "permanent" for the local app.
- Tailwind utilities and existing design tokens only. No new packages. Server components by default.
- Modest, accurate feature framing with honest platform caveats (for example "(Windows for now)" where a feature is not yet cross-platform).
- New legal copy is interim and flagged pending solicitor review.

## Known gotchas (learned the hard way)

- The exact-filename download resolver (Step 0) is the single biggest functional risk.
- Do not under-scope the feature list (Step 1); a release equals everything since the last public release. The first pass tends to miss things like the Prompt Library, voice STT/TTS panels, file/image attach, and artifacts/export.
- "Deferred" plan notes can be stale; verify shipped via git log.
- Keep the `features/page.tsx` background alternation correct when inserting sections.
- The blog auto-publisher cron may race your push; rebase and re-push.
- Check the GitHub release-notes body against the site for version-string consistency (for example the macOS minimum OS) and flag mismatches to the operator.
