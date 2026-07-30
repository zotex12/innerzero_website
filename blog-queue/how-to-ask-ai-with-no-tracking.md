<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale
- [ ] Re-check where the chat history and training toggles currently sit in ChatGPT, Claude and Gemini (vendors move them)
- [ ] Confirm no major provider has changed its default retention or training behaviour
- [ ] Confirm the InnerZero telemetry, connection log and cloud-mode descriptions still match what ships
- [ ] Re-check every internal link target is still published
-->
---
title: "How To Ask AI With No Tracking"
description: "Tracking is five separate things, not one switch. The countermeasure for each: account linkage, stored history, training opt-outs, telemetry, network metadata."
date: "2026-09-05"
author: "Louie Summers"
authorRole: "Founder"
slug: "how-to-ask-ai-with-no-tracking"
tags: ["privacy", "guide", "local ai"]
readingTime: "9 min read"
featured: false
---

Tracking is not a single switch you can flick. When you ask an AI a question, at least five separate things can record it, and they belong to different parties under different rules. Turning off chat history deals with one and leaves the other four running. Here is the method layer by layer, starting with settings you can change in ten minutes and ending with the step that closes most of the layers at once.

> **Quick summary**
> - Tracking splits into five layers: account identity, server-side chat history, training on your inputs, app telemetry, and network metadata.
> - Start with what you already control: switch off training, switch off stored history, and stop linking the tool to your main identity.
> - Turning history off is a genuine improvement, not theatre, but it leaves retention for abuse monitoring, app analytics and your IP address untouched.
> - Encrypted DNS and a VPN move network visibility around rather than removing it.
> - Running the model on hardware you own closes the account, history, training and destination layers together.

## What gets tracked when you ask an AI a question?

Five things, and only one of them is the wording of your question. The other four record who asked, from where, how often, and what the application did next.

**Account and identity.** Signing in ties every session to a name, an email address, a payment method and a device list. Social sign-in joins your AI use to an identity you already hold elsewhere.

**Server-side chat history.** Consumer AI apps store conversations on their servers so you can scroll back. That transcript is searchable by the provider and available to a valid legal request.

**Training on your inputs.** Separate from storage. Storage means a copy exists; training means your words shape a future model version, which you cannot withdraw.

**App telemetry.** Feature usage, crash reports, timings, session counts. Usually described as anonymous, and usually still leaving your machine.

**Network metadata.** Your IP address, the DNS lookups your device makes, and the timing and size of each request. Encryption hides the content of a request, not the fact of it.

| Layer | What it records | Setting that helps | What still gets through |
|---|---|---|---|
| Account and identity | Sign-in, billing, devices, linked apps | Separate email, no social sign-in, revoke connected apps | Payment records on paid plans |
| Chat history | Prompts and answers held server-side | Turn history off | Copies kept for abuse monitoring |
| Training | Your inputs feeding a later model | Training opt-out, or an API key | Anything used before you opted out |
| Telemetry | Feature use, crashes, timings | Analytics toggle, where one exists | Events with no toggle at all |
| Network metadata | IP address, DNS, request timing | Encrypted DNS, VPN | The provider still logs an IP |

## What can I change today without switching tools?

Four settings, in this order, none of which need new software.

1. **Turn off model training first.** In consumer apps this sits under data controls or privacy, worded as improving the model. Do it before anything else, because it is the one layer with no rewind.
2. **Turn off stored chat history second.** Same settings area in most products. The real cost is losing the ability to scroll back through old conversations.
3. **Detach the tool from your main identity.** Use an email address you do not use for banking or work, avoid signing in with Google or Apple, and revoke connected apps, stale sessions and devices you no longer recognise.
4. **Reduce what goes into the prompt.** Names, addresses, client identifiers and case numbers rarely improve an answer, and they are the part that hurts if it is stored. InnerZero automates this in cloud mode with a term-scrubbing list, covered in [what your AI scrubs before sending to the cloud](/blog/privacy-blacklist-explained), and you can do it by hand in any tool.

What that sequence does not do matters just as much.

## Does turning off chat history actually stop tracking?

It helps genuinely, and it is not enough on its own. It removes the largest and longest-lived piece: a searchable archive of everything you have ever asked, sitting on someone else's server, indexed against your account. That is a real reduction and worth doing.

What it does not touch:

- **Short-term retention.** Providers keep inputs for a window described in their terms so they can investigate abuse, even with history off. The transcript is scheduled for deletion, not instantly gone.
- **Account linkage.** Sessions stay attached to your account, billing record and device list.
- **Telemetry.** History settings and analytics settings are separate controls in most products.
- **Network metadata.** The provider still sees an IP address and a timestamp per request.

