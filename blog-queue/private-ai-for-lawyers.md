<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale (model families, local stack components, InnerZero feature set)
- [ ] Re-check the SRA and ICO source links still resolve and the cited guidance pages have not moved
- [ ] Confirm the BYO cloud provider count (7) and provider names still match what ships
- [ ] Confirm the "not legal advice" disclaimer wording is present and prominent
- [ ] Update the model examples (Qwen3, Gemma3, gpt-oss) if a newer open-weight family is the sensible default
-->
---
title: "Private AI for Lawyers and Legal Work"
description: "Private AI for lawyers keeps client files on your machine. How local AI helps with review, summarising, and drafting without sending docs to the cloud."
date: "2026-10-09"
author: "Louie Summers"
authorRole: "Founder"
slug: "private-ai-for-lawyers"
tags: ["privacy", "local ai", "features"]
readingTime: "9 min read"
featured: false
---

Private AI for lawyers solves a problem that cloud chatbots create rather than fix. Legal work runs on confidential client information and legal professional privilege, and most popular AI assistants send every prompt and document to a third-party server you do not control. Local AI flips that arrangement. The model runs on your own machine, the client files stay on disk, and nothing leaves your office network unless you decide to send it. This post explains how that works for document review, summarising, and drafting, and where the real limits sit.

One thing up front, in plain terms. This is not legal advice, and it is not regulatory or compliance advice. Every solicitor, barrister, paralegal, and in-house counsel has their own professional and regulatory obligations, and you must check what applies to you and your jurisdiction before using any AI tool on client matters. Treat the rest of this as a technical explanation of how local AI keeps data on your hardware, not as a sign-off on any particular use.

> **Quick summary**
> - Private AI for lawyers means the AI model runs locally on your computer, so client documents never leave the machine.
> - Cloud AI assistants transmit your prompts and uploaded files to a vendor's servers, which raises confidentiality and privilege questions for legal work.
> - Local AI suits document review, summarising long files, first-draft generation, and clause comparison, all without an internet round trip.
> - The trade-off is model size: a local model is smaller than a frontier cloud model, so a human lawyer still checks everything.
> - This is not legal or compliance advice. Confirm your own professional and regulatory duties before using AI on client matters.

## Why is cloud AI a problem for confidential legal work?

Cloud AI is a problem for legal work because the data leaves your control the moment you press send. When you paste a contract into a hosted chatbot or upload a bundle of documents, that content travels to the provider's servers, gets processed there, and is subject to that provider's terms, retention practices, and jurisdiction. For ordinary tasks that may be fine. For privileged client material, it introduces a third party into a relationship that is supposed to stay between you and the client.

