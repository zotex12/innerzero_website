---
title: "Private AI for Therapists and Counsellors"
description: "Private AI for therapists runs on your own machine so session notes and client data never leave it. Draft notes, prep supervision, and stay confidential."
date: "2026-11-10"
author: "Louie Summers"
authorRole: "Founder"
slug: "private-ai-for-therapists"
tags: ["privacy", "local ai", "guide"]
readingTime: "9 min read"
featured: false
---

Therapists and counsellors are told, correctly, never to paste a client's name or session content into ChatGPT. Yet the work that most invites AI help, writing up notes, tidying a formulation, prepping for supervision, is exactly the work that contains identifiable client material. Private AI for therapists solves this by running the model on your own computer, so the notes, names, and clinical detail never leave the room.

This post is for the person doing fifty-minute sessions and writing them up at 9pm. It covers what a local assistant helps with, where the line sits on identifiable data, and how to keep your practice defensible under your professional body's rules.

> **Quick summary**
> - Private AI for therapists means the model runs on your machine, so session notes and client data never touch anyone else's server.
> - It helps most with note write-ups, reflective practice, supervision prep, and psychoeducation drafting, all done locally.
> - The safest habit is to anonymise or pseudonymise before you type.
> - InnerZero runs offline by default, with a fail-closed egress guard and a privacy blacklist that scrubs sensitive terms before any cloud send.
> - None of this replaces your clinical judgement, your supervisor, or your professional body's guidance.

## Why should counsellors avoid putting session notes into ChatGPT?

Because anything you type into a cloud chatbot lands on a server you do not control, which in most ethical frameworks counts as a disclosure of client information. Confidentiality is the foundation of the therapeutic relationship, and the BACP, UKCP, NCPS, and equivalent bodies treat unauthorised disclosure as a breach.

A vendor promise not to train on your data is not enough. The data still travels to a third party, sits in their logs and backups, and can surface in legal proceedings or a breach.

The clean answer is to not send the data at all. A local assistant processes everything on your hardware, so there is no outbound request to inspect and no vendor breach that can expose your caseload. That is the core promise of [offline AI for sensitive work](/blog/offline-ai-for-sensitive-work).

## What can a private AI actually help a therapist with?

A local assistant is genuinely useful for the writing-heavy and reflective parts of clinical work, with no identifiable data leaving your machine. It never replaces clinical reasoning; it speeds up the typing and tidying.

Tasks that work well locally:

- **Session note write-ups.** Turn a rough summary into your preferred format (SOAP, DAP, or your own template), using a pseudonym or initials rather than a real name.
- **Formulation tidying.** Paste messy notes on presentation, history, and maintaining factors, and get a cleaner draft.
- **Psychoeducation handouts.** Draft a plain-language explanation of the cognitive model, grounding techniques, or sleep hygiene. No client data needed.
- **Reflective prompts.** Ask the model to play devil's advocate on a stuck case, in general terms, to surface supervision angles.
- **Letter and report drafting.** First-pass referral letters or summaries, identifiers stripped, that you finish by hand.

Because InnerZero builds [persistent local memory that stays on your machine](/blog/ai-that-remembers), it remembers your note format, theoretical orientation, and preferred phrasing, so you stop re-explaining how you like things written. That memory is a plain database on your disk, never a cloud profile.

What it will not do: make clinical decisions, assess risk, or replace supervision. Treat every output as a draft from a fast but unqualified assistant.

## How do I prepare for supervision without sharing client identities?

Anonymise first, then use the AI to organise your thinking, never to make the clinical call. Good supervision prep clarifies what you want to bring, the questions you are stuck on, and the patterns you have noticed, none of which require a real name.

A practical workflow: strip the case to its clinically relevant shape (presentation, interventions so far, the impasse, your own reactions), and replace any identifier with a label like "Client A". Then ask the assistant to frame two or three precise questions for your supervisor, or compress a long arc of sessions into a tight overview.

Voice helps too: InnerZero's [local speech-to-text and text-to-speech](/blog/local-text-to-speech-speech-to-text) let you talk through a reflection and get a transcript without audio leaving the device.

## Is it ever safe to use cloud AI with client material?

Keep identifiable client material out of cloud AI entirely, and reserve any optional cloud use for fully anonymised or non-client work. Cloud models are stronger on the hardest reasoning, so the temptation is real, but the moment a real name or identifying detail goes up, you have disclosed.

