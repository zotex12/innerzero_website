<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale (privacy law references, cloud tool behaviour)
- [ ] Confirm the two linked posts are already live: /blog/local-ai-assistants-compared-2026 and /blog/how-to-choose-a-private-ai-assistant
- [ ] Confirm InnerZero still scores 7/7 (local inference, offline, local data, local history, editable memory, no account, open models)
- [ ] Confirm the ICO right-to-erasure link still resolves
- [ ] Confirm all external links go to official or authoritative sources only
-->
---
title: "The Private AI Test: Score Any AI Assistant Out of 7"
description: "A simple 7-point scorecard to test whether an AI assistant is actually private. One point per question, a clear score, and a worked example showing how InnerZero scores."
date: "2026-07-08"
author: "Louie"
authorRole: "Founder"
slug: "the-private-ai-test"
tags: ["privacy", "guide", "comparison"]
readingTime: "6 min read"
featured: false
---

Every AI assistant claims to be private. The Private AI Test is a simple way to check, by scoring any assistant out of seven. Each question is worth one point, with a clear yes or no answer. Run any tool through it, including InnerZero, and you get a number you can actually compare instead of a marketing word.

> **Quick summary**
> - The Private AI Test scores any AI assistant out of 7, one point per question.
> - It checks where the model runs, what data leaves, where history lives, memory control, accounts and tracking, open models, and true cost.
> - A score of 6 or 7 means genuinely private. A score of 3 or below means private in marketing only.
> - InnerZero scores 7 out of 7. The worked example is below so you can check it yourself.

## What is the Private AI Test?

The Private AI Test is a seven point checklist that turns a vague claim into a score you can compare. Each question has a clear yes or no answer worth one point. Add up the points and you get a privacy score from 0 to 7.

The point of a fixed scorecard is that it removes the marketing. A company can call anything "private", but it cannot fake whether the app keeps working with your internet switched off. The test measures behaviour, not branding. For the longer reasoning behind each question, see [how to choose a private AI assistant](/blog/how-to-choose-a-private-ai-assistant).

## The 7 questions

Score one point for each question you can honestly answer yes. The questions are ordered from most to least important, so a low score on the first few matters more than a low score at the end.

| # | Question | Score 1 point if |
|---|----------|------------------|
| 1 | Local inference | The model runs on your own CPU or GPU, not a remote server |
| 2 | Works offline | It keeps working with the internet switched off |
| 3 | Data stays local | Nothing is sent to a server by default |
| 4 | Local history | Your conversation history is stored in a file on your own machine |
| 5 | Editable memory | You can view, edit, and delete what it remembers |
| 6 | No account | You can install and use it without signing up or being tracked |
| 7 | Open models | You can choose and swap open weight models |

## How do you score an assistant?

You test each question yourself, which takes about five minutes. The four quickest checks tell you most of the story.

- **Pull the plug.** Turn off your internet and try to chat. If it still works, score questions 1 and 2. If it stops, the model is running in the cloud.
- **Read the settings.** Look for a connection log or network options. If you can see and switch off what it sends, score question 3.
- **Find the data.** Check where the app stores history and whether you can open or delete that file. Score questions 4 and 5 if you control it.
- **Check the sign up.** If you got in without an account and the privacy policy has no tracking, score question 6. If you can pick from open models, score question 7.

## How does InnerZero score on the Private AI Test?

InnerZero scores 7 out of 7. Here is each point, so you can verify it rather than take my word for it.

1. **Local inference.** InnerZero runs models on your own hardware through engines like [Ollama](https://ollama.com). Point scored.
2. **Works offline.** Once a model is downloaded, it runs with no internet connection. Point scored.
3. **Data stays local.** Your data stays on your device by default, and any online feature is optional. Point scored.
4. **Local history.** Conversations and memory live in a local database on your machine. Point scored.
5. **Editable memory.** You can review, edit, and delete what it [remembers](/blog/ai-that-remembers). Point scored.
6. **No account.** InnerZero needs no account to use, and the company is on the UK Information Commissioner's Office register (ZC122497). Point scored.
7. **Open models.** It runs open model families such as Qwen3 and Gemma3, which you can swap. Point scored.

For the full detail on what stays on your device, see [how InnerZero stays private](/blog/how-innerzero-stays-private).

## What does your score mean?

The score sorts assistants into three honest groups.

- **6 to 7: genuinely private.** The model runs on your hardware, your data stays with you, and you are in control. A few optional online features are fine at this level.
- **4 to 5: partly private.** Usually a local tool with one or two gaps, or a cloud tool with strong settings. Check exactly which points it failed before trusting it.
- **0 to 3: private in marketing only.** Inference and history are on someone else's servers. The privacy claim depends entirely on that company's policy, which can change.

Most cloud assistants score low here because they fail the first four questions by design. A tool that sends every message to a server cannot score points 1 to 3 no matter how good its policy reads. For more on that split, see [local AI vs cloud AI](/blog/local-ai-vs-cloud-ai), and to see where real tools land, see [local AI assistants compared](/blog/local-ai-assistants-compared-2026).

## Frequently asked questions

### What is the Private AI Test?
The Private AI Test is a seven point scorecard for checking whether an AI assistant is genuinely private. Each question covers one privacy behaviour, such as whether the model runs locally or whether you can delete your data, and is worth one point. The total gives you a score from 0 to 7 that you can compare across tools.

### What is a good privacy score for an AI assistant?
A score of 6 or 7 means the assistant is genuinely private: the model runs on your hardware and your data stays with you. A score of 4 or 5 means it is partly private with gaps worth checking. A score of 3 or below means it is private in marketing language only.

### Why do cloud AI assistants score low on the test?
Cloud assistants run the model on remote servers and store your history there, so they fail the first four questions by design. The privacy of a cloud tool depends on the company's policy rather than on you, which is exactly what the test is built to expose.

### How do I test whether an AI runs locally?
Turn off your internet and try to use it. A local assistant keeps working because inference happens on your own machine, while a cloud tool stops because it cannot reach its server. This single check covers the two most important questions on the scorecard.

### Does InnerZero really score 7 out of 7?
Yes, and you can verify each point yourself in about five minutes. InnerZero runs models locally, works offline, keeps data on your device, stores history in a local file, lets you edit its memory, needs no account, and runs swappable open models.

## Get started

[Download InnerZero](/download) for free on Windows, macOS, and Linux, then run it through the Private AI Test yourself. No account required, and setup takes about five minutes.
