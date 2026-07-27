<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale (RAG definitions, model families, vendor capabilities)
- [ ] Confirm the original RAG paper citation is correct (Lewis et al., 2020, arXiv:2005.11401)
- [ ] Re-check that InnerZero's project/document and knowledge-pack descriptions still match what ships
- [ ] Confirm the listed local model families (Qwen3, Gemma3) and runtimes (Ollama, LM Studio, llama.cpp) are current
- [ ] Make sure no retrieval internals (thresholds, decay, scoring) have leaked into the copy
-->
---
title: "What Is RAG? Retrieval Augmented Generation, Explained Simply"
description: "What is RAG? A plain explanation of retrieval augmented generation, how it differs from memory and fine-tuning, and why local RAG keeps your documents private."
date: "2026-10-23"
author: "Louie Summers"
authorRole: "Founder"
slug: "what-is-rag-local-ai"
tags: ["local ai", "memory", "guide"]
readingTime: "9 min read"
featured: false
---

If you have spent any time reading about AI tools, you have probably run into the term RAG. So what is RAG? Retrieval augmented generation is a method for giving a language model the right pieces of your own documents at the moment it answers a question, instead of expecting the model to already know everything. The model retrieves relevant chunks of text first, then generates a reply grounded in those chunks. It sounds technical, but the idea is simple, and it is one of the most useful patterns for working with your own files privately on your own machine.

