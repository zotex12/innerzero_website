---
title: "The Best Private AI Assistant for Teachers"
description: "Private AI for teachers that runs on your laptop for lesson planning, marking drafts, and differentiation without uploading student names or work to the cloud."
date: "2026-12-04"
author: "Louie"
authorRole: "Founder"
slug: "private-ai-for-teachers"
tags: ["privacy", "local ai", "guide"]
readingTime: "9 min read"
featured: false
---

If you teach, you already use AI for the boring half of the job: turning a topic into a lesson, scaffolding a worksheet three ways, and getting through the marking before midnight. The catch is that most AI tools want your typing on their servers, and a teacher's typing includes pupil names, SEND details, and safeguarding context, the data your school is legally responsible for protecting. The best private AI assistant for teachers solves the conflict by running on your own laptop, so lesson planning and marking drafts happen locally and nothing about a named child is uploaded.

This post is for classroom teachers, heads of department, and SENCOs in the UK, though the logic applies wherever you teach. I built InnerZero to be the assistant you can use for real schoolwork without creating a quiet data breach.

> **Quick summary**
> - A private AI assistant for teachers runs locally, so lesson plans, marking, and differentiation never leave your laptop
> - InnerZero is free to download, needs no account, and works offline once a model is installed
> - Keeping pupil names and work off the cloud is the cleanest way to meet your school's UK GDPR duties
> - Cloud models are optional and off by default; when on, only your current prompt and context are sent, never your saved history
> - Strip identifying details before any cloud use, and check your school's own AI and data policy first

## Is it safe to use AI for lesson planning with pupil data?

It is safe when the AI runs on your own device and the pupil data never leaves it. The risk in tools like the free web version of ChatGPT is not that the model is malicious; it is that whatever you paste travels to a third-party server your school has not vetted or signed an agreement with.

Under UK GDPR and the Data Protection Act 2018, your school is the data controller for pupil information, and you process it on the school's behalf every time you draft a report or a behaviour log. Pasting a named pupil's details into a cloud tool is a disclosure to an unapproved processor, the same problem lawyers and clinicians face. I covered that pattern in this guide to [offline AI for sensitive and regulated work](/blog/offline-ai-for-sensitive-work).

With InnerZero in local mode, the model loads on your laptop through Ollama or LM Studio, reads only the files you choose, and answers on the same machine. No upload, no account, no telemetry. That is what lets you use a pupil's actual writing sample for a marking draft without a second thought.

## How can teachers use local AI for marking drafts without uploading student work?

Load the student's work into the on-device document Q&A, ask for a marking draft against your criteria, and the file contents stay on your laptop the whole time. You read the draft, correct its judgement, and write the real feedback yourself.

In practice: drop a pupil's essay (PDF, Word, or a photo of handwriting, which InnerZero reads with on-device text recognition) into the chat, paste your mark scheme, and ask for strengths, gaps, and two next steps in your feedback format. Because the text recognition and the model both run locally, the essay never touches a server. The assistant drafts comments for you to verify, not grades to award.

A few habits keep this defensible. Anonymise where you can, so "Pupil A" rather than a full name, especially if you ever switch on a cloud model. Keep your laptop disk encrypted with BitLocker on Windows or FileVault on macOS, which protects the files at rest. And remember the AI can misjudge tone or miss context, so its draft starts your work, never ends it.

## How does InnerZero handle differentiation for mixed-ability classes?

InnerZero takes one resource and produces tiered versions of it on your machine, the slow part of differentiation that eats your evenings. Give it a worksheet, a reading passage, or a set of questions, and ask for a supported version, a core version, and a stretch version, plus a sentence-starter scaffold.

The same approach covers the planning you never finish: a model answer at three reading ages, a vocabulary list with child-friendly definitions, or comprehension questions graded from recall to evaluation. Because it remembers context across sessions, you can tell it once that your Year 9 set has several EAL pupils and a few working above target, and it keeps that framing next week, stored locally, not in a vendor's database.

When a draft is ready, the artifacts panel exports it to PDF, Word, or Markdown so it drops into your planning folder, as this walkthrough of [exporting AI responses to documents](/blog/export-ai-responses-to-documents) shows. For lesson planning, that export step turns a chat into a worksheet you can print on Monday.

## What are a school's data-protection duties when teachers use AI?

