---
title: "Does Your AI Assistant Record Your Microphone?"
description: "InnerZero does not record your mic in the background. It transcribes speech locally with Whisper, and only transcript text is sent in optional cloud voice."
date: "2026-11-24"
author: "Louie Summers"
authorRole: "Founder"
slug: "ai-assistant-microphone-privacy"
tags: ["voice", "privacy", "local ai", "innerzero"]
readingTime: "9 min read"
featured: false
---

> **Quick summary**
>
> - No. InnerZero does not record your microphone in the background. The mic is only active while you are actively using voice, and you control when.
> - There is no always-on wake word. You start voice deliberately (push-to-talk style), so the mic is not sitting open waiting for a trigger word.
> - Your speech is transcribed locally on your own machine with Whisper. The raw audio never leaves your computer.
> - In optional cloud voice, only the transcript text (your words) is sent, never an audio recording.
> - You can confirm all of this yourself: check the mic indicator, the offline egress guard, and the local connection log.

People worry their voice assistant is secretly recording them, and that worry is reasonable. Mainstream smart speakers keep a microphone open, listening for a wake word, and a slice of that audio travels to a company's servers. So it is fair to ask the same of a local AI assistant. This post answers it for InnerZero: when the mic is on, where the audio goes, and what ever leaves your machine.

## Does InnerZero record your microphone when you are not using it?

No. InnerZero does not record or stream your microphone in the background. The microphone is only accessed while you are actively using a voice feature, and you are the one who starts that. When you are typing, reading, or doing anything other than talking to it, the mic is not capturing audio.

This is the opposite of the "always listening" model people picture. There is no hidden buffer quietly recording your room, no continuous upload, and no audio sitting in a cloud account waiting to be reviewed. InnerZero is a desktop app that runs on your own computer, and its [voice mode](/blog/voice-mode-innerzero) is something you switch on for a conversation and switch off when you are done. The rest of the time, the assistant is just a normal app window doing nothing with your sound hardware.

If you are coming from Alexa, Siri, or Google Assistant, this is a real change in posture. Those products are designed around a microphone that stays open. InnerZero is designed around a microphone that stays closed until you ask for it.

## What is the difference between an always-listening wake word and push-to-talk?

A wake word means the microphone is always on, constantly analysing sound to detect a trigger phrase like "Alexa" or "Hey Google". Push-to-talk means the microphone only opens when you choose to start, by clicking a button or toggling voice on. InnerZero uses the deliberate, push-to-talk style: you decide when recording begins, and it ends when the exchange is over.

The distinction matters because the two models capture audio very differently. A wake-word system has to listen to everything to catch the one word it cares about, which is why those devices occasionally trigger by accident and capture conversations you never meant to share. A push-to-talk system has nothing to misfire on, because it is not listening until you tell it to.

Here is the practical difference:

| Aspect | Always-listening wake word | Push-to-talk (InnerZero) |
|---|---|---|
| Microphone state at rest | Open, continuously sampling | Closed until you start |
| What triggers capture | A spoken trigger word | Your deliberate action |
| Accidental recording risk | Real (false triggers happen) | Effectively none |
| Audio buffered in background | Yes, a rolling window | No |
| Who decides when it starts | The device's detector | You |

A local voice-activity detector runs only inside a session you have already started, so the assistant can tell when you have stopped speaking and respond. That is a different thing from a wake word: it works on audio that stays on your machine, and it is not listening until you begin.

## Where does InnerZero process your microphone audio?

On your own computer. InnerZero converts your speech to text using Whisper running locally on your hardware, so the audio is handled entirely on-device. The transcription happens in memory, the words are produced locally, and the raw audio is not written off to anyone.

This is the core of the microphone-privacy story. With a cloud voice assistant, the recording itself travels: your voice goes to a server to be turned into text. With InnerZero, the conversion from sound to words happens before anything could be sent, on the machine you are sitting at. The text-to-speech side, where the assistant speaks back, uses Kokoro and is also local.

Because both directions run locally, voice works with no internet connection once the models are installed. That is a useful tell: a feature that keeps working fully offline cannot be quietly shipping your audio somewhere. For the deeper mechanics of the local speech-to-text and text-to-speech panels, the post on [local text-to-speech and speech-to-text](/blog/local-text-to-speech-speech-to-text) walks through them.

## What actually leaves your computer when you use cloud voice?