The useful mental model: a history toggle is a policy commitment about data a company still receives. Running a model locally is a physical fact about data it never receives. They are not the same kind of protection, and the [7-point private AI test](/blog/the-private-ai-test) scores which one a tool actually offers.

## How do I stop my questions being used for training?

Check which door you came in through, because defaults differ sharply. Consumer chat products have historically been the ones that may train on your conversations unless you say otherwise. API access from the same vendors is usually the opposite, with no training on inputs by default.

Two routes follow from that:

- **Stay in the consumer app and opt out.** Find the training toggle, switch it off, and re-check it after major product updates, because vendors move these controls.
- **Move to an API key.** Paying per token through your own key generally puts you on the no-training default and detaches your usage from the consumer product's history features.

The provider-by-provider breakdown is in [does your AI train on your prompts](/blog/ai-prompt-training-comparison). Two caveats apply everywhere. An opt-out works forwards, not backwards, so anything already absorbed into a training run stays absorbed. And the commitment is a published policy, which a company can revise.

## What does my network still give away?

Your IP address, the destination, and the timing and size of every request. Encryption in transit protects the words in your prompt. It does not hide the pattern of you talking to an AI provider at 11pm on a Tuesday for forty minutes.

The realistic countermeasures, with their honest limits:

- **Encrypted DNS.** Moving your browser or operating system to DNS over HTTPS stops the local network and your ISP reading every hostname you look up. The resolver you chose still sees them, so this changes the audience.
- **A VPN.** This shifts the view of your traffic from your ISP to the VPN operator. A change of who, not a removal. If you are signed in to the AI service, a hidden IP buys less than people assume.
- **A separate browser profile.** Keeps AI sessions away from the cookies and logins in your everyday browsing.
- **Nothing at all, if the traffic never leaves.** A request to a model running on your own machine has no destination to observe.

## When is running the model locally the only complete fix?

When you need the account, history, training and network layers closed at once rather than one at a time. A model running on your own CPU or GPU has no server-side transcript because there is no server, no training question because your words never reach a training pipeline, and no request to log because nothing crosses the network.

I built InnerZero around that shape. It runs open model families such as Qwen3 and Gemma3 on your own hardware through [Ollama](https://ollama.com), needs no account, and sends no telemetry, analytics or crash reports. Conversations and memory sit in a local database file you can open, back up or delete, protected by full-disk encryption such as BitLocker or FileVault like the rest of your disk. Cloud mode is optional and off by default, and when it is on only the current prompt with its assembled context is sent. The full data-flow account is in [how InnerZero stays private](/blog/how-innerzero-stays-private), and the wider model and runner picture is the guide to the [best private AI local models with no tracking and no account](/blog/best-private-ai-local-models-no-tracking-no-account).

One caveat applies to every local tool, this one included: local does not automatically mean silent. Plenty of desktop apps run inference locally and still send usage analytics, so check the settings for a telemetry toggle and verify by watching outbound connections. InnerZero keeps a local connection log for that, and the company is on the UK Information Commissioner's Office register (ZC122497).

## Frequently asked questions

### Does turning off chat history delete conversations that are already stored?

Not usually. The setting changes what happens to new conversations. Existing ones normally need a separate deletion step in the same settings area. Do both: switch the setting off, then clear the back catalogue.

### Is a VPN enough to ask AI with no tracking?

No. A VPN hides your IP address from the AI provider and the destination from your ISP, which addresses one of the five layers. It does nothing about your account, stored history, training or app telemetry, and if you are signed in the provider knows who you are regardless of the IP.

### Does using an API key instead of the consumer app reduce tracking?

Yes, on two layers. API access from the major vendors generally defaults to no training on your inputs, and it sidesteps the consumer product's stored history features. You still have an account, a billing record and network metadata, and you pay per token.

### Do local AI apps track you too?

Some do. Running the model on your machine settles where inference happens, not whether the surrounding application sends usage data. Search the settings for analytics, telemetry or diagnostics before first use, and if there is no clear toggle, assume it is switched on.

### Can I verify what an AI app sends rather than trusting the settings?

Yes, and it is worth doing once. Disconnect the network and try to chat: if it stops working, inference is happening on someone else's hardware. Then reconnect and watch outbound connections with your firewall or the app's own connection log. Behaviour you can observe beats a claim in a privacy policy.

Tracking is layered, so the fix is layered too. Change the settings you already have, accept that they close some layers and not others, then decide how much of the remainder matters. For the questions where none of it should leave the machine, [download InnerZero](/download) and ask those ones locally.
