import type { FeatureCategory } from "./types";

export const languages: FeatureCategory = {
  slug: "languages",
  navLabel: "Languages",
  h1: "Use InnerZero in your own language",
  seoTitle: "Private AI Assistant in 26 Languages - InnerZero",
  seoDescription:
    "Run a private AI assistant in 26 languages. The interface and the replies both switch instantly, with no restart and no internet connection needed.",
  hubTeaser:
    "26 languages across the whole app, interface and AI replies together, fully offline.",
  leadIn:
    "Most AI assistants translate their menus and stop there. You end up with a half-translated app that still answers you in English, or one that needs an internet connection every time it switches.",
  leadOut:
    "InnerZero changes language across the whole app, not just a menu strip. The interface and the assistant's replies switch together, without a restart, and without sending anything over the internet.",
  hero: {
    src: "/images/features/languages-hero.png",
    alt: "InnerZero settings with the interface language picker open, showing a searchable list including English, French, Spanish, German, Italian, and Portuguese",
    caption:
      "The language picker in Settings, General tab. Search, pick, and the app switches straight away.",
  },
  stats: [
    { value: "26", label: "Languages supported" },
    { value: "9", label: "Languages with a built-in voice" },
    { value: "0", label: "Internet connection required" },
  ],
  capabilities: [
    {
      id: "languages-supported",
      title: "26 languages in a searchable picker",
      body: "The picker covers English, French, Spanish, German, Italian, Portuguese, Dutch, Polish, Russian, Ukrainian, Chinese, Japanese, Korean, Arabic, Hebrew, Hindi, Turkish, Vietnamese, Thai, Swedish, Indonesian, Persian, and Urdu. English is listed as both United States and United Kingdom, Portuguese as both Portuguese and Brazilian, and Chinese as both Simplified and Traditional, so regional spelling matches what you expect. A search box sits at the top of the list, so you do not have to scroll through everything to find yours.",
    },
    {
      id: "replies-in-your-language",
      title: "Replies in your language, not just the menus",
      body: "Choosing a language changes the assistant's responses as well as the interface. This is the part most local AI tools skip. The setting covers the interface and the AI responses together, so you are not reading Spanish menus while the assistant answers in English. English stays the default until you change it.",
    },
    {
      id: "instant-switching",
      title: "Switching is instant and works offline",
      body: "Changes apply right away. There is no restart, no reload, and no download step. Because the translations ship inside the app rather than being fetched from a translation service, switching language works with your machine completely offline.",
    },
    {
      id: "multilingual-memory",
      title: "Multilingual memory",
      body: "InnerZero remembers things you tell it across sessions. Settings carries an optional one-time multilingual memory upgrade that re-embeds what you have already saved, so search and duplicate detection work across all 26 languages and a fact you told it in French can still be found when you are working in English later. On some setups the app offers the upgrade when you first switch to a non-English language. It takes a safety backup before it changes anything, it can be resumed if you cancel, and you can skip it and start it later from Settings.",
    },
    {
      id: "voice-language-support",
      title: "Voice falls back to text where needed",
      body: "Voice support does not yet cover all 26 interface languages. Nine of them have a built-in voice model behind them and the other seventeen do not. When you pick a language with no voice model, voice features fall back to text rather than failing or silently answering in the wrong language. The language setting says so up front, so there is no surprise after you switch.",
    },
  ],
  guides: [
    {
      slug: "local-ai-assistant-in-your-language",
      title: "How to Use a Private AI Assistant in Your Own Language",
      blurb:
        "The step-by-step walkthrough for switching language and getting replies in it too.",
    },
    {
      slug: "private-ai-for-non-english-speakers",
      title: "A Private AI Assistant for Non-English Speakers",
      blurb:
        "Why local AI matters more when English is not your first language, and what to expect.",
    },
  ],
  faqs: [
    {
      question: "How many languages does InnerZero support?",
      answer:
        "26. The picker covers English (United States and United Kingdom), French, Spanish, German, Italian, Portuguese and Brazilian Portuguese, Dutch, Polish, Russian, Ukrainian, Chinese (Simplified and Traditional), Japanese, Korean, Arabic, Hebrew, Hindi, Turkish, Vietnamese, Thai, Swedish, Indonesian, Persian, and Urdu.",
    },
    {
      question: "Does the AI reply in my language or just the menus?",
      answer:
        "Both. The language setting covers the interface and the AI responses together. Choosing a language means the assistant answers in it as well, not just the buttons and labels.",
    },
    {
      question: "Do I need an internet connection to change language?",
      answer:
        "No. The translations ship inside the app rather than being fetched from a translation service, so switching language works fully offline.",
    },
    {
      question: "Do I have to restart the app after switching language?",
      answer:
        "No. Changes apply right away. There is no restart and no reload step.",
    },
    {
      question: "Can I use InnerZero in Arabic, Hebrew, Persian, or Urdu?",
      answer:
        "Yes. All four ship as fully translated interface languages, they are selectable in the language picker, and the assistant replies in them. The interface itself is laid out left to right.",
    },
    {
      question: "Does voice work in every language?",
      answer:
        "Not yet. Nine of the 26 interface languages have a built-in voice model. When you select one of the other seventeen, voice features fall back to text, and the app says so on the language setting itself.",
    },
  ],
  related: ["ai-chat", "voice", "memory"],
  published: "2026-07-27",
  modified: "2026-07-27",
};