The confidentiality duty is not optional. The Solicitors Regulation Authority Code of Conduct requires solicitors to keep the affairs of current and former clients confidential, set out in the [SRA Code of Conduct for Solicitors](https://www.sra.org.uk/solicitors/standards-regulations/code-conduct-solicitors/). Separately, where client documents contain personal data, the UK GDPR and the Data Protection Act 2018 apply, and the [Information Commissioner's Office guidance on AI and data protection](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/) sets expectations for how that data is handled. Sending privileged or personal data to an external AI vendor is a decision with real weight, not a convenience choice. Local AI removes the question by removing the transmission.

## How does private AI for lawyers actually keep documents local?

It keeps documents local by running the AI model on your own hardware instead of a remote server. The model file sits on your disk, the inference happens on your CPU or GPU, and the prompt with your document text is processed in memory on the same machine. There is no network call for the core conversation.

InnerZero is built this way by default. It runs open-weight models through [Ollama](https://ollama.com/library) or LM Studio, using model families such as Qwen3, Gemma3, and gpt-oss that are designed to run on consumer and workstation hardware. When you ask it to summarise a witness statement or compare two versions of a clause, the text goes to the local model and the answer comes back, all on your machine. You can confirm this by disconnecting from the internet: a local setup keeps answering. For the deeper architecture, see [how InnerZero stays private](/blog/how-innerzero-stays-private) and the wider case for [offline AI for sensitive work](/blog/offline-ai-for-sensitive-work).

## What legal tasks suit a local AI assistant?

Local AI suits the tasks where you need a fast, private first pass over text and a human still signs off. Document review, summarising long files, drafting first versions, and comparing clauses across documents all fit well, because they are language tasks the model can handle and a lawyer verifies before anything is relied upon.

Here is how the common tasks map to local AI strengths and the checks each one needs.

| Legal task | How local AI helps | What you still verify |
|---|---|---|
| Summarising long documents | Condenses bundles, statements, and correspondence into key points | Accuracy of every summarised fact against the source |
| First-draft drafting | Produces a starting draft of letters, clauses, or notes | Legal correctness, tone, and client-specific terms |
| Clause comparison | Highlights differences between two versions of an agreement | The legal significance of each difference |
| Issue spotting in review | Flags topics and themes across a document set | Whether flagged points are genuinely relevant |
| Plain-language explanation | Rewrites dense text into client-readable language | That nothing material is lost or distorted |
| Research note structuring | Organises your own notes into a structured outline | Citations and authority, which the model must not invent |

The pattern across every row is the same. The model accelerates the language-heavy part, and the lawyer owns the judgement. A local model will sometimes state something with confidence that is wrong, so anything that touches advice, authority, or a citation needs a human to confirm it against the actual source.

## Can a local model handle real legal documents, or is it too small?

A local model can handle the language tasks above competently, but it is smaller than a frontier cloud model, so it is a capable assistant rather than a substitute for a lawyer. Open-weight models running on a good workstation are strong at summarising, restructuring, and drafting from text you provide. They are weaker at open-ended legal reasoning and they do not know your jurisdiction's case law unless you give it to them.

The honest framing is that model size is a real trade-off, and I would rather be direct about it than oversell. A detailed comparison of the two approaches lives in [local AI versus cloud AI](/blog/local-ai-vs-cloud-ai). The practical mitigation for legal work is to feed the model the right material rather than relying on its training. InnerZero supports projects with document knowledge, so you can load the documents for a single matter and keep that context scoped to that matter. You can also build [offline knowledge packs](/blog/knowledge-packs-explained) from reference material you trust, which keeps the model grounded in sources you have chosen rather than whatever it absorbed during training. That grounding matters more for legal accuracy than raw model size does.

If a particular task genuinely needs a frontier model, InnerZero supports bring-your-own cloud keys for 7 providers (Anthropic, OpenAI, Google, DeepSeek, Qwen, xAI, Kimi) as an optional route. Using that route sends the current prompt and its context to the chosen provider, so for privileged material the local model remains the safer default and the cloud route is a deliberate, case-by-case choice.

## How is the data stored, and is it encrypted?

The data is stored on your own machine in a local SQLite database, and the practical protection is the disk encryption your operating system already provides. InnerZero does not upload your conversation history or document text. The memory database is a standard SQLite file in your user data directory, which you can inspect or back up like any other file.

Being precise about encryption matters here, because overclaiming would be worse than useless for a legal audience. The memory database itself is plain SQLite, protected by OS-level full-disk encryption such as BitLocker on Windows, FileVault on macOS, or LUKS on Linux. That is the layer that protects a stolen or lost laptop, so confirm full-disk encryption is switched on. Application-level encryption is applied only to bring-your-own cloud API keys and Telegram tokens, not to the document text or chat history. For office machines, your own data protection and security policies, plus the ICO's guidance on AI, are the reference point for what is adequate.

## Frequently asked questions

### Is private AI for lawyers a replacement for legal judgement?

No. A local AI assistant accelerates language tasks like summarising, drafting, and comparison, but it does not replace a qualified lawyer's judgement. Everything it produces, especially anything touching advice, authority, or citations, must be checked against the source by a person who is accountable for the work.

### Does InnerZero send my client documents to the cloud?

Not by default. InnerZero runs the model locally, so document text and conversations stay on your machine. The optional bring-your-own cloud route sends only the current prompt and its assembled context to a provider you choose, and only when you deliberately select that route, so privileged material should stay on the local model.

### Is this post legal or compliance advice?

No. This is a technical explanation of how local AI keeps data on your hardware. It is not legal, regulatory, or compliance advice. You must check your own professional obligations, your firm's policies, and the rules of your jurisdiction before using any AI tool on client matters.

### What hardware do I need to run local AI for legal work?

A modern machine with a capable GPU and 16GB or more of RAM runs useful open-weight models comfortably, and more VRAM lets you run larger models. InnerZero auto-detects your hardware tier and suggests a suitable model, so you do not have to tune anything by hand. You can try it by [downloading InnerZero](/download) and starting offline.

### How do I keep a local model accurate on a specific matter?

Feed it the right material rather than trusting its training. Load the documents for a matter into a scoped project, and build knowledge packs from reference sources you trust. Grounding the model in sources you have chosen reduces invented detail far more reliably than picking a bigger model alone.

### Can the model invent case law or citations?

Yes, any language model can produce plausible but fabricated citations, and this is the single most important risk for legal use. Never rely on a citation, authority, or quoted rule the model produces without confirming it against the primary source. Treat anything that looks like a reference as a prompt to go and verify, not as a finished answer. To understand the local-first model more broadly, see [what a local AI assistant is](/what-is-local-ai).