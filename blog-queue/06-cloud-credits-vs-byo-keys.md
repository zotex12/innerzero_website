<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale (managed plan prices, BYO provider rates)
- [ ] Check InnerZero's current managed plan tiers at /pricing
- [ ] Re-check each provider's current per-million-token pricing
- [ ] Update the break-even maths if any prices have shifted
- [ ] Confirm the list of 7 supported BYO providers still matches what ships
-->
---
title: "Cloud Credits vs BYO Keys: Real Cost Breakdown Across Providers"
description: "Managed cloud plans vs your own API keys for AI usage. Which saves money, which saves hassle, and the break-even points for each of the 7 supported providers."
date: "PUBLISH_DATE_PLACEHOLDER"
author: "Louie"
authorRole: "Founder"
slug: "cloud-credits-vs-byo-keys"
tags: ["cloud ai", "pricing", "comparison"]
readingTime: "8 min read"
featured: false
---

The question I get most after "is InnerZero actually free" is **should I use cloud credits or bring my own keys?** Both paths let you use frontier AI models for tasks where local isn't enough. The maths is different for each. Here's the breakdown with actual numbers.

Short answer: if you're a light user (handful of messages per day), BYO is almost always cheaper. If you want one monthly bill across multiple providers without managing keys, managed cloud is worth the convenience tax. There's a clear break-even point per provider.

> **Quick summary**
> - BYO keys are cheaper if you use one provider regularly and light-to-moderate volume
> - Managed cloud saves hassle if you want access to multiple providers without key management
> - Break-even depends on volume, typically 100 to 500 messages per month per provider
> - Local is still free, and handles 80%+ of most people's AI needs

## How do BYO keys work in InnerZero?

**You get an API key from a provider (Anthropic, OpenAI, Google, DeepSeek, Qwen, xAI, or Kimi), paste it into InnerZero's Settings, and use it directly.** InnerZero encrypts the key on your machine. Calls go straight to the provider. You pay the provider their standard per-token rate. InnerZero takes no cut.

The seven currently supported BYO providers:

- **Anthropic** (Claude Opus 4.7, Sonnet 4.6, Haiku 4.5)
- **OpenAI** (GPT-5.4 family, GPT-4.1 family, o3, o4-mini)
- **Google** (Gemini 2.5 Pro, Gemini 2.5 Flash)
- **DeepSeek** (V3.2, R1)
- **Qwen / Alibaba** (Qwen Max, Plus, Turbo, Coder Plus)
- **xAI** (Grok 4.20, Grok 4, Grok 3)
- **Kimi / Moonshot** (K2.5)

Each provider has their own pricing. The cheapest (DeepSeek, Kimi, Gemini Flash) run pennies per million tokens. The priciest (Opus 4.7, Grok 4.20 Reasoning) are around $5 per million input tokens.

## How do managed cloud plans work?

**You pay InnerZero a monthly subscription and get a pool of credits that work across multiple cloud providers without managing keys yourself.** The current plans start at £9.99/month and go up based on included credit volume. The provider routing happens behind the scenes.

What you get for the monthly fee:

- Access to a curated set of frontier models (Claude, GPT, DeepSeek, others)
- No key management, no multiple billing relationships
- InnerZero handles model routing based on task (fast models for simple queries, frontier for complex ones)
- One monthly bill instead of five separate invoices from different providers
- A credit balance you can see in the app

For full current pricing and plan details, check the [pricing page](/pricing). The summary: if you want "just give me cloud AI when I need it" without shopping for keys, managed cloud is simpler.

## What does a typical AI message actually cost?

**A typical back-and-forth sends roughly 500 to 1,500 input tokens and gets 200 to 600 output tokens back.** Cost per message depends heavily on which model and how long your conversation history is. Here's the rough math for representative models at current provider pricing.

| Model | Input $/M | Output $/M | Cost per typical message |
|-------|-----------|------------|--------------------------|
| Claude Opus 4.7 | $5.00 | $25.00 | $0.01 to $0.02 |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.005 to $0.012 |
| GPT-5.4 | $2.50 | $15.00 | $0.004 to $0.010 |
| GPT-5.4 Mini | $0.25 | $1.00 | $0.0005 to $0.001 |
| Gemini 2.5 Pro | $1.25 | $10.00 | $0.003 to $0.008 |
| Gemini 2.5 Flash | $0.30 | $2.50 | $0.001 to $0.002 |
| DeepSeek V3.2 | $0.28 | $0.42 | $0.0003 to $0.0006 |
| Kimi K2.5 | $0.60 | $2.50 | $0.001 to $0.003 |

Coding agent tasks cost more because the prompts include file context (often several thousand input tokens) and produce longer outputs. Figure roughly 2 to 5x a chat message depending on how much code is involved.

