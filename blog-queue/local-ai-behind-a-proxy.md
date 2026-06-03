<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify the Settings proxy box still supports HTTP/HTTPS with optional username/password and applies at startup
- [ ] Confirm local AI traffic is never routed through the proxy (loopback always excluded) and a restart is needed to apply
- [ ] Confirm the proxy is transport-only and does not change what is sent or bypass privacy controls
-->
---
title: "How to Run a Local AI Assistant Behind a Corporate or School Proxy"
description: "On a work or university network behind a proxy, model downloads and updates can fail. InnerZero has a proxy setting so it can reach the internet for setup, while local AI traffic is never routed through it."
date: "2026-08-25"
author: "Louie"
authorRole: "Founder"
slug: "local-ai-behind-a-proxy"
tags: ["guide", "privacy", "local ai"]
readingTime: "6 min read"
featured: false
---

On a lot of work and university networks, you cannot just reach the internet directly. Everything goes through a [proxy server](https://developer.mozilla.org/en-US/docs/Web/HTTP/Proxy_servers_and_tunneling), and apps that do not know about it quietly fail to download or update. That can stop a local AI assistant before it even gets its model. InnerZero has a proxy setting for exactly this, and it is careful to keep your local AI traffic off the proxy entirely.

> **Quick summary**
> - Corporate and school networks often route all internet through a proxy, which can block model downloads.
> - InnerZero has a proxy setting so it can reach the internet for setup, updates, and optional cloud calls.
> - Your local AI traffic is never routed through the proxy. It stays on your machine.
> - The setting is yours to enter and applies after a restart.

## Why does a proxy break some apps on a work network?

Because the app tries to reach the internet directly and the network will not allow it. On many corporate and university setups, outbound traffic is only permitted through a proxy server that sits between your machine and the internet. Apps that are not told about that proxy cannot get out, so things like downloads and update checks time out or fail with a connection error.

For a local AI assistant, the most common symptom is the first-run model download failing. The AI itself runs on your machine, but it still needs to fetch its model once, and that fetch goes over the internet. No internet path, no model.

## Does InnerZero work behind a proxy?

Yes, once you tell it about the proxy. InnerZero has a proxy setting where you enter your network's HTTP or HTTPS proxy address, with an optional username and password if your network requires sign-in. With that set, InnerZero can reach the internet through the proxy for the things that genuinely need it: downloading a model during setup, checking for updates, and any optional cloud or connector calls you have chosen to use.

This is the same kind of setting you find in other well-behaved desktop software. You are pointing the app at the same gateway the rest of your machine already uses.

## How do I set the proxy in InnerZero?

You enter it in Settings, then restart the app so it takes effect. The steps are short:

- Open Settings and find the proxy section.
- Enter your proxy address (the one your IT or university provides), for example an HTTP or HTTPS proxy host and port.
- Add a username and password only if your network's proxy requires them.
- Save, then fully restart InnerZero so the setting applies.

If you are not sure of the address, your IT team or the university help desk can give you the exact proxy details, since it is the same one your browser and other tools use.

## Does my local AI traffic go through the proxy too?

No, and this is the part that matters for privacy. InnerZero always keeps local traffic off the proxy. The connection between the app and the AI model running on your own machine is loopback traffic that stays inside your computer, and it is never routed out through the proxy. The proxy is only used for genuine outbound internet, like fetching the model file or an optional cloud call you asked for.

In other words, turning on the proxy does not change what InnerZero sends or where your conversations go. Your chats with the local model still never leave your machine. The proxy is purely the route your internet downloads take, not a new path for your data. The wider privacy picture is in [how InnerZero stays private](/blog/how-innerzero-stays-private), and the local-first idea itself in [what is a local AI assistant](/what-is-local-ai).

## What does the proxy actually help with?

Three things, all of them internet tasks rather than AI tasks. First, the one-time model download during setup, which is the usual thing that fails on a locked-down network. Second, update checks so the app can tell you when a new version is available. Third, any optional online features you have switched on yourself, such as a cloud model or a connector, which need to reach their service.

What it does not do is route your local AI through anything. Once your model is downloaded, the assistant runs offline on your hardware regardless of the proxy, the same as it would on any network. For more on that offline behaviour, see [how to use AI offline](/blog/use-ai-offline).

It is worth saying that the proxy setting is transport only. It changes the route your internet downloads take, not what InnerZero decides to send. The same privacy controls apply with the proxy on as with it off, so turning it on to get past a locked-down network does not loosen anything about how your data is handled. You are giving the app a way out to the internet, not a new reason to use it.

## Frequently asked questions

### What proxy types does InnerZero support?

HTTP and HTTPS proxies, with an optional username and password for networks that require proxy authentication. Enter the same proxy your browser uses if you are unsure.

### Do I need to restart after setting the proxy?

Yes. The proxy applies when the app starts, so save the setting and fully restart InnerZero for it to take effect.

### Will the proxy see my AI conversations?

No. Local AI traffic stays on your machine and is never routed through the proxy. The proxy only carries genuine internet tasks like the model download and optional cloud calls.

### My model download failed on my work network. Is this the fix?

Often, yes. A blocked model download on a corporate or university network is usually a proxy issue. Entering your proxy details and restarting lets the download reach the internet.

### Is the proxy setting available for free?

Yes. It is part of the free InnerZero download.

## The point

A proxy should not stand between you and a private AI assistant. InnerZero lets you enter your work or school proxy so it can fetch its model and reach optional online features, while keeping your local AI traffic off the proxy and on your own machine. If your network has blocked you before, [download InnerZero](/download) and set the proxy in Settings, or read [how to run AI on your PC](/blog/run-ai-on-your-pc) for the rest of setup.
