<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale (Anthropic consumer and commercial training and retention terms)
- [ ] Re-fetch the Anthropic pages cited and bump the Last verified date only if all still match
- [ ] Check Anthropic's privacy policy update log for any change after 2026-07-08, and what the Privacy Policy effective 2026-09-10 changed
- [ ] Confirm the Privacy Settings label and URL (claude.ai/settings/data-privacy-controls)
- [ ] Confirm InnerZero managed plans still do not route text to Anthropic (/privacy subprocessor list)
- [ ] Confirm best-private-ai-chatbot-alternatives-chatgpt-2026 no longer says Claude.ai does not train by default
- [ ] Confirm ai-prompt-training-comparison no longer names Anthropic as a managed cloud provider
-->
---
title: "Does Claude Train on Your Chats?"
description: "Does Claude train on your chats? How Anthropic's training setting, incognito chats and retention work, and why the API is not used for training by default."
date: "2026-11-06"
author: "Louie Summers"
authorRole: "Founder"
slug: "does-claude-train-on-your-chats"
tags: ["privacy", "claude", "cloud ai", "comparison"]
readingTime: "9 min read"
featured: false
---

Does Claude train on your chats? Since Anthropic changed its consumer terms in 2025, the answer depends on one setting. If Model Improvement is on, Anthropic can use the chats and Claude Code sessions from your Free, Pro or Max account to train future models. If it is off, it does not, apart from a few exceptions covered below. Anthropic's commercial products and the API are a different story: they are not used for training by default. The pages I checked do not say what the consumer switch was set to when you first saw it, so check your own setting rather than trusting a headline.

Last verified: 2026-10-23, against the Anthropic pages linked in this post.

> **Quick summary**
> - Free, Pro and Max chats, including Claude Code sessions on those accounts, can be used for training when Model Improvement is on.
> - With it on, Anthropic can keep that data for up to 5 years; with it off, chats stay in your history and deleted ones leave Anthropic's back end within 30 days.
> - Incognito chats are not used for training, but feedback and flagged chats follow their own rules.
> - Claude for Work and the Anthropic API are not used for training by default.
> - Claude in InnerZero with your own API key falls under the API rules.

## Does Claude train on your chats by default?

**Claude can train on your chats if the Model Improvement setting on your account is on.** Since Anthropic's 2025 update to its consumer terms, chats and coding sessions from Claude Free, Pro and Max accounts, including Claude Code used with those accounts, may be used to train future models if you allow it. Anthropic's commercial products are not used for training by default.

