<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale (coding model names, tier assignments, approval flow)
- [ ] Refresh the list of supported coding models if new ones have been added
- [ ] Confirm the two-gate approval flow description still matches what ships
- [ ] Check if any Cursor/Copilot news in the past week warrants a reference update
- [ ] Update the "shipped in v0.1.X" references to match the current release
-->
---
title: "Why I Built a Coding Agent That Runs Offline"
description: "Cloud coding assistants leak your code to someone else's server. Here's why InnerZero's coding agent runs locally, what it does well, and what it can't do."
date: "PUBLISH_DATE_PLACEHOLDER"
author: "Louie"
authorRole: "Founder"
slug: "offline-coding-agent"
tags: ["coding agent", "innerzero", "privacy", "local ai"]
readingTime: "6 min read"
featured: false
---

I spent too many hours last year worrying about what my coding assistant was doing with my code. Not in a tinfoil-hat way. In a practical way. If I'm pasting a function from a work repo into a cloud AI, that function just left the building. The vendor might not store it. They might not train on it. But I have to trust both of those things, and the only way to check is to read a legal document written by people whose job is not to make things clear.

That's why InnerZero's **coding agent runs offline**. Not because cloud coding tools are bad. They're often excellent. But because some people, some projects, and some codebases need the answer to "where did this code just go" to be "nowhere, it stayed on my laptop."

> **Quick summary**
> - The coding agent runs on your machine using Ollama or LM Studio, no cloud required
> - It works in a sandboxed folder you grant access to, never the whole drive
> - Every file write needs your approval with a diff view
> - Cloud mode is optional if you want to route the agent through Claude, GPT, or another BYO provider

## Why would a coding agent need to run offline?

**Because your codebase is not public, and cloud AI vendors have no binding obligation to you about what happens to the content you send them.** Even when the vendor's default policy is fine, that default can change with a ToS update you never read.

The specific use cases I hear most often:

- Employees of companies whose IP policies prohibit third-party AI
- Solo founders working on anything they're not ready to show the world
- Consultants working under NDAs
- People in regulated industries like legal, medical, and finance
- People who just don't want their code scraped for training data

InnerZero isn't the only option for any of these, but it's one of the few that's built local-first from day one rather than bolted on later. Local is the default. Cloud is the opt-in. That matters for how decisions get made under the hood.

## How does InnerZero's coding agent work?

**You describe a task, the agent plans it, and nothing touches your files until you approve the diff.** The agent reads files you've granted access to, writes new code in a scratch area, shows you a unified diff, and asks before it writes anything to disk.

The flow is:

1. You give the agent a task ("refactor this module to use dependency injection")
2. The agent breaks it into steps and explains what it plans to do
3. You approve the plan (first gate)
4. The agent reads the files it needs and writes proposed changes
5. You get a diff view showing every change, every new file, every deletion
6. You approve the writes (second gate)
7. Files land on disk

Two gates means two chances for you to stop something before it happens. I've had the agent produce plans I thought were fine and then realise during the diff review that it was about to delete a function that was actually still used somewhere else. The diff review caught it.

## What models does the coding agent use?

**By default, a Qwen coder model sized to your hardware tier, loaded via Ollama.** InnerZero detects your GPU and picks a 1.5b, 7b, 14b, or 32b model depending on what you can run. LM Studio users can load any compatible coding model themselves.

The coding agent doesn't use the same model as the main chat. It hot-swaps. When you kick off a coding task, the main chat model unloads, the coding model loads, the agent runs, and then the main model reloads when you're done. This lets a machine with one GPU run two different specialist models without running out of VRAM.

If you want a frontier-tier cloud model for a specific hard task, you can configure Anthropic, OpenAI, or any of the other five supported providers as your Specialist cloud provider. The same approval gates apply. The only difference is the model reasoning runs on a remote server instead of locally.

## What can't an offline coding agent do?

