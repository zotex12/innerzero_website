import type { FeatureCategory } from "./types";

export const unrestrictedMode: FeatureCategory = {
  slug: "unrestricted-mode",
  navLabel: "Unrestricted Mode",
  h1: "Unrestricted Mode, and what it does not change",
  seoTitle: "Unrestricted Mode: Optional Uncensored AI, 18+ - InnerZero",
  seoDescription:
    "Unrestricted Mode swaps InnerZero's local models for uncensored ones. It is 18+ only, off by default, and the CSAM hard block stays active in every mode.",
  hubTeaser:
    "Optional uncensored models, 18+ only. The CSAM hard block and every approval gate stay active.",
  leadIn:
    "Local AI models are trained to refuse certain requests. That refusal behaviour lives inside the model itself, not in the software around it, so the only way to change it is to run a different model. Unrestricted Mode is the optional path InnerZero provides for doing that.",
  leadOut:
    "It is an adult feature. It is off by default, it requires an 18+ consent process before it can be switched on, and the models it uses are third-party downloads that InnerZero does not distribute. Nothing about it relaxes InnerZero's own safety systems: the CSAM hard block, file approval, and the screen control gates all stay exactly as they are. This page sets out what the mode does, what it does not do, and where responsibility sits.",
  capabilities: [
    {
      id: "uncensored-models",
      title: "Uncensored models, installed by you",
      body: "When the mode is on, InnerZero swaps the Director model and the local voice model for abliterated versions that have had their refusal training removed. Those models are not bundled with InnerZero and are not distributed by Summers Solutions Ltd. They are community-modified builds of Qwen3 and Gemma3 published by huihui.ai on Hugging Face, and you pull them yourself with Ollama using the exact commands the app prints. The swap applies only on the Ollama engine; on LM Studio or llama.cpp InnerZero changes nothing and you would load an uncensored model in that application instead.",
    },
    {
      id: "consent-gate",
      title: "An 18+ consent process before anything changes",
      body: "Enabling the mode requires a declared date of birth, six separate acknowledgements, and a typed confirmation phrase. The checks in the interface are a convenience only: the app recomputes the age from the declared date of birth and validates every acknowledgement and the phrase itself before it records anything, so the consent record reflects what was actually submitted rather than what the screen assumed. The six acknowledgements cover the removal of safety filtering, the absolute prohibitions on child sexual abuse material, terrorism and serious criminal content, sole responsibility for what is generated, and confirmation that no person under 18 has access to the device or the feature.",
    },
    {
      id: "consent-is-not-activation",
      title: "Consent grants permission, it does not switch anything on",
      body: "Completing the consent process writes a timestamped receipt into your local settings folder, recording the acknowledgements given and the app version at the time. It does not activate the mode. You still enable it deliberately afterwards, and the app refuses that enable if the uncensored models are not installed, if the running engine is not Ollama, or if it cannot reach the engine to check.",
    },
    {
      id: "safety-floor",
      title: "The safety floor does not move",
      body: "The CSAM hard block is not part of the model. It lives in InnerZero's own policy gate and it runs at two separate points: the message you type is scanned before it reaches any engine, and the plan the model proposes back is scanned again, every string in it rather than only the text you typed, before any tool runs. It also runs on the contents of files you attach or import. It applies in every mode and cannot be turned off by any setting. File approval, the screen control gates, and the tool permission tiers are unchanged as well: the only thing Unrestricted Mode alters is the model's willingness to answer.",
    },
    {
      id: "your-responsibility",
      title: "You are responsible for what you generate",
      body: "InnerZero runs on your machine and the uncensored models are downloaded by you from a third party, so the output is yours. The terms of service set out absolute prohibitions that apply in every mode, covering child sexual abuse material, terrorism and violent extremism content, and serious criminal content, and no software setting overrides them. Misrepresenting your age to enable the mode revokes your licence. Uncensored models also produce confident mistakes with no safety warning attached, so nothing they say should be relied on for medical, legal, financial, or safety-critical decisions.",
    },
    {
      id: "off-by-default",
      title: "Off by default, and visible when it is not",
      body: "InnerZero ships with the mode off and it stays off until someone deliberately turns it on. When an uncensored model is live, an UNRESTRICTED badge appears in the status bar, a red notice sits under the chat input, and a badge sits in the voice page header. Those indicators track whether an uncensored model is actually in play rather than whether the toggle is on, so they also appear if you select an uncensored model as your ordinary Director model with the mode switched off, and they fail towards showing the warning when the app cannot tell.",
    },
    {
      id: "turning-it-off",
      title: "Turning it off and removing the models",
      body: "The toggle can always be switched back off, and disabling is never gated on consent, on the uncensored models being present, or on the engine being reachable. If the setting cannot be saved the app says so rather than showing an off switch over a mode that is still on. The chat and voice conversation buffers are cleared on the way through, so context does not carry across the model change. A separate action in the Experimental tab removes both uncensored models and revokes the stored consent receipt, and it reports plainly when it cannot finish. It refuses to delete a model that is still selected as your ordinary Director or voice model, or that a specialist agent is configured to use, so removing it cannot leave the rest of the app pointing at a model that is no longer there.",
    },
  ],
  guides: [
    {
      slug: "unrestricted-mode-explained",
      title: "Uncensored Local AI: What Unrestricted Mode Does",
      blurb:
        "What the mode changes, how the consent process works, and which safeguards stay in place.",
    },
  ],
  faqs: [
    {
      question: "What is Unrestricted Mode in InnerZero?",
      answer:
        "Unrestricted Mode is an optional setting that swaps InnerZero's local Director and voice models for uncensored versions that have not been trained to refuse requests. It is off by default, requires an 18+ consent process before it can be enabled, and applies only when InnerZero is running on the Ollama engine. It changes the model, not the rest of the application.",
    },
    {
      question: "Is Unrestricted Mode available to anyone under 18?",
      answer:
        "No. Unrestricted Mode is for adults aged 18 or over only. Enabling it requires a declared date of birth, which the app validates before it records consent, and one of the six required acknowledgements is a confirmation that no person under 18 has access to the device or the feature. Misrepresenting your age to enable it revokes your licence under the terms of service.",
    },
    {
      question: "Does Unrestricted Mode turn off InnerZero's safety systems?",
      answer:
        "No. The CSAM hard block lives in InnerZero's own policy gate. The message you type is scanned before it reaches any model, and the plan the model proposes back is scanned again before any tool runs. It applies in every mode and to attached and imported files as well as to chat. File approval, the screen control gates, and the tool permission tiers are all unchanged. The only thing that changes is the model's willingness to answer.",
    },
    {
      question: "Does InnerZero include the uncensored models?",
      answer:
        "No. The uncensored models are not bundled with InnerZero and are not distributed by Summers Solutions Ltd. They are community-modified versions of Qwen3 and Gemma3, published by huihui.ai on Hugging Face, and you download them yourself with Ollama using the commands the app shows. Downloading them puts you in a direct relationship with the model providers.",
    },
    {
      question: "Can I turn Unrestricted Mode off again and remove the models?",
      answer:
        "Yes. The toggle can be switched back off at any time, and disabling is never gated on consent, on the uncensored models being present, or on the engine being reachable. If the setting cannot be saved the app says so rather than showing an off switch over a mode that is still on. The Experimental tab also carries an action that removes both uncensored models and revokes the stored consent record. It refuses to delete a model you still have selected as your ordinary Director or voice model, or that a specialist agent is configured to use.",
    },
    {
      question: "How do I know when an uncensored model is running?",
      answer:
        "InnerZero shows an UNRESTRICTED badge in the status bar, a red notice under the chat input, and a badge on the voice page. Those indicators reflect whether an uncensored model is actually in use rather than whether the mode toggle is on, so they also appear if you select an uncensored model as your ordinary Director model with the mode switched off.",
    },
  ],
  related: ["cloud-ai", "customisation", "ai-chat"],
  published: "2026-07-27",
  modified: "2026-07-27",
};
