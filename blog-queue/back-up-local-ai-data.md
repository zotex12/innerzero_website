---
title: "How to Back Up Your Local AI Data and Move It to a New PC"
description: "Back up your local AI memory, settings, and prompts, then move everything to a new PC. What to copy, where it lives, and how to keep backups encrypted."
date: "2026-12-01"
author: "Louie Summers"
authorRole: "Founder"
slug: "back-up-local-ai-data"
tags: ["local ai", "memory", "privacy", "guide"]
readingTime: "9 min read"
featured: false
---

> **Quick summary**
> - Your InnerZero data is a set of plain files on your own disk, so backing it up is mostly a copy-paste job, no export tool required.
> - Back up three things: the memory database (a SQLite file), your settings and prompts, and any documents or knowledge packs you added.
> - To move to a new PC, install InnerZero there, copy your data folder across, then re-download the local models.
> - Keep the backup on an encrypted drive, because the memory database is not app-encrypted; it relies on OS disk encryption.
> - Local model files (Qwen3, Gemma3, gpt-oss) are large and re-downloadable, so you usually do not need to back them up.

Because InnerZero runs entirely on your machine, the data it builds over weeks of conversations is yours to copy, move, and archive. There is no account to migrate and no cloud sync to untangle. The flip side is that nobody is backing it up for you. If your laptop dies, the memory the assistant learned about you goes with the old disk unless you copied it first. This guide covers what to back up, how to move it, and how to keep the backup private.

## What local AI data should I actually back up?

Back up three categories: your memory database, your settings and prompts, and any content you added (uploaded documents, knowledge packs, exported artifacts). These files took time to build and cannot be re-downloaded. Everything else, including the model files, can be fetched again on a fresh install.

The most valuable item is the memory database. InnerZero builds [structured, persistent memory](/blog/ai-that-remembers) across your sessions and stores it in a local SQLite database file. That single file holds the facts, preferences, and context the assistant has accumulated. Lose it and the assistant starts from zero on the new PC, even though it still works fine.

Your settings and Prompt Library come next. Settings cover the AI personality you configured, which tools you enabled or disabled, your voice choices, theme, and interface language. The Prompt Library holds the reusable prompts you saved. Both are small and quick to copy.

The third category is content you brought in: documents you uploaded for Q&A, knowledge packs you installed, and artifacts you exported to PDF, Word, or Markdown. Knowledge packs are re-downloadable, but copying them saves bandwidth if they are large.

## Where does InnerZero store its data on my PC?

InnerZero keeps its data in a per-user application data folder, the standard location each operating system uses for installed apps. On Windows that lives under your user profile in AppData, on macOS under Library/Application Support, and on Linux under your home config directory. The memory database, settings, and Prompt Library all sit inside that one parent folder.

The simplest way to find the exact path is inside the app itself. InnerZero shows where it saves files in its settings, so you do not have to guess at hidden folders. Open settings, look for the data or storage location, and you have your backup source folder. For more on how the app keeps that data on-device, see how [InnerZero stays private](/blog/how-innerzero-stays-private).

Once you know the folder, backing up is a plain file copy. Close InnerZero first so the SQLite database is not mid-write, then copy the whole data folder to your backup destination. Copying a database mid-write can produce a corrupt snapshot, so quitting first is the one step people skip and regret.

Here is what sits in that folder and whether each item is worth backing up.

| Item | What it is | Back it up? | Re-downloadable? |
|---|---|---|---|
| Memory database | SQLite file of learned facts and context | Yes, top priority | No |
| Settings | Personality, tools, voice, theme, language | Yes | No |
| Prompt Library | Your saved reusable prompts | Yes | No |
| Uploaded documents | Files you added for Q&A | Yes | Only if you kept originals |
| Knowledge packs | Offline reference bundles | Optional | Yes |
| Artifacts | Exported PDF/Word/Markdown files | Optional | No, but already saved elsewhere |
| Local models | Qwen3, Gemma3, gpt-oss weights | No need | Yes |

## How do I move my local AI data to a new PC?

Install InnerZero on the new PC first, let it finish its first launch, then quit it and replace its fresh data folder with your backed-up one. Order matters: installing first creates the correct folder structure and registers the app, and copying your data in afterwards overwrites the empty defaults with your real memory and settings.

Here is the full sequence:

