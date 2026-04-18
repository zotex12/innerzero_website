<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale across all five vendors
- [ ] Re-verify each vendor quote against current ToS the day before publish
- [ ] Update "Last verified [date]" inline near each vendor quote
- [ ] Link to each vendor's live ToS/privacy page so readers can verify
- [ ] Check if any vendor has changed their default training behaviour in the past week
- [ ] Update the comparison table with any new vendor policy shifts
-->
---
title: "Does Your AI Train on Your Prompts? Anthropic, OpenAI, Google, DeepSeek, Kimi Compared"
description: "Plain-English audit of how each major AI provider handles your API prompts. Who trains on your data by default, who doesn't, what the fine print says."
date: "PUBLISH_DATE_PLACEHOLDER"
author: "Louie"
authorRole: "Founder"
slug: "ai-prompt-training-comparison"
tags: ["privacy", "comparison", "cloud ai"]
readingTime: "8 min read"
featured: false
---

One of the most common questions I get about InnerZero's Cloud mode is variations of the same thing. **Does your AI train on your prompts?** If I plug in my own Anthropic or OpenAI key and use it through InnerZero, where does that data actually go, and what do those providers do with it?

The answer is "it depends on the provider, the product, and whether you read the fine print." I've sat down with the current Terms of Service and privacy policies for the five providers most relevant to InnerZero users. Here's what each one actually says, in plain English, with links so you can verify.

> **Quick summary**
> - Anthropic, OpenAI, and Google do not train on API prompts by default, but their consumer products often do
> - DeepSeek's policy is less clear and varies by region and product
> - Kimi (Moonshot) has the least detailed public documentation of the five
> - Default-on vs default-off training, plus retention windows, are the two things you actually need to check
> - When in doubt, run locally. InnerZero's default mode sends nothing to any cloud provider

All dates and policy quotes in this post reflect the author's reading of each vendor's public terms at the time of writing. Last verified: PUBLISH_DATE_PLACEHOLDER.

## What does "training on your prompts" actually mean?

