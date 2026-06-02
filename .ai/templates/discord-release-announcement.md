# Discord release-announcement template

The `@everyone` post for the InnerZero community channel, made on every version release. Ask: "make me a Discord message for the update".

## Hard constraints

- Under 2000 characters total (Discord's per-message limit). Count it before handing it over; trim if over.
- British English. No em dashes. No emojis. No invented stats, ratings, or download counts.
- Every feature claim must match what actually shipped. Keep framing modest, and add an honest platform caveat (for example "(Windows for now)") where a feature is not yet cross-platform.

## Structure (in order)

1. `@everyone`
2. Headline: `InnerZero vX.Y.Z is here!` (optionally `, and it's the biggest update yet!` for a large release).
3. One framing sentence: the release theme plus three to five highlight names.
4. `What's new:`
5. 10 to 12 bullets, each starting with `•`, one feature per line, shaped `• Name: plain benefit`. Lead with the headline feature, then the biggest user-facing ones, then group the smaller items.
6. `Download: https://innerzero.com/download`
7. `Already on an older version? Just grab the latest.`
8. A Mac line if signing, notarisation, or the minimum OS changed.
9. A closing one-liner reinforcing local-first, for example `Still entirely on your machine, by default.`

## How to build the bullet list

Pull the features from the desktop `BUILDLOG.md` release row and the website `/changelog` entry for that version, and confirm each one actually shipped before claiming it. The voice is confident, plain, and benefit-led. Return the final message inside a fenced code block so it copies cleanly.

## Worked example (v0.1.7)

```
@everyone

InnerZero v0.1.7 is here, and it's the biggest update yet!

It started with languages and grew from there, with a Prompt Library, voice panels, file support, the Action Hub, and a notarised Mac build.

What's new:

• 26 languages: the whole app, menus, and Zero's replies in your language. Right-to-left for Arabic, Hebrew, Persian, and Urdu, and it works offline
• macOS now opens cleanly: signed, notarised, and stapled, fixing the "InnerZero is damaged" message some Mac users saw on v0.1.6. No workaround needed
• Prompt Library: save prompts in folders, favourite them, and drop them into chat in one click
• Voice panels: a speech-to-text panel that turns speech into editable text, a text-to-speech panel that reads any text aloud, and a mic to dictate into chat
• Files and images: attach documents or paste a screenshot in chat, with local text recognition on images
• Artifacts and export: document-style answers open in a side panel to read, edit, and export to PDF, Word, Markdown, and more with selectable text
• Action Hub: an opt-in assistant that gathers web sources with your own Apify key, and helps fill in and submit job applications from your saved profile, with your approval (Windows for now)
• Proxy support: route downloads and cloud calls through a work or school proxy. Local AI is never proxied
• One-button setup with a single progress bar, and a faster, smaller install
• InnerZero Pro: optional membership for premium themes (like Golden Pro), personalities, and extra briefings
• Privacy egress guard: one fail-closed guard on every outbound connection, so Offline and Private modes always hold

Download: https://innerzero.com/download

Already on an older version? Just grab the latest. Mac: v0.1.7 is notarised, so it opens with a normal double click. macOS Sonoma 14+.

Still entirely on your machine, by default.
```