The change was announced on 28 August 2025 in [Anthropic's update to its consumer terms](https://www.anthropic.com/news/updates-to-our-consumer-terms). Existing users saw the choice in a pop-up and had until 8 October 2025 to decide, and new users pick a preference during signup. The current [Anthropic privacy policy](https://www.anthropic.com/legal/privacy) puts it in one line: Anthropic may use your inputs and outputs to train and improve its models "unless you opt out through your account settings".

If you are worried about your history, the setting applies to new or resumed chats and coding sessions, and previous chats with no additional activity will not be used for model training. The update also does not apply to services under Anthropic's Commercial Terms, such as Claude for Work, Claude for Education and the API.

Many articles about Claude and training were written before that change, so check the date on anything you read.

## How do you stop Claude training on your conversations?

**Turn off the Model Improvement setting in Claude's Privacy Settings.** The page lives at `claude.ai/settings/data-privacy-controls`, and Anthropic says you can change your choice at any time. Once it is off, Anthropic says it will not use your previous or new chats and coding sessions for future model training.

There is a limit: Anthropic says data already used in a training run that has started, or in a model already trained, stays there.

Practical steps:

- Check Model Improvement now, rather than assuming what it was set to
- Use an incognito chat for anything you would not want kept in your history
- Skip the thumbs up and down buttons on sensitive conversations
- Delete chats you no longer need, which stops them being used for future training

Training is only one kind of tracking, and this guide on [how to ask AI questions with no tracking](/blog/how-to-ask-ai-with-no-tracking) covers the others, from account linkage to network metadata.

## How long does Anthropic keep your Claude chats?

**It depends on your training setting and on what happens to the chat.** If you allow training, Anthropic [says it may retain your data](https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data) in a de-identified format for up to 5 years in its model training pipelines. If you do not, the 2025 announcement says the existing 30-day data retention period continues. Your chats still stay in your history, and Anthropic says a chat you delete leaves your history immediately and is removed from its back-end storage within 30 days. Chats flagged as violating the Usage Policy are kept longer.

All rows but the last come from the Anthropic pages linked here.

| Claude plan or mode | Used to train models? | How long Anthropic keeps it |
|---|---|---|
| Free, Pro or Max, Model Improvement on | Yes, new and resumed chats and coding sessions | Up to 5 years, de-identified, in training pipelines |
| Free, Pro or Max, Model Improvement off | No, except flagged chats and feedback | Kept in your chat history; deleted chats leave the back end within 30 days |
| Incognito chat | No, even with Model Improvement on | 30 days by default |
| Thumbs up or down feedback | Can be, de-linked from your user ID | The whole related conversation, up to 5 years |
| Chat flagged for a Usage Policy violation | Can be used to improve safety enforcement | Inputs and outputs up to 2 years, safety scores up to 7 years |
| Claude for Work (Team, Enterprise) | No by default, except explicit feedback | Kept in the product; deleted chats leave the back end within 30 days |
| Anthropic API, including your own key in InnerZero | No by default, except explicit feedback | Deleted within 30 days, with listed exceptions |
| InnerZero local mode | No, nothing is sent to Anthropic | Nothing held by Anthropic; chats stay on your computer |

## Do incognito chats, feedback, and flagged chats follow different rules?

**Yes, and each one can override what you expect from the main setting.** Incognito chats are [not used to improve Claude](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training) even if Model Improvement is on. Feedback and flagged chats work the other way: they can be used even when it is off.

According to Anthropic's [help article on incognito chats](https://support.claude.com/en/articles/12260368-use-incognito-chats), incognito is available on every plan, from Free to Enterprise, and is not saved to your chat history or to Claude's memory.

Feedback is the one people miss. When you press thumbs up or down, Anthropic stores the entire related conversation and de-links it from your user ID before using it, so a single rating on a sensitive chat keeps that whole conversation for up to 5 years. Chats flagged for safety review are the second exception: Anthropic may use them to improve how it detects and enforces its Usage Policy, whatever your setting.

## Does the Claude API or Claude for Work train on your data?

**No, not by default.** Anthropic states that it [will not use inputs or outputs from its commercial products](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training) for training by default, naming Claude for Work, the Anthropic API and Claude Gov. Its [Commercial Terms](https://www.anthropic.com/legal/commercial-terms) say plainly that Anthropic "may not train models on Customer Content from Services." The exception is explicit feedback or bug reports you choose to send.

Retention is shorter too. For API users, Anthropic says it [automatically deletes inputs and outputs within 30 days](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) of receipt or generation. The exceptions it lists are services with longer retention under your control, a different agreement such as zero data retention, Usage Policy enforcement, and legal requirements.

The same Claude model can sit under consumer rules in the app and commercial rules through an API key. Our [provider-by-provider comparison of API training policies](/blog/ai-prompt-training-comparison) sets Anthropic against OpenAI, Google, DeepSeek and Kimi.

## What happens to your data when you use Claude inside InnerZero?

**In InnerZero's local mode, nothing reaches Anthropic, because the model runs on your own computer.** InnerZero starts in private mode, and cloud stays off until you turn it on. If you then add your own Anthropic API key, requests go from your computer straight to Anthropic's API and do not pass through InnerZero's servers.

That makes each request an API request, so Anthropic's commercial terms apply rather than the consumer Claude terms: no training by default, and deletion within 30 days apart from the exceptions above. Your key is stored encrypted on your machine, and each text chat request that Anthropic accepts is listed in a local connection log you can view in the app. Setup and cost are in the [guide to using Claude with your own Anthropic key](/blog/claude-opus-4-7-byo-keys).

The privacy blacklist swaps terms you list, such as client names or project codenames, for placeholders before a request leaves your machine, then restores them in the reply; [how the privacy blacklist works](/blog/privacy-blacklist-explained) shows it in action. And InnerZero's optional managed cloud plans are a separate route: for text chat, the provider our [privacy page](/privacy) currently lists is DeepSeek, not Anthropic.

## Frequently asked questions

### Is Claude more private than ChatGPT?

Neither keeps your chats on your own device. Both process conversations on the provider's servers, both let you switch training off, and both offer a chat mode that is not used for training: Incognito on Claude, Temporary Chat on ChatGPT. For the OpenAI side, see this breakdown of [whether ChatGPT chats are private](/blog/is-chatgpt-private).

### Does deleting a Claude chat remove it from training?

Deleting a chat stops it being used for future model training, according to Anthropic's 2025 announcement, and removes it from Anthropic's back-end storage within 30 days. The pages I checked do not say deletion removes data from training that has already happened.

### Does Claude Code use my code for training?

It depends on how you sign in. Claude Code used with a Free, Pro or Max account falls under the consumer setting, so your coding sessions can be used for training when Model Improvement is on. Claude Code used through the Anthropic API or a commercial plan falls under the Commercial Terms and is not used for training by default.

### Can I use Claude without my chats being used for training?

Yes. Turn off Model Improvement, use incognito chats for sensitive topics, and skip the feedback buttons; chats flagged for safety review remain the exception. Using Claude through an API key, including inside InnerZero, puts you under the commercial rules. If you would rather nothing leaves your machine at all, [local AI](/what-is-local-ai) runs open models on your own hardware instead.

### Does InnerZero see my Claude conversations?

No. With your own Anthropic key, requests go from your computer straight to Anthropic and do not pass through InnerZero's servers, so InnerZero never receives them. Your InnerZero chat history stays on your own computer, and in local mode nothing goes to any cloud provider. You can [download InnerZero](/download) and start in local mode without creating an account.
