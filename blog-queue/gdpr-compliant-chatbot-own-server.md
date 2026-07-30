<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale
- [ ] Confirm ICO registration ZC122497 and Company No. 16448945 are still current
- [ ] Re-check that the "not legal advice" line is still present and prominent near the top
- [ ] Confirm cloud mode is still off by default and still clearly labelled in the app
- [ ] Confirm the memory store is still plain SQLite (no app-level encryption claim has crept in)
-->
---
title: "GDPR Compliant Chatbot That Keeps All Conversations On Your Own Server"
description: "Self-hosting a chatbot removes the processor contract, the transfer question and the vendor retention audit. What it does not remove is your own controller duties."
date: "2026-08-09"
author: "Louie Summers"
authorRole: "Founder"
slug: "gdpr-compliant-chatbot-own-server"
tags: ["privacy", "local ai", "guide"]
readingTime: "9 min read"
featured: false
---

"GDPR compliant chatbot" is a phrase people type into search, and it quietly misleads. Compliance is a property of an organisation and how it handles personal data. It is not a feature you can buy, install or tick, and no chatbot can hand it to you. InnerZero included.

What a chatbot that keeps every conversation on your own server does do is remove work. Whole categories of it.

> **Quick summary**
> - Compliance describes your organisation, not a product. Keeping conversations local removes work, not responsibility.
> - Four workstreams drop away: the third-party processor contract, the transfer assessment, the vendor retention audit and the vendor-side deletion request.
> - Deletion becomes a local file operation. Conversations and memory sit in a SQLite file in your user data folder.
> - Every controller duty stays with you: lawful basis, privacy notice, security of the machine, records and answering requests.
> - Optional cloud mode puts a third party back in scope for that traffic. Local mode removes the paperwork.

**This post is general information, not legal advice.** I build software, I am not a solicitor or a data protection adviser. Use it to understand the shape of the problem, then check your own situation with someone qualified.

## Why does a self-hosted chatbot remove whole categories of GDPR work?

Because most of the data protection work around a chatbot exists to manage the fact that someone else is holding your data. Remove the someone else and that work has nothing to attach to. You are left with the duties you already had as the organisation deciding why and how personal data gets used.

The split is simple to state without legal training. Your organisation sets the purpose, so it is the controller. A vendor handling that data on your behalf is a processor. Nearly every hosted chatbot creates that second relationship the first time a client detail goes into the box, and it then needs a contract, due diligence, a record, and ongoing attention.

Run the model on a machine you own and there is no second relationship in the chat path. Here is what falls away.

| GDPR workstream | Hosted chatbot service | Chatbot on your own server |
|---|---|---|
| Processor contract | Needed before any personal data is sent | No third party in the chat path |
| Sub-processor chain | Must be tracked, and it can change | Nothing to track |
| International transfers | Establish where processing happens and what safeguards apply | Data stays on the machine you chose |
| Retention | Set by the vendor's policy, which you re-check | Set by you, enforced by deleting a file |
| Deletion requests | Raised with the vendor, then you rely on their answer | A local operation you carry out and verify |
| Breach exposure | A shared service holding many customers' data | The single machine you control and secure |
| Evidence for an audit | Vendor documentation plus your own records | Your own records, plus the machine itself |

Nothing in the right-hand column says "compliant". It says "fewer moving parts owned by someone else". That is the honest benefit.

## Do I need a processor contract if there is no third-party processor?

Not for the chat itself, because there is nobody in that path to contract with. A processor contract governs an organisation handling personal data on your behalf. When the model runs on your own GPU and writes to your own disk, no organisation is handling anything on your behalf.

Other suppliers do not disappear. Your IT support company, your backup provider and whoever manages the device still touch it, and those relationships need their usual treatment. What drops out is the AI vendor, usually the newest contract in the stack.

InnerZero does not sit in the middle in local mode. The desktop app sends no telemetry, analytics or crash reports. Model weights come down once through Ollama or LM Studio, then inference happens on your hardware. The full data-flow breakdown is in [how InnerZero stays private on your own hardware](/blog/how-innerzero-stays-private).

## What happens to the international transfer question when nothing leaves the building?

For the chat path, it does not arise. A transfer question asks whether personal data moves into another jurisdiction under someone else's control. If the conversation is written to a disk in your own office, nothing moves and there is nothing to assess.

With a hosted service the question is never finished. You establish where processing happens and whether support staff abroad can reach the data, then check again when the vendor quietly updates a page. On your own machine the answer is fixed by physical fact.