1. On the old PC, close InnerZero and copy its data folder to an external drive or a temporary location.
2. On the new PC, download and install InnerZero from the [download page](/download), then launch it once so it creates its own data folder.
3. Quit InnerZero on the new PC completely.
4. Copy your backed-up files into the new PC's data folder, replacing the empty ones it just created.
5. Reopen InnerZero. Your memory, settings, and prompts should all be present.
6. Let the app download a local model, or point it at one you already have. The hardware-aware setup picks a sensible model for the new machine on first launch.

You do not copy the model weights across because they are tied to your local engine (Ollama, LM Studio, or your own llama.cpp server) and are often several gigabytes each. Re-downloading on the new PC is faster and cleaner than copying, and if the new machine has different hardware you may want a different model size, which the first-launch setup handles. For a clean setup from scratch, our guide to [running AI on your PC](/blog/run-ai-on-your-pc) covers the install and first model.

## Do I need to back up the AI model files too?

No, in almost all cases you should skip the model files. The local model families InnerZero uses (Qwen3, Gemma3, gpt-oss) are public weights the app re-downloads on demand. Copying many gigabytes to your backup drive wastes space when the same files are a quick fetch away on the new machine.

There are two exceptions. On a slow or metered connection, copying the models saves a long download. And if you used a custom GGUF model through llama.cpp that is hard to source again, keep a copy of that file. For the standard managed Ollama setup, let the new install pull what it needs.

This is the practical upside of [local-first AI](/what-is-local-ai): the parts that are big and generic (the models) are disposable and replaceable, while the parts that are small and personal (your memory and settings) are the only things you actually have to protect.

## How do I keep my AI backup private and encrypted?

Store the backup on an encrypted drive, because the memory database is a plain SQLite file protected by your operating system's disk encryption, not by encryption inside the app. On the live machine that protection comes from BitLocker on Windows, FileVault on macOS, or LUKS on Linux. The moment you copy that file to a USB stick or an unencrypted external drive, it loses that protection and becomes readable by anyone who picks up the drive.

So the rule is simple: encrypt the destination. Turn on BitLocker To Go for a Windows USB drive, use an encrypted disk image or APFS encryption on macOS, or a LUKS volume on Linux. If you back up to cloud storage, use a provider that encrypts at rest and ideally wrap the folder in your own encrypted archive first. The backup should be at least as protected as the original.

One clarification: the app-level encryption InnerZero does apply (using Fernet) covers your bring-your-own cloud API keys and any Telegram bot token, not the memory database. Those secrets stay encrypted even inside the data folder. The conversational memory itself is not individually encrypted, which is why the encrypted backup drive matters. None of this involves the cloud unless you opt in, and even then only the current prompt and its assembled context are sent, never the full memory database or your file history.

One last habit makes restores reliable: test one. Every few months, copy your backup into a spare folder and confirm the database opens and the memory is intact. A backup you have never restored is a guess, not a safety net.

## Frequently asked questions

### Can I back up InnerZero memory without quitting the app?

It is safer to quit first. The memory is a SQLite database, and copying it while the app is writing to it can capture a half-written, corrupt snapshot. Closing InnerZero for the few seconds the copy takes removes that risk entirely.

### Will my conversation history and learned facts survive the move to a new PC?

Yes, as long as you copy the memory database file across. That single SQLite file holds the structured memory InnerZero built about you, so moving it to the new machine's data folder brings your history and learned context with it.

### Do I lose my settings if I only copy the memory database?

Yes, settings and the Prompt Library live in separate files from the memory database. If you copy only the database, your personality config, enabled tools, voice, theme, and saved prompts will not carry over. Copy the whole data folder rather than cherry-picking, and everything moves together.

### Is moving InnerZero to a new PC allowed on the free download?

Yes. The desktop app is free to download with no account required, and there is no per-device activation to fight with. You can install it on the new PC and copy your data across without any licence transfer step. Optional paid plans like InnerZero Pro or a Business Licence are tied to your subscription, not to a specific machine.

### What happens to my BYO API keys when I migrate?

They move with the data folder, and they stay encrypted. InnerZero stores bring-your-own cloud API keys and any Telegram bot token with app-level Fernet encryption, so those secrets travel inside the backup in encrypted form. After the move, confirm in settings that your keys work, and rotate any key you are unsure about.

### Can I keep using my old PC's models on the new one?

You can, but it is rarely worth it. Model weights are large and tied to your local engine, so let the new install pull what it needs. Only copy a model file manually if it is a custom GGUF you cannot easily source again or if you are on a slow connection where the download is painful.