> **Quick summary**
> - RAG (retrieval augmented generation) finds relevant snippets from your documents and hands them to the model alongside your question.
> - The model answers using those snippets, so it can talk about files it was never trained on.
> - RAG is not the same as long-term memory (facts about you over time) or fine-tuning (changing the model's weights).
> - Local RAG keeps the documents, the search index, and the answer all on your device.
> - In InnerZero, projects and knowledge packs use this pattern so the assistant can answer from your own material without uploading it anywhere.

## What is RAG in plain terms?

RAG is a way to let a language model answer questions about text it has never seen before. When you ask something, the system searches a collection of your documents, pulls out the few passages most relevant to your question, and pastes those passages into the prompt the model receives. The model then writes its answer based on what it just read, rather than relying on what it learned during training.

The name spells out the two steps. "Retrieval" is the search step: finding the right chunks of text. "Augmented generation" is the answer step: the model generates a response, augmented by the retrieved material. The technique was introduced by Patrick Lewis and colleagues at Facebook AI Research in their 2020 paper "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" ([Lewis et al., 2020, arXiv:2005.11401](https://arxiv.org/abs/2005.11401)). It has since become a standard pattern for grounding AI answers in specific source material.

## How does RAG actually work, step by step?

RAG works in two phases: a one-time indexing phase, then a retrieval-and-answer phase that repeats for every question. Indexing happens when you add documents. Retrieval happens when you ask.

During indexing, each document is split into smaller pieces, and each piece becomes a list of numbers called an embedding that captures its meaning, so passages about similar topics end up close together mathematically. The embeddings are stored in a database for fast searching.

When you ask a question, the system embeds it too, then finds the stored chunks whose embeddings are closest. Those are the passages most likely to be relevant. They go into the prompt next to your question, and the model reads both before writing its answer. Here is the same flow as a sequence:

| Step | What happens | When it runs |
|---|---|---|
| Split | Documents are broken into chunks | Once, when you add files |
| Embed | Each chunk becomes a numeric embedding | Once, when you add files |
| Store | Embeddings go into a searchable index | Once, when you add files |
| Match | Your question is embedded and compared to stored chunks | Every question |
| Augment | The closest chunks are added to the prompt | Every question |
| Generate | The model answers using the retrieved chunks | Every question |

The retrieval step is the part that varies between products, and the specifics of how chunks are scored and selected are where each tool makes its own engineering choices. The user-visible result is the same idea everywhere: the model answers from your material rather than guessing.

## How is RAG different from long-term memory?

RAG retrieves from documents you supplied; long-term memory stores facts the assistant learned about you over time. They solve different problems, and a good assistant uses both. Confusing the two is the most common mistake people make when they first read about either.

RAG is about reference material. You point it at a folder of PDFs, a set of notes, or a knowledge base, and it answers questions grounded in that text. It does not care who you are; it cares what your documents say. Long-term memory is about you specifically: your name, your preferences, the project you mentioned last week, the way you like answers formatted. That kind of memory is built up from your conversations and recalled later, which I cover in [AI that remembers your conversations](/blog/ai-that-remembers) and in more depth in [why your AI should remember you](/blog/why-your-ai-should-remember-you).

A practical way to tell them apart: if the answer should come from a file you uploaded, that is RAG. If the answer should reflect something you told the assistant in an earlier chat, that is memory. InnerZero runs both layers locally, so the assistant can pull a fact from a contract you added and also remember that you prefer concise replies.

## How is RAG different from fine-tuning?

RAG adds information at answer time without changing the model; fine-tuning changes the model's internal weights through additional training. RAG is the lighter, more flexible option for most people, and it keeps your data separate from the model.

Fine-tuning bakes knowledge or behaviour into the model by training it further on new examples. It can teach a consistent style or a narrow task, but it is slow, needs technical setup, and means retraining whenever your source documents change. RAG instead keeps your documents in a separate index the model reads from on demand. Add a file and it is searchable at once; delete it and it stops appearing in answers. Nothing is absorbed into the model, and for sensitive material that separation matters. Here is the contrast at a glance:

| Aspect | RAG | Fine-tuning |
|---|---|---|
| What changes | The prompt the model receives | The model's weights |
| Setup effort | Low, add documents | High, training run required |
| Updating content | Instant, add or remove files | Retrain to reflect changes |
| Where your data lives | A separate searchable index | Absorbed into the model |
| Best for | Answering from your own documents | Teaching a fixed style or task |

## Why does local RAG keep your documents private?

Local RAG keeps the documents, the embeddings, the search index, and the generated answer all on your own machine. Nothing is uploaded to a third-party service, so your private files never leave your hardware. This is the core privacy advantage of running RAG on a [local AI assistant](/what-is-local-ai) rather than a cloud one.

With a typical cloud RAG service, your documents are sent to a provider, embedded on their servers, and stored in their database. That can be fine for public reference material, but it is a poor fit for contracts, medical notes, financial records, or anything you are contractually bound to keep on-premises. Local RAG removes that exposure because every step happens on your device using a local model runtime like Ollama, LM Studio, or [llama.cpp](https://github.com/ggml-org/llama.cpp), paired with a local model family such as Qwen3 or Gemma3.

In InnerZero, the embeddings and the index live in a local SQLite database in your user data directory. That file sits on your own disk, where it is protected by your operating system's disk encryption (BitLocker on Windows, FileVault on macOS, LUKS on Linux). When you keep everything local, there is no provider copy of your documents to breach, subpoena, or train on. For a wider look at how the application keeps data on-device, see [how InnerZero stays private](/blog/how-innerzero-stays-private).

## How does InnerZero use RAG?

InnerZero uses retrieval augmented generation in two user-facing places: projects with document knowledge, and offline knowledge packs. Both let the assistant answer from your own material without sending it anywhere. You add the documents; the assistant retrieves the relevant parts when you ask.

Projects let you attach files to a workspace so the assistant can reference them while you work in that context. Ask a question and it pulls the relevant passages before answering. [Knowledge packs](/blog/knowledge-packs-explained) are curated, downloadable reference collections you can search and answer from completely offline, useful when you want grounded answers on a flight or somewhere with no connection. In both cases the retrieval and the generation run on your hardware, and the source text stays on your disk.

I keep the retrieval tuning under the hood on purpose, because the specifics of chunking and scoring change as the product improves. What matters to you is the outcome: point InnerZero at your documents, ask in plain language, and get answers grounded in what those documents say.

## Frequently asked questions

### Does RAG mean the AI is trained on my documents?

No. RAG does not train the model on your documents. Your files are stored in a separate searchable index, and the model reads relevant snippets from that index at answer time. The model's underlying weights are never changed, so your documents are never absorbed into the model itself.

### Is RAG the same as a chatbot reading my uploaded file?

It is the mechanism behind that experience. When you upload a file and ask about it, a RAG-style process usually splits the file, finds the parts relevant to your question, and feeds them to the model. The difference with local RAG is that all of this happens on your device rather than on a provider's servers.

### Can RAG work without an internet connection?

Yes, when both the retrieval and the model run locally. If your embeddings, index, and language model are all on your machine, you can search your documents and get grounded answers fully offline. InnerZero's offline knowledge packs are built around exactly this case, so reference answers keep working with no connection.

### What kinds of documents work well with RAG?

Text-heavy documents work best: notes, reports, manuals, contracts, research papers, and knowledge bases. RAG shines when the answer lives in a specific passage somewhere in a large pile of text that would be impractical to read through manually. It is less suited to questions that require reasoning across an entire document set at once rather than locating relevant passages.

### Do I still need long-term memory if I have RAG?

Usually yes, because they cover different needs. RAG answers from documents you provide, while long-term memory recalls facts about you and your past conversations. An assistant that pairs both can ground an answer in your files and also tailor it to your preferences, which is why InnerZero runs both layers locally side by side.

If you want a private assistant that answers from your own documents without uploading them anywhere, [download InnerZero](/download) and add a project or a knowledge pack. The retrieval, the index, and the model all run on your machine, so your reference material stays yours.