## What's the break-even point between BYO and managed cloud?

**Roughly 100 to 500 messages per month, depending on which model and which plan.** Below that, BYO is almost always cheaper because you're paying pennies per message directly. Above that, managed cloud's flat fee becomes competitive and the convenience often wins.

Worked example. Claude Opus 4.7 at $0.015 per average message. If you send 500 Opus messages in a month, that's $7.50. You'd need to send 660+ messages at that price to match a £9.99/month managed plan that includes Opus access. If half your messages go to cheaper models (Sonnet, Haiku, or others), the break-even shifts further up.

Another example. DeepSeek V3.2 at $0.0005 per average message. Even at 2,000 messages a month, that's $1. BYO wins decisively for anyone using DeepSeek as their primary cloud model.

## Which approach is cheaper if I only use one cloud provider?

**BYO is almost always cheaper when you stick to one provider.** You avoid the convenience tax of the managed subscription and only pay for actual usage. Setup is a one-time 5 minutes.

This is the right choice if you:

- Have a strong preference for one provider (e.g. always Claude, always GPT)
- Already have an account with that provider for other reasons
- Know your monthly volume roughly and it's under the break-even point
- Want to see exactly what your AI usage costs you each month in one place

## Which approach is better if I want access to multiple providers?

**Managed cloud usually wins if you want to switch between three or more providers.** Setting up and maintaining five separate billing relationships is meaningful overhead. One plan, one bill, one balance, is worth the markup for most people in this situation.

This is the right choice if you:

- Want to experiment across providers without five separate setups
- Value "I don't have to think about this" over saving a few quid
- Use cloud AI occasionally rather than heavily
- Want the model router to pick appropriate providers per task automatically

## Is local still cheaper than both?

**Yes, by a wide margin, once you've covered hardware.** Free messages per day, per month, per year. Your electricity bill goes up a tiny amount. That's it.

The catch is hardware. A local-AI-capable PC costs anywhere from £800 (basic tier with modest GPU) to £3,000+ (enthusiast tier with RTX 4090 or similar). If you already have the hardware, local is essentially free. If you don't, the economics of buying a PC just to save on cloud AI don't work for light users.

The honest answer for most people: use local for the bulk of your AI work, BYO keys for the handful of hard tasks where frontier models matter. That combination minimises both cost and hassle.

## Comparison table: BYO vs managed vs local

| Aspect | BYO keys | Managed cloud | Local |
|--------|----------|---------------|-------|
| Upfront cost | £0 | £9.99+/month | Hardware |
| Per-message cost | Direct provider rate | Included in plan | ~£0 |
| Multi-provider access | Setup per provider | Bundled | N/A |
| Key management | You manage | Not needed | N/A |
| Billing | Per provider | One bill | None |
| Best for | One-provider users | Multi-provider casual users | Default workflow |
| Privacy | Provider sees your data | Provider sees your data | Data stays on your PC |

## Frequently asked questions

### Does InnerZero mark up BYO usage?

No. Zero markup. When you use BYO keys, you pay the provider exactly what they charge. InnerZero doesn't insert itself between you and the API. The only way InnerZero makes money from BYO users is voluntary (the Founder lifetime pass, or upgrading to a managed plan later).

### Can I use both BYO and managed cloud at the same time?

Yes. You can have a managed cloud subscription and also add your own Anthropic key for specific use cases. InnerZero lets you set separate preferences for the main chat and the coding specialist, so you could use managed cloud for chat and your own Anthropic key for coding, or any other combination.

### What happens if my BYO credits run out mid-message?

The API call fails with a credits-exhausted error. InnerZero catches this and falls back to local AI for that message so the conversation doesn't dead-end. You get a small notice explaining what happened. Top up with the provider and the next message works normally.

### Is managed cloud more private than BYO?

No, both route your prompts to the underlying AI providers. The privacy story is the same: your prompts go to Anthropic, OpenAI, or whoever you're using. InnerZero doesn't store prompt content in either case. If privacy is a hard requirement, local mode is the answer.

### How do I see how much I'm spending?

InnerZero logs every cloud API call to a local Costs page. You can see per-provider spend, per-day breakdowns, currency conversion, and more. This works for both BYO and managed plans. No accounts-receivable guesswork.

## Try it yourself

[Download InnerZero](/download) for Windows, macOS, or Linux. Start with local mode (free forever), add BYO keys if you want frontier access for specific tasks, switch to managed cloud if you want the one-bill experience. [Claude Opus 4.7 via BYO keys](/blog/claude-opus-4-7-byo-keys) covers the setup flow if you want a concrete walkthrough, and [local AI vs cloud AI](/blog/local-ai-vs-cloud-ai) is the bigger picture view.