**It can't match the raw reasoning quality of the latest frontier cloud model on every task.** GPT-5.4, Claude Opus 4.7, and similar frontier models have a real edge on novel architectural problems, rare languages, and deeply esoteric debugging. Local coding models are excellent for routine work. For the hardest 10 or 20 percent of tasks, cloud still wins.

It also can't browse the internet for current library docs in the same flow. Your local model's training data has a cutoff. If you need to read a just-released library changelog to solve a problem, you'll need to fetch that yourself or use a cloud provider.

And it can't pretend it has context it doesn't. A local 14b coder model is smaller than what you get from the cloud. That sometimes means shorter context windows, sometimes means worse intuition on unusual edge cases. The honest answer is: the local agent is usually enough, sometimes not, and you should know which one you're dealing with before you start the task.

## When should I use the coding agent versus the chat?

**Use the coding agent when you want multi-step code changes that touch files on disk. Use chat when you want to talk through a problem or ask questions.** The agent is for "do this work". The chat is for "help me think about this".

A rough guide:

| You want | Use |
|----------|-----|
| A second opinion on an approach | Chat |
| A specific function implemented | Chat (paste the result yourself) |
| Five files refactored to a new pattern | Coding agent |
| A new test suite added to an existing module | Coding agent |
| To understand what a confusing piece of code does | Chat |
| To apply a mechanical change across many files | Coding agent |

The coding agent's real sweet spot is the work that's boring to do by hand but needs concentration to do safely. Renaming, refactoring, test generation, boilerplate scaffolding. The things where your brain wants to check out but your code will break if you let it.

## Is the agent safe to run on my real codebase?

**Yes, because it only touches files inside the folders you grant. Everything else on your machine is invisible to it.** The sandbox is enforced at the file-access layer. The agent physically cannot read or write files outside the granted paths, no matter what its model output says.

For most users that's a single project folder. You grant access when you start a task. The grant lasts for the session and disappears after. You can revoke it mid-task if something feels wrong. There's no persistent background agent that keeps working while you're not watching.

A deeper look at the safety model across the industry is in [why every AI assistant should have a sandbox](/blog) (coming later in this series). The short version: most cloud coding agents don't have this constraint, and that's a real difference.

## Frequently asked questions

### Does the coding agent send my code anywhere?

Not by default. The local agent processes everything on your machine and no code ever leaves the computer. If you explicitly configure a cloud provider for the coding agent, then only the specific prompts and files the agent reads get sent to that provider over an encrypted connection. It's your choice per task.

### Can the agent install packages or run commands?

No. The current coding agent is read and write only, scoped to files inside the granted directories. It can't execute scripts, install dependencies, or run tests. That's by design. Expanding beyond that would break the clear safety story, and I'd rather keep it narrow and trustworthy than broad and scary.

### How do I pick which coding model the agent uses?

Open Settings, go to the Specialists section, and pick from the list of installed coding models. InnerZero suggests an appropriate model based on your hardware tier and lets you override it. You can install additional coding models from Settings without leaving the app.

### What happens if the agent produces bad code?

You review the diff and reject it. Nothing gets written. The agent doesn't cache the rejected output, it just stops. You can give it feedback and ask it to try again, or switch to a larger model for the retry.

### Can I use the coding agent without a GPU?

You can, but performance will be slow. The smallest coding models (1.5b) run on CPU but feel sluggish for real work. A modest GPU with 6GB+ VRAM makes the agent feel properly responsive. For the full hardware breakdown, [what hardware do you need to run AI locally](/blog/hardware-for-local-ai) covers the detail.

## Try the coding agent

[Download InnerZero](/download) for Windows, macOS, or Linux. The coding agent ships with the standard install. Pick a project folder, grant access, and ask it to do something useful. If you're curious how it fits into the broader feature set, [5 things you can do with InnerZero](/blog/things-you-can-do-with-innerzero) is a good overview.
