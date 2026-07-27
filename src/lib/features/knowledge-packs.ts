import type { FeatureCategory } from "./types";

export const knowledgePacks: FeatureCategory = {
  slug: "knowledge-packs",
  navLabel: "Knowledge Packs",
  h1: "Give your AI a reference library that works offline",
  seoTitle: "Offline Wikipedia for Your AI Assistant - InnerZero",
  seoDescription:
    "Download Wikipedia to your own machine and let your AI check its answers against real articles. 871,000 articles offline, no internet needed.",
  hubTeaser:
    "Offline Wikipedia your assistant can check its answers against. 871,000 articles, no connection.",
  leadIn:
    "A language model is fluent about things it has only half-learned. Ask for a date, a population figure, or who did what in which year, and you can get a confident answer that is simply wrong. Searching the web catches some of that, and it needs a connection you do not always have.",
  leadOut:
    "Knowledge packs are reference databases you download once and keep. When you ask a factual question, InnerZero searches the pack first and builds the answer from the article it found, usually with the source shown under the reply. The lookup itself never touches the network.",
  hero: {
    src: "/images/features/knowledge-packs-hero.png",
    alt: "InnerZero knowledge pack settings listing downloadable Wikipedia packs with article counts and download sizes",
    caption:
      "Knowledge packs in Settings. Download once, then get factual answers with no internet connection.",
  },
  stats: [
    { value: "871,000", label: "Articles in Best of Wikipedia" },
    { value: "350 MB", label: "Download size for that pack" },
    { value: "0", label: "Network calls for a pack lookup" },
  ],
  capabilities: [
    {
      id: "offline-reference",
      title: "Offline reference databases, not a web search",
      body: "A knowledge pack is a full-text searchable database of encyclopedia articles sitting on your own drive. A question runs against it as a local, read-only database read, so there is no request to send and nothing that needs to be online. The app puts it plainly on the Knowledge tab: offline reference databases for factual answers.",
    },
    {
      id: "packs-available-today",
      title: "Two packs you can download today",
      body: "Best of Wikipedia carries around 871,000 curated articles across the major topics and downloads at roughly 350 MB. Simple English Wikipedia carries around 391,000 articles at roughly 460 MB, fewer articles than Best of Wikipedia but written in simplified English. Both sit under Recommended in Settings, and you can install one, the other, or both. The first-run setup wizard also offers Best of Wikipedia as an optional tick box if you would rather get it out of the way early.",
    },
    {
      id: "grounded-answers",
      title: "Answers cross-referenced against real articles",
      body: "When your message reads like a factual question and a pack is installed, InnerZero looks the subject up first and puts the matching article into the prompt as reference material. The model writes its reply from that text rather than from training memory alone, which is what makes the difference to invented dates and figures. It is also instructed to prefer the offline pack over a web search for factual, historical, and definitional questions, and to keep web search for current events, news, and prices.",
    },
    {
      id: "source-citation",
      title: "Knowledge-backed answers show their source",
      body: "A reply built from a pack usually carries a collapsible Source line naming the article and the pack it came from. Expand it and you see an excerpt of the article the answer was built from, so you can check the claim instead of taking it on trust. The citation is part of the message, not a separate panel you have to go looking for.",
    },
    {
      id: "fact-verification",
      title: "The sleep pass checks stored facts against your packs",
      body: "InnerZero's overnight memory pass takes facts it extracted earlier and looks each one up in your installed packs. A fact the article supports gets a note recording which article backed it, plus a small confidence increase up to a capped ceiling. A fact the article contradicts gets a note naming the article and the pack, so the disagreement is written down rather than quietly kept. Personal facts about you, time-sensitive claims, and anything with no matching article are skipped rather than judged.",
    },
    {
      id: "packs-feed-more-than-chat",
      title: "Packs feed briefings and voice as well",
      body: "Knowledge lookup is on the allowlist of tools the proactive briefing loop may call, so a briefing can pull a fact straight out of a pack. The Pro Daily learning template uses it directly, pulling a short thing to learn from your installed packs each day and running fully offline. Voice only starts treating encyclopedia-style questions as a pack lookup once you actually have a pack installed.",
    },
    {
      id: "manage-packs",
      title: "Turn packs on and off, or remove them",
      body: "Each installed pack has its own Enable and Disable control, so you can keep a pack on disk but out of the search without deleting it. Delete removes the database file and confirms how much space that frees before it does. The Knowledge tab shows total storage used and how many packs are installed, so the disk cost is never a surprise.",
    },
    {
      id: "extended-packs",
      title: "Extended packs",
      body: "A second tier is listed in the app under Extended and marked Coming Soon: Wiktionary (English) at around 600,000 entries and 500 MB, a full-text Best of Wikipedia at 871,000 articles and 2.2 GB, a StackExchange technical archive at around 5,000,000 items and 4 GB, and Wikivoyage travel guides at around 30,000 articles and 500 MB. They are visible in Settings so you can see what is planned. They cannot be downloaded yet.",
      comingSoon: true,
    },
    {
      id: "complete-library",
      title: "Complete Library packs",
      body: "A third tier, described in the app as being for systems with plenty of storage space, is also listed and marked Coming Soon: the full English Wikipedia at around 7,100,000 articles and 10 GB, full Wiktionary at around 1,000,000 entries and 1.5 GB, and Wikibooks at around 90,000 pages and 500 MB. Like the Extended tier, these are shown in the app but are not yet available to install.",
      comingSoon: true,
    },
    {
      id: "licensing",
      title: "Sourced from Wikimedia, licensed CC BY-SA 4.0",
      body: "Pack content is sourced from Wikipedia and other Wikimedia projects under the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0). The attribution is shown on the Knowledge tab itself, and again under Third-Party Licences and Notices on the General tab. Hover a pack in the catalogue and the same licence line appears with that pack's own source named. Knowing where an offline reference came from is part of the point of having one.",
    },
  ],
  guides: [
    {
      slug: "knowledge-packs-explained",
      title: "How to Give Your AI Offline Access to Wikipedia",
      blurb:
        "What a knowledge pack is, how to install one, and what it does to the answers you get.",
    },
    {
      slug: "use-ai-offline",
      title: "How to Use AI Completely Offline",
      blurb:
        "Running the whole assistant with no connection, and where knowledge packs fit into that.",
    },
  ],
  faqs: [
    {
      question: "How many Wikipedia articles can InnerZero store offline?",
      answer:
        "Around 871,000 with the Best of Wikipedia pack, which downloads at roughly 350 MB. Simple English Wikipedia adds around 391,000 articles at roughly 460 MB. Both can be installed at the same time, and they are the two packs available to download today.",
    },
    {
      question: "Do knowledge packs work without an internet connection?",
      answer:
        "Yes, once a pack is downloaded. The pack is a database file on your own drive and a lookup is a local read, so the lookup itself makes no network calls. You only need a connection for the initial download.",
    },
    {
      question: "Do knowledge packs stop the AI making things up?",
      answer:
        "They reduce it rather than remove it. InnerZero searches the pack first and hands the matching article to the model as reference material, and usually shows the source under the reply so you can check it. The model still writes the answer in its own words, and a pack is a snapshot, so it will not cover very recent events or every obscure topic.",
    },
    {
      question: "How much disk space do knowledge packs need?",
      answer:
        "Best of Wikipedia is roughly 350 MB and Simple English Wikipedia is roughly 460 MB. Settings shows the total storage used and how many packs are installed. You can disable a pack to take it out of searches while keeping it on disk, or delete it to free the space back.",
    },
    {
      question: "Where does knowledge pack content come from?",
      answer:
        "Wikipedia and other Wikimedia projects, under the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0). The attribution is shown on the Knowledge tab in Settings and under Third-Party Licences and Notices on the General tab.",
    },
    {
      question: "Can I install a knowledge pack during setup?",
      answer:
        "Yes. The first-run setup wizard offers Best of Wikipedia as an optional tick box on the download step. If you skip it, you can add it or any other available pack later from the Knowledge tab in Settings.",
    },
  ],
  related: ["memory", "tools", "ai-chat"],
  published: "2026-07-27",
  modified: "2026-07-27",
};