**It means the AI provider uses the content you send to their model (including your questions, attached files, and the model's responses) to improve future versions of their models.** That content becomes part of the training set for the next generation of the AI. Once it's in the training data, you can't pull it back out.

Two big distinctions matter:

1. **API vs consumer product.** Most providers have different defaults for developers using their API versus end users chatting through the provider's own web app. APIs usually don't train by default. Consumer apps usually do.
2. **Default on vs default off.** Some providers assume you're opted in unless you change a setting. Others assume you're opted out unless you opt in. Same outcome for users who don't read the ToS, but very different philosophy.

There's also a separate question about retention: how long the provider stores your prompts even if they don't train on them. Retention matters because stored data can be breached, subpoenaed, or repurposed later.

## Does Anthropic train on my API prompts?

**Anthropic's current policy is that API inputs and outputs are not used to train Claude models by default.** This applies to the API, Claude for Work, and similar paid business products. The consumer Claude.ai interface has different defaults.

From Anthropic's commercial terms and privacy policy:

- API prompts: **not used for training** by default
- Consumer Claude.ai chat: **may be used** depending on your account settings and region
- Retention: inputs/outputs retained for a limited period for abuse monitoring, typically 30 days

What this means for InnerZero users. If you use your own Anthropic API key with InnerZero in Cloud mode, your prompts are not feeding into training. Anthropic keeps them briefly for abuse monitoring, then deletes them. You can read the current terms at Anthropic's own documentation pages (linked from their website).

Verify here: https://www.anthropic.com/legal/commercial-terms (last verified: PUBLISH_DATE_PLACEHOLDER)

## Does OpenAI train on my API prompts?

**OpenAI has stated that API inputs and outputs are not used to train their models by default since March 2023.** This is a clear, public, long-standing policy for API usage. The consumer ChatGPT product has different defaults (opt-out possible via a settings toggle).

From OpenAI's data usage policy:

- API prompts: **not used for training** by default
- ChatGPT free and Plus: **may be used** unless you toggle training off in settings
- ChatGPT Team, Enterprise, Edu: **not used** for training
- Retention: typically 30 days for abuse monitoring, longer retention only for specific zero-retention-optout customers

What this means for InnerZero users. Same as Anthropic. BYO OpenAI key through InnerZero means your prompts aren't training material. If you use the ChatGPT web app directly outside InnerZero, check your settings.

Verify here: https://openai.com/enterprise-privacy/ (last verified: PUBLISH_DATE_PLACEHOLDER)

## Does Google train on my API prompts?

**Google's Gemini API has complex defaults that differ between paid and free tiers, and between regions.** Paid Gemini API usage (billed) is not used to train models by default. Free tier usage may be used to improve their services. Consumer Gemini app usage has separate rules.

From Google's Gemini API terms:

- Paid Gemini API: **not used for training** by default
- Free tier Gemini API: **may be used** for service improvement
- Consumer Gemini app: check the settings in your account; defaults vary
- Workspace/Enterprise Gemini: contractual data handling, typically not used for training
- Retention: varies by product and region, generally 30 to 60 days for abuse monitoring

What this means for InnerZero users. If your Google AI key is billed (paid tier), you're fine. If you're on the free tier, your prompts may feed into Google's service improvements. Worth knowing which tier your key is on.

Verify here: https://ai.google.dev/gemini-api/terms (last verified: PUBLISH_DATE_PLACEHOLDER)

## Does DeepSeek train on my API prompts?

**DeepSeek's public documentation is less specific than the Western providers.** Their current terms state prompts may be used to improve services, with some regional variation and specific enterprise options for stricter handling. The default is closer to "may train" than "will not train".

From what's publicly available:

- DeepSeek API: **may be used** to improve services per the public terms
- Enterprise deals: customisable contractual terms
- Retention: not clearly documented in public terms

What this means for InnerZero users. If privacy is a hard requirement, DeepSeek is not the right BYO choice. It's good value (DeepSeek V3.2 is genuinely strong per-dollar) but the data handling story is less clear than Anthropic or OpenAI. Use it for non-sensitive work or skip it in favour of a provider with cleaner defaults.

Verify here: https://platform.deepseek.com/downloads/DeepSeek%20Terms%20of%20Service.html (last verified: PUBLISH_DATE_PLACEHOLDER)

## Does Kimi (Moonshot) train on my API prompts?

**Kimi's public English-language documentation is limited, and the training policy for API usage isn't stated in the same detail as the Western providers.** Moonshot AI's terms imply service improvement use of prompts, but specifics are thin.

From what's publicly available:

- Kimi API: **policy unclear** from public English docs; likely used for service improvement
- Enterprise deals: available, terms negotiated per contract
- Retention: not clearly documented

What this means for InnerZero users. Same as DeepSeek, with even less clarity. If you're using Kimi for cost or capability reasons, assume the data handling is looser than the Western providers until the docs say otherwise. Read the current ToS directly at moonshot.ai and form your own view.

Verify here: https://platform.moonshot.ai/docs/agreement/user-agreement (last verified: PUBLISH_DATE_PLACEHOLDER)

## Comparison table: default training behaviour by provider

| Provider | API default | Consumer default | Retention | Clarity of docs |
|----------|-------------|------------------|-----------|-----------------|
| Anthropic (Claude) | Not used for training | May be used (settings-dependent) | ~30 days | High |
| OpenAI (GPT) | Not used for training | May be used (opt-out available) | ~30 days | High |
| Google (Gemini) | Not used on paid tier | May be used on free tier | 30 to 60 days | Moderate |
| DeepSeek | May be used | May be used | Unclear | Low |
| Kimi (Moonshot) | May be used (implied) | May be used (implied) | Unclear | Low |

This table is a summary. Check each vendor's current ToS before making decisions that matter.

## What's the safest option if I don't want any provider training on my prompts?

**Use InnerZero's default local mode, which sends nothing to any cloud provider.** Your prompts stay on your machine. The model runs on your hardware. No ToS to worry about. No retention window. No default-on training toggle to miss.

For tasks that need frontier reasoning quality beyond what local models can deliver, pick Anthropic or OpenAI with BYO keys. Both have clean no-training-by-default API policies and good clarity in their public docs. If cost matters more than data handling, Google's paid tier is a reasonable middle ground.

## Frequently asked questions

### Does InnerZero itself train on my prompts?

No. InnerZero doesn't run any model training infrastructure. It's a desktop application that either uses local models on your machine or forwards your prompts directly to the cloud provider you've configured. No intermediate server, no logging of prompt content, no training data collection on our side.

### What about the managed cloud subscription? Does that train on my prompts?

No. The managed cloud is a billing wrapper that routes your requests to the underlying providers (currently a curated set of Anthropic, OpenAI, and others). Those underlying providers honour their own no-training-by-default API terms. InnerZero doesn't retain prompt content for training or any other purpose.

### How often do these policies change?

More often than you'd think. Major providers typically update their terms every six to twelve months. A policy that was accurate a year ago may not be accurate today. Always check the source when data handling actually matters for your use case.

### Is there a way to opt out of training with cloud providers?

For API usage with Anthropic, OpenAI, and Google's paid tier, you're opted out by default. For consumer products, check the account settings. OpenAI's ChatGPT has a clear toggle. Google's Gemini app has one in Bard Activity settings. Anthropic's Claude.ai has been adjusting theirs over time.

### What's the difference between privacy mode and local mode?

Privacy modes in cloud products still send your data to the provider's servers. They just promise reduced retention or no training use. Local mode in InnerZero means the data never leaves your computer in the first place. Privacy mode is a policy promise. Local mode is a physical fact.

## Go local and stop worrying about it

If you want the question of "is my provider training on this" to be permanently settled, local is the answer. [Download InnerZero](/download) for Windows, macOS, or Linux. The default setup uses local models only. For more on the tradeoff, [local AI vs cloud AI](/blog/local-ai-vs-cloud-ai) covers the full picture, and [how InnerZero stays private](/blog/how-innerzero-stays-private) covers exactly what happens with your data on our side.