Two caveats. Model downloads and app updates cross borders, but those are software artefacts rather than personal data, and once the weights are on disk you can pull the network cable and keep working. That offline test is the one I recommend for regulated work, covered in [offline AI for sensitive legal, medical and finance work](/blog/offline-ai-for-sensitive-work).

The second is what "your own server" means. InnerZero is a desktop app, so for most people it is the PC on their desk. If you would rather keep the heavy hardware in one place, you can [point InnerZero at a remote Ollama server on your own network](/blog/remote-ollama-innerzero), and every request still stays inside walls you control.

## How does a deletion request work when the data is a file on your own server?

It becomes a local file operation. You find the record, delete it, and confirm it is gone. There is no ticket, no vendor response time and no waiting to learn whether the data also left their backups.

InnerZero keeps conversations and long-term memory in a SQLite database in your user data folder. Individual facts can be reviewed and removed in the app. The whole database can be deleted, and the assistant starts again with no history. Your evidence is the file itself, not a supplier's confirmation email.

Backups are the part people forget. If you keep copies, the deletion has to reach them too, and that duty is identical either way. The difference is you own the backup, so you can carry it out and evidence it.

One thing to be precise about, because overclaiming here would be worse than useless: the memory database is plain SQLite and InnerZero does not encrypt it at the application level. Protection at rest comes from your operating system's disk encryption: BitLocker on Windows, FileVault on macOS, LUKS on Linux. Turn it on. The app-level encryption InnerZero does apply covers stored API keys and bot tokens, not the conversation store.

## What does keeping conversations on your own server not do?

It does not make you compliant, and it does not remove a single controller duty. You still decide why and how personal data is used, so everything following from that decision stays with you. Self-hosting changes who else is involved, not who is responsible.

What remains, in plain terms:

- A lawful basis, and a privacy notice that honestly describes what the assistant does with what people tell it.
- A record of what you process and why, kept current rather than written once.
- Security of the machine: disk encryption, screen lock, separate accounts, patching, and a plan for a lost laptop.
- Retention you actually apply, rather than a folder that quietly grows for six years.
- The ability to find and produce a person's data on request, which gets harder as chat history sprawls.
- A risk assessment where the processing is higher risk, for example special category data or anything at scale.
- Staff behaviour. A local model does not stop someone pasting a whole client file into a prompt.

Cloud mode deserves its own line. InnerZero's cloud path is optional, off by default and clearly labelled, and turning it on sends that traffic to a third party, so the processor questions return for it. A cloud request carries the current prompt with assembled context; the memory database, your files and prior conversation history are not sent. The prompt itself can still contain personal data, so treat it as a disclosure. For a middle position, [the privacy blacklist that scrubs terms before a cloud request](/blog/privacy-blacklist-explained) redacts names and identifiers on the way out and restores them locally.

InnerZero is free to download and runs on hardware you already own, so you can try the offline test before writing a line of policy. For the wider trade-offs, [local AI versus cloud AI](/blog/local-ai-vs-cloud-ai) covers the rest.

## Frequently asked questions

### Is InnerZero a GDPR compliant chatbot?

No software can be, including this one. Compliance describes how your organisation handles personal data across people, process and technology, not something that ships inside an installer. What local mode does is remove the third-party processor from the chat path, which removes several workstreams. The controller duties stay where they were. Confirm your own position with a qualified adviser rather than with a product page.

### Does InnerZero act as a data processor for my conversations?

In local mode, no. The response is generated on your machine, the history is written to your disk, and the desktop app sends no telemetry. We are the software supplier, not a handler of your chat content. InnerZero is registered with the ICO under registration ZC122497 and trades as Company No. 16448945, and we do hold personal data for website accounts and optional cloud plans, as the privacy policy describes. Your local conversations are not part of that.

### Where exactly are my conversations stored?

In a SQLite database file inside your user data folder on the machine running InnerZero. You can open it, back it up, copy it elsewhere or delete it. There is no server-side copy and no sync. Because it is plain SQLite rather than an app-encrypted store, whole-disk encryption is what protects it if the hardware is lost or stolen.

### Does this reasoning apply to UK GDPR as well as the EU version?

The shape described here is common to both. Each treats the organisation deciding why and how data is used as the controller, and each adds obligations when another organisation handles that data on your behalf. Which applies to you depends on where your organisation operates and where the people whose data you hold are, so confirm rather than assume.

### Can a small team share one machine instead of installing it on every laptop?

Partly. InnerZero is a desktop app, so each person runs their own copy, but the model can live on a single machine in the office and be reached across your network. That concentrates the expensive hardware in one place while keeping every request internal. Conversation memory still lives with each install, which is usually the separation you want when different people handle different clients.