Your school is the data controller for pupil personal data, which means it must know where that data goes, have a lawful basis for processing it, and avoid sending it to unapproved third parties. The Department for Education's guidance on generative AI is clear that pupil data should not be entered into tools that lack appropriate protection, and that schools remain accountable for any data they put in.

A short checklist before any teacher uses AI on real pupil information:

- Check the school's own AI and data-protection policy, and ask the data protection officer if there is not one yet
- Confirm whether a tool sends data off-device at all, because a local tool sidesteps most of the questions
- Avoid entering names, SEND or EHCP details, safeguarding notes, or anything special-category into a cloud service without an agreement in place
- Keep school devices encrypted and access-controlled, since that is the safeguard that holds up under scrutiny

There is more in this explainer on [how InnerZero keeps your data private](/blog/how-innerzero-stays-private). None of this is legal advice, and a class teacher should not make the policy call alone.

## Cloud AI versus local AI for teachers: which fits school data rules?

Local AI fits school data rules more cleanly because pupil information never leaves your device, while cloud AI puts that responsibility on a vendor your school may not have approved. The table maps the difference onto the tasks teachers do.

| Teaching task | Local AI (InnerZero on your laptop) | Free cloud AI (typical web chatbot) |
|---|---|---|
| Lesson planning with no pupil data | Fully private, works offline | Generally fine, content still leaves device |
| Marking a named pupil's work | Stays on your machine | Sends the work to a third-party server |
| Writing reports with SEND detail | Local, no disclosure | High-risk disclosure of special-category data |
| Differentiating a worksheet | Local, exports to Word or PDF | Works, but drafts sit on vendor servers |
| Who is accountable for the data | You and your school, on your kit | You, but the data is on someone else's kit |
| Cost | Free to download, no account | Free tier, often trains on your inputs |

Cloud AI is not useless for teachers. For generic tasks with zero pupil data, a quiz on the water cycle or a starter activity, the frontier cloud models are strong and convenient. InnerZero supports optional cloud mode through your own provider keys at no markup, or a managed plan from £9.99 per month, and even then it sends only your current prompt and context, never your saved memory or files. Cloud mode is off by default, and a privacy blacklist can scrub sensitive terms first. The rule of thumb stays simple: anything with a real pupil in it belongs on the local model.

## Frequently asked questions

### Does InnerZero need an internet connection to plan lessons?

No. Once you have installed a local model on first launch, lesson planning, marking drafts, differentiation, and document Q&A all run offline, so you can plan on a train or in a classroom with patchy wifi. An internet connection is only needed for optional cloud mode or to download a model or knowledge pack. For the background on local-first tools, the [what is local AI](/what-is-local-ai) pillar covers it.

### Can I use InnerZero on a school-managed laptop?

In most cases yes, though it depends on your school's device policy and what your IT team allows you to install. InnerZero runs on Windows 10 and 11, macOS 14 or later on Apple Silicon, and 64-bit Linux. For school-wide or commercial deployment, a Business Licence is the right route at £19.99 per seat per month or £129.99 per seat per year, giving your IT and data protection officer a single tool to assess.

### Is using AI to mark allowed by exam boards and schools?

AI can draft feedback, but a qualified teacher must make the actual judgement, and policies vary by school and by exam board. Treat any AI marking as a first pass that you check and correct, never an autonomous grade. For coursework and controlled assessments, follow your exam board's rules on permitted support exactly. Local AI does not change what is allowed; it only changes where the work is processed.

### Can InnerZero mark a full class set of essays on a standard school laptop?

Yes, a class set works on a normal school laptop; you feed essays through one at a time rather than as a single batch. Each essay is read on-device and drafted against your rubric in a minute or two, so a class of thirty is realistically an evening job you start and step away from. More RAM or a GPU speeds each pass, but the gating factor is your own checking time, since every draft needs your eyes before it becomes feedback.

### How do I stop pupil names reaching the cloud by accident?

Keep cloud mode off, which is the default, and use the privacy blacklist to scrub sensitive terms if you do switch it on. The simplest discipline is to anonymise inside your prompts, using "Pupil A" instead of real names, so even a slip cannot expose an identity. For anything involving SEND, safeguarding, or special-category data, stay in local mode entirely. You can [download InnerZero](/download) and start in local-only mode without ever creating an account.