In optional cloud mode, only transcript text leaves your computer, never an audio recording. Your microphone audio is still transcribed locally first. What gets sent to a cloud model is the words you spoke, written as text, exactly as if you had typed them.

It helps to separate two things people lump together. "Voice" and "cloud" are independent choices in InnerZero. You can run voice fully locally with a local model and nothing leaves at all. Or you can route a request to a cloud model when you want a larger one for that answer, and in that case the request is text. The audio was already turned into words on your side, and the audio file is not part of the payload.

Cloud mode is off by default and always optional. When it is on, the same rules apply that govern any cloud send in InnerZero: only the current prompt plus the assembled context goes out, and your full memory database, your files, and your stored history stay on your machine. A privacy blacklist can scrub sensitive terms before any send, and an offline mode with a fail-closed egress guard can block outbound traffic entirely. For the full picture of what does and does not get sent, see [how InnerZero stays private](/blog/how-innerzero-stays-private).

To be precise about the boundary:

| Mode | Audio recorded to disk? | Audio sent to a server? | Text sent to a server? |
|---|---|---|---|
| Local voice (default) | No | No | No |
| Cloud voice (optional, on) | No | No | Yes, transcript only |
| Typed chat with cloud on | No mic used | No | Yes, your typed text |

## How does InnerZero compare to Alexa, Siri, and Google Assistant on microphone privacy?

Mainstream voice assistants keep a microphone open and send your voice to their servers, while InnerZero keeps the mic closed until you start and transcribes on your device. With the cloud assistants, the recording is the product: your audio leaves your home to be processed, and depending on settings, snippets can be retained or reviewed. With InnerZero, the audio is converted to text locally and the recording does not travel.

This is not a knock on those products. They are built around a different trade-off, where always-on convenience is the goal and cloud processing is how they deliver it. InnerZero is built for people who want that without the trade-off, which is why it also keeps a local memory and runs open models like Qwen3 or Gemma3 entirely offline. If voice privacy brought you here, [the best local private voice AI assistant](/blog/best-local-private-voice-ai-assistant-2026) goes further into the landscape.

## How can you verify InnerZero is not secretly recording your mic?

You can check it directly. The clearest signals are the operating system microphone indicator, InnerZero's local connection log, and the offline egress guard. Together they confirm both that the mic is closed when you are not using voice and that nothing is leaving your machine.

Start with your OS. Windows and macOS show a microphone-in-use indicator whenever any app accesses the mic. Open InnerZero, leave voice mode off, and you should see no activity attributed to it. Start a voice session and the indicator appears; end it and it goes away. That answers the always-listening question at the system level, outside the app's control.

Then check the network. InnerZero keeps a local-only connection log you can view in the app, so you can see whether it made an outbound request. Turn on Offline mode and its fail-closed egress guard, and outbound traffic is blocked entirely while voice keeps working, which is direct proof the audio is handled locally. The app is [free to download](/download) with no account required, so you can run these checks first.

## Frequently asked questions

### Does InnerZero use a wake word like "Hey Zero"?

No. InnerZero does not use an always-on wake word. You start a voice session deliberately, so the microphone is not sitting open listening for a trigger phrase. This avoids the accidental-recording problem that wake-word devices have.

### Is my voice ever uploaded to InnerZero's servers?

No. Your microphone audio is transcribed locally on your own machine with Whisper, and the raw audio is not uploaded anywhere. Even when you choose optional cloud voice, only the transcript text is sent, not an audio recording.

### Can I use voice without any internet connection?

Yes. Local speech-to-text (Whisper) and text-to-speech (Kokoro) run on your hardware, so voice works fully offline once the models are installed. A feature that keeps working with no connection cannot be quietly sending your audio out.

### Does turning on cloud mode change what happens to my microphone?

No, not to your microphone. Cloud mode is optional and off by default, and even when it is on, your audio is still transcribed locally first. Only the resulting text is sent to the cloud model, along with the assembled context for that single request, never your audio or your full memory.

### How do I know the microphone is actually off when I am not using voice?

Use your operating system's microphone indicator. Windows and macOS show when any app accesses the mic, and with InnerZero's voice mode off you should see no activity. You can also review the local, in-app connection log to confirm nothing is being sent.

### Where is my voice data stored after a conversation?

Anything kept from a conversation is stored locally on your machine as part of your memory, in a SQLite database protected by your operating system's disk encryption (BitLocker, FileVault, or LUKS). The raw audio is not retained, and nothing is synced to a server.


