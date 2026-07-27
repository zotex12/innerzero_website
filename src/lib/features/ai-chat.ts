import type { FeatureCategory } from "./types";

export const aiChat: FeatureCategory = {
  slug: "ai-chat",
  navLabel: "AI Chat",
  h1: "Everyday AI chat that runs on your own machine",
  seoTitle: "Private AI Chat That Runs on Your Own PC - InnerZero",
  seoDescription:
    "Chat with a local AI assistant on your own PC. Attach files and images, run slash commands, and export any answer to PDF or Word. Cloud mode is optional.",
  hubTeaser:
    "Streaming local chat with slash commands, attachments, and export to real documents.",
  leadIn:
    "Every AI chat box looks much the same from the outside. The differences show up after you press enter: whose machine runs the model, whether the conversation is still there tomorrow, and whether what you just typed now sits on a server you do not control.",
  leadOut:
    "InnerZero's chat runs against a model installed on your own machine. Answers stream in as they are written, the conversation survives a restart, and the composer carries the controls you would otherwise go hunting for: thinking speed, slash commands, a prompt library, file and image attachment, and export to real documents.",
  hero: {
    src: "/images/appchatpageimage.png",
    alt: "The InnerZero chat interface showing a conversation with the local AI assistant",
    caption:
      "Chat runs on your machine. Nothing is sent anywhere unless you turn cloud mode on.",
  },
  stats: [
    { value: "8", label: "Export formats for any answer" },
    { value: "50+", label: "Built-in slash commands" },
    { value: "0", label: "Messages sent out in Private mode" },
  ],
  capabilities: [
    {
      id: "private-conversations",
      title: "Private by default, and the app says when it is not",
      body: "The app starts in Private mode, where the model runs on your own hardware and the conversation has nowhere to travel to. Cloud mode is a separate setting you turn on yourself, and while it is on the footer under the chat box changes to say Cloud Mode is active and that prompts are sent to your configured providers. An answer from the model carries a small badge naming what produced it, so a local answer and a cloud answer are never confused: Private AI for the model on your own machine, or the cloud model's own name once cloud mode is on. Instant shortcut answers, like the clock or the calculator, carry no badge at all.",
    },
    {
      id: "streaming-responses",
      title: "Answers appear as they are written",
      body: "Text streams into the message as the model produces it rather than landing in one block at the end, so a long answer is readable while it is still being written. While a response is in flight the send button becomes a stop control, and pressing it ends the generation immediately and also halts any screen automation that reply had started. A stopped answer keeps what had already arrived and is tagged as cancelled, so a partial reply is never mistaken for a finished one.",
    },
    {
      id: "persistent-chat",
      title: "The conversation is still there after a restart",
      body: "Messages are written to a session file inside the app's own data folder, so closing InnerZero and reopening it does not wipe the thread. Clearing is deliberately narrower than it sounds: the confirmation tells you it removes chat history from view and that the assistant still remembers what you talked about, because long-term memory is a separate store. When a thread gets long enough to slow things down, a hint bar offers to clear it rather than letting the app quietly get sluggish.",
    },
    {
      id: "thinking-modes",
      title: "Two thinking speeds in the composer",
      body: "A Thinking speed picker sits at the top of the chat box with two settings, Quick and Thinking. Quick keeps the context smaller and uses a single reasoning round, which suits everyday questions on a modest machine; Thinking uses more context and can take several rounds when the answer needs working through. Thinking is the default, so the deeper setting is what you get unless you deliberately choose Quick, and the picker stays in the composer where you are already typing, so changing it takes one click.",
    },
    {
      id: "markdown-rendering",
      title: "Formatted answers, or plain text if you prefer",
      body: "Replies render as rich text while they stream, covering bold, lists, code blocks, and tables, so structured answers are readable without squinting at raw markup. If you would rather read everything as flat text, Settings has a Response format switch with Formatted and Plain text options, and plain text keeps line breaks only. The formatting is applied on your machine at display time, not fetched from anywhere.",
    },
    {
      id: "slash-commands",
      title: "Slash commands with deterministic routing",
      body: "Type a forward slash at the start of a message and a menu opens above the box, filtering as you type and grouping commands into sections such as App commands, Memory, Calendar, Tools, Files, Time, and Notes, with the ones you use most at the top. The routing is deterministic rather than interpreted: the slash has to be the first character, the first word is matched exactly against a registry, and the command runs without a model call at all, so the same command does the same thing every time. There are more than fifty built in, from /help and /clear to /events, /note, /recall, and /theme. Commands that touch files or the clipboard still raise the normal approval card before anything happens.",
    },
    {
      id: "prompt-library",
      title: "A prompt library that shares the slash menu's list",
      body: "A button in the chat box opens a full-height panel down the right side of the window, holding your reusable prompts, grouped into Favourites, Recent, All, folders you create yourself, and the built-in categories. Each prompt has Use, Copy, and Edit actions, a favourite star, a colour accent, and a tag reading Template or Yours, so the right one is recognisable at a glance rather than by reading every title. The library and the slash menu read from the same registry, so a prompt you write shows up in both places straight away, without you filing it twice.",
    },
    {
      id: "dictate-in-chat",
      title: "Dictate into the box instead of typing",
      body: "The composer carries two separate voice controls, and they do different jobs. The dictation button turns speech into text and drops it into the chat box, where it sits as ordinary editable text you can correct before sending; the microphone button starts a full spoken conversation instead. Dictation is useful when you want the assistant's normal written answer but do not want to type the question.",
    },
    {
      id: "attachments",
      title: "Attach documents and images, including pasted screenshots",
      body: "The paperclip accepts .txt, .md, .pdf, .docx, .xlsx, and .csv files as well as .jpg, .png, .webp, .gif, .bmp, and .tiff images, and you can paste an image straight into the message box without saving it first. Images are read by text recognition that runs on your own machine, so a screenshot becomes searchable text, and it is that text, not the picture, that reaches the model. Long documents are split into searchable chunks as they are read, and if a file is large enough to be capped the app tells you plainly which part it kept in full detail.",
    },
    {
      id: "artifacts-and-export",
      title: "Document answers open in a panel you can edit and export",
      body: "When you ask for something written, a draft, a rewrite, a summary, or when you attached a document to the question, a long structured answer opens in a document view of its own on top of the conversation. Ordinary answers stay in the thread, with an Open in panel button on the message if you want one there. The panel enlarges to full screen for reading, allows manual edits inline, and has an ask-the-AI bar for changes like making it shorter. Export offers eight formats, PDF, Word, plain text, Markdown, HTML, Excel, CSV, and JSON, with the most fitting one marked as suggested, and the save location is chosen through your system's normal save dialog. The PDF is genuine selectable text rather than a picture of the page.",
    },
  ],
  guides: [
    {
      slug: "export-ai-responses-to-documents",
      title: "How to Export AI Answers to PDF, Word, and Markdown",
      blurb:
        "Walks through the export menu, the suggested format, and what each file type is good for.",
    },
    {
      slug: "local-document-qa",
      title: "How AI Reads Your PDFs Without Uploading Them",
      blurb:
        "What happens to a document you attach, and why the reading stays on your machine.",
    },
    {
      slug: "things-you-can-do-with-innerzero",
      title: "5 Things You Can Do With InnerZero Right Now",
      blurb:
        "A quick tour of the everyday jobs the chat window handles on day one.",
    },
    {
      slug: "private-ai-like-chatgpt-with-memory-local-pc",
      title: "Private AI Like ChatGPT With Memory, Local on Your Own PC",
      blurb:
        "How a local chat assistant compares to the hosted ones, memory included.",
    },
  ],
  faqs: [
    {
      question: "Does InnerZero chat work without an internet connection?",
      answer:
        "Yes. The app starts in Private mode, where chat runs against a model installed on your own machine, so it answers with the computer offline. Cloud mode is a separate setting you turn on yourself, and while it is on the footer under the chat box says so and states that prompts are sent to your configured providers.",
    },
    {
      question: "Is my chat history saved between sessions?",
      answer:
        "Yes. Messages are written to a session file in the app's own data folder, so the conversation is still there after you close and reopen InnerZero. Clearing the chat removes those messages from view, and the confirmation says plainly that the assistant still remembers what you talked about, because long-term memory is stored separately.",
    },
    {
      question: "What is the difference between Quick and Thinking mode?",
      answer:
        "Quick keeps the context smaller and uses a single reasoning round, which makes everyday answers faster. Thinking uses more context and can take several rounds when a question needs working through. Thinking is the default, and the picker sits in the chat box so you can switch before any message.",
    },
    {
      question: "Can I attach files and images to a chat message?",
      answer:
        "Yes. The paperclip accepts .txt, .md, .pdf, .docx, .xlsx, and .csv files plus common image formats including .jpg, .png, .webp, .gif, .bmp, and .tiff, and you can paste an image straight into the message box. Text is pulled out of images by recognition running on your own machine, and it is that text, not the picture itself, that reaches the model.",
    },
    {
      question: "How do slash commands work in InnerZero?",
      answer:
        "Type a forward slash as the first character of a message and a menu opens above the box, filtering as you type. Routing is deterministic rather than interpreted by the AI: the first word is matched exactly against a registry and the command runs without a model call, so the same command always does the same thing. More than fifty are built in, including /help, /clear, /events, /note, and /recall.",
    },
    {
      question: "Can I export an answer to a document?",
      answer:
        "Yes. Any answer can be exported to PDF, Word, plain text, Markdown, HTML, Excel, CSV, or JSON, and the app marks the format that best fits the content as suggested. You choose where the file goes through your system's normal save dialog, and the PDF contains real selectable text rather than an image of the page.",
    },
  ],
  related: ["memory", "tools", "voice"],
  published: "2026-07-27",
  modified: "2026-07-27",
};