InnerZero is built so the local-versus-cloud line is yours to control. Cloud mode is off by default, and the app runs offline behind a fail-closed egress guard, so anything reaching for the internet without your say-so is blocked. A privacy blacklist scrubs sensitive terms before any cloud send, and even in cloud mode only the current prompt plus assembled context is sent, never your full memory database, files, or history.

If you go beyond local, the cleaner route is bringing your own API key, so the data handling terms are between you and the provider directly, at zero markup. The trade-offs are covered in [how InnerZero stays private](/blog/how-innerzero-stays-private). For therapists: keep client work local, and only let anonymised material near the cloud.

## What should counsellors check before using AI for client notes?

Check your professional body's current AI guidance, your data protection obligations under UK GDPR, and exactly what the tool does with your input. A local tool makes these easier to answer, but they still need answering. This is a starting framework, not legal advice.

A short checklist:

- Does my professional body (BACP, UKCP, NCPS, or equivalent) have written AI guidance, and have I read the current version?
- Under UK GDPR, am I treating special category health data lawfully, minimised and ideally never identifiable to the tool?
- Does the tool send my input anywhere, and can I verify that against its behaviour rather than a marketing claim?
- If I work for an agency or the NHS, what does their information governance policy permit?
- Have I told clients how their information is handled, including any tools I use?

With a local-first tool, several of these collapse to "the data never left the machine." That is not a complete answer, but it is the strongest starting position you can have. For practice-wide or commercial use, a Business Licence starts at £19.99 per seat a month.

## How does local AI compare to cloud AI for therapy notes?

For confidential clinical work, local AI wins on every dimension that touches client data, giving up only some raw reasoning on the hardest non-clinical tasks.

| Aspect | Local AI (InnerZero on your machine) | Cloud AI chatbot |
|---|---|---|
| Where client data goes | Your computer only | The vendor's servers |
| Disclosure status | Not disclosed to a third party | Disclosed to a processor |
| Works offline | Yes, fully | No |
| Data processing agreement needed | No | Usually yes |
| Breach exposure for your caseload | Limited to your own device | The vendor can be breached |
| Cost to run the local app | Free to download, no account | Subscription, account required |
| Memory of your note style | Stored locally on your disk | Held in a cloud account |
| Best for | Session notes, supervision prep, reflection | General, fully anonymised drafting only |

Storage matters too. InnerZero keeps your memory in a plain SQLite database on your own machine, protected by your operating system's disk encryption: BitLocker on Windows, FileVault on macOS, or LUKS on Linux. Keep full-disk encryption on, and your notes are protected at rest like your other clinical files.

## Frequently asked questions

### Can I write session notes with InnerZero without breaching confidentiality?

Yes, when you run it locally and keep identifiers out of what you type. In local mode the content stays on your machine, so structuring a note or tidying a formulation sends nothing to a third party. Still use initials or a pseudonym rather than a full name. The model produces a draft; you remain the clinician who reviews and signs off.

### Does InnerZero send my client notes anywhere?

Not in local mode, which is the default. The app runs offline behind a fail-closed egress guard that blocks unauthorised outbound requests, plus a connection log you can inspect. Cloud mode is off unless you turn it on, and even then only the current prompt plus its context is sent, never your full memory database, files, or history.

### Is InnerZero suitable for NHS or agency counselling work?

It can be, but check your organisation's information governance policy first. Many NHS and agency environments restrict installable software and require IT approval. Local-only operation is a strong position because there is no runtime outbound traffic to assess, but the decision rests with your employer.

### How is this different from the offline AI for sensitive work guidance?

That guide covers legal, medical, and finance broadly, while this post is specific to the therapeutic relationship: session notes, supervision prep, and keeping client identities out of the tool. The shared principle is that data that never leaves your machine cannot be disclosed. Therapists also carry particular obligations around special category health data and the confidentiality of the counselling room, which is why anonymising first matters so much.

### What computer do I need to run InnerZero for session-note write-ups?

No high-spec machine is needed: note-taking and drafting are light tasks that run comfortably on a typical modern laptop. We recommend 16GB or more of RAM, and it runs without a dedicated GPU, just more slowly. The hardware-aware setup picks a suitable local model on first launch, so you never choose one.

### Does it cost anything to write session notes locally with InnerZero?

The desktop app is free to download with no account required, and it runs entirely on your machine. Optional cloud features exist if you want them, either your own provider API keys at zero markup or a managed plan from £9.99 a month, but none are required for local note-taking. Commercial or practice-wide use takes a Business Licence.


