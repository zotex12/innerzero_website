import type { FeatureCategory } from "./types";

export const screenAutomation: FeatureCategory = {
  slug: "screen-automation",
  navLabel: "Screen Automation",
  h1: "Let your AI use the apps on your PC",
  seoTitle: "AI That Can Control Your Windows PC - InnerZero",
  seoDescription:
    "InnerZero reads your screen and can click, type and scroll in Windows apps. It ships switched off, asks before each action, and Escape aborts the action.",
  hubTeaser:
    "Reads the screen and clicks, types, and scrolls for you. Off until you turn it on.",
  leadIn:
    "Handing an AI control of your mouse and keyboard is a much bigger ask than letting it answer a question. The worry is not really what it can do, it is what happens when it does the wrong thing: whether the switch was on without you noticing, and whether there is an obvious way to make it stop.",
  leadOut:
    "So the answer starts with the defaults. Screen automation is off on a fresh install, you turn it on yourself, every click and keystroke asks for your approval, and Escape aborts the action that is running. What it can actually do comes after that.",
  stats: [
    { value: "Off", label: "State on a fresh install" },
    { value: "Esc", label: "Aborts the action in flight" },
    { value: "3", label: "Actions it can take" },
  ],
  capabilities: [
    {
      id: "off-by-default",
      title: "Switched off until you turn it on",
      body: "Screen automation ships disabled. The switch lives in Settings, on the Experimental tab, under the Screen Control heading, and while it is off the screen tools do nothing at all except return a message saying the feature is disabled. Nothing is watching your screen or your keyboard in the meantime, because the parts that would do the watching are not started until you enable it.",
    },
    {
      id: "emergency-stop",
      title: "Escape aborts the action that is running",
      body: "While screen control is on, InnerZero registers a system-wide keyboard hook, so Escape reaches it whether or not the app is the window you are looking at. Pressing it clears the running-automation flag, and the screen tools check that flag again immediately before they act, so an action that has not been dispatched yet is abandoned rather than run. If automation was running when you pressed it, you get an \"Automation stopped\" notice. It is not a run-level halt: each screen tool re-arms that flag when it starts, so approvals, not Escape, are what keep the next action from happening.",
    },
    {
      id: "approval-before-each-action",
      title: "Approval before every click and keystroke",
      body: "By default each proposed action becomes an approval card in chat naming the action: the numbered element to be clicked, the text to be typed and the numbered field it goes into, or the scroll direction and distance. Nothing runs until you approve it, and a staged approval expires after five minutes and is only ever held in memory, never written to disk. A separate Auto-Execute Actions switch, which appears only once screen control is on, skips that confirmation and carries its own warning where you turn it on.",
    },
    {
      id: "reads-the-window-tree",
      title: "It reads the window tree, not pixels",
      body: "Reading the screen means walking the Windows accessibility tree, the same interface screen readers use, rather than taking a picture. What comes back is a numbered list of up to 30 interactive elements in one window, with their type and label, so buttons, links, text fields, tabs, menu items and list items. InnerZero's own windows are excluded, so the assistant reads the app you are working in rather than itself, and if you name a window that is not open it tells you which windows are.",
    },
    {
      id: "click-type-scroll",
      title: "Click, type, scroll",
      body: "Those three actions are the whole vocabulary. A click refers to an element by its number from the last read, typing goes into a numbered field or into whatever currently has focus, and scrolling sends wheel input at the mouse pointer, so it moves whatever is under the cursor rather than a window you named. When the assistant clicks a window's minimise, maximise, restore or close button it checks whether the window state actually changed and says plainly when the click may not have taken effect, rather than reporting success either way.",
    },
    {
      id: "what-the-model-sees",
      title: "What the model is allowed to see",
      body: "When a window is read, the contents of text-entry fields are replaced with [REDACTED] before the result reaches the AI. The model learns that the field has something in it, which is what it needs in order to decide what to do next, but never what that something is, so a password box stays out of the conversation. Element labels are passed through as they are, so text an app displays on the page rather than holds in an entry field is not covered by that substitution. Reading the tree and dispatching the click both happen on your machine; if you have switched the Director over to a cloud provider, the element list travels with your prompt like any other tool result.",
    },
    {
      id: "logged-and-paced",
      title: "Every action is recorded and paced",
      body: "Each read, click, keystroke and emergency stop is written to the app's activity log on your machine, so a run can be reconstructed after the fact. Actions are rate limited to five per second, which stops a confused loop from spraying clicks faster than you could react to them. While screen control is on there is a SCREEN marker in the status bar, and it turns red when auto-execute is on, so the more permissive setting is never invisible.",
    },
    {
      id: "per-tool-switches",
      title: "Turn off individual actions",
      body: "The four screen tools are listed separately in Settings under Tools, alongside every other tool the assistant can reach. Switching one off takes it out of the set the AI is offered, and a plan that names a tool it was not offered is refused before it runs, so you can leave reading available while keeping clicking and typing off. That sits underneath the master Screen Control switch rather than replacing it.",
    },
    {
      id: "windows-only",
      title: "Windows only in this release",
      body: "Screen automation works on Windows. InnerZero itself runs on Windows, macOS and Linux, but on macOS and Linux this particular feature reports that it is not available on that platform yet rather than half working, and the setting has no effect there. Worth knowing before you pick a machine to try it on.",
    },
  ],
  guides: [
    {
      slug: "screen-automation-private-ai",
      title: "How Screen Automation Works in a Private AI Assistant",
      blurb:
        "The longer read on how screen reading and acting work, what the safety gates cover, and where the feature struggles.",
    },
  ],
  faqs: [
    {
      question: "Is screen automation on by default?",
      answer:
        "No. It is off on a fresh install and stays off until you switch it on yourself in Settings, on the Experimental tab, under Screen Control. While it is off the screen tools do nothing except return a message saying the feature is disabled.",
    },
    {
      question: "How do I stop the AI mid-action?",
      answer:
        "Press Escape. InnerZero registers a system-wide keyboard hook while screen control is on, so Escape reaches it even when the app is not the window you are looking at. The screen tools check the stop flag again immediately before they act, so an action that has not been dispatched yet is abandoned rather than run, and the app shows an \"Automation stopped\" notice. It aborts that one action rather than the whole sequence: approvals are what hold the next one back.",
    },
    {
      question: "Does InnerZero take screenshots of my screen?",
      answer:
        "No. It reads the Windows accessibility tree, the same interface screen readers use, and gets back a numbered list of interactive elements with their type and label. No image of your screen is captured.",
    },
    {
      question: "Does the AI ask before it clicks or types?",
      answer:
        "Yes, by default. Each proposed action becomes an approval card in chat naming the action, the numbered element to be clicked, the text to be typed and the field it goes into, or the scroll direction and distance, and nothing runs until you approve it. A staged approval expires after five minutes and is held in memory only. A separate Auto-Execute Actions switch skips that confirmation if you decide you want it to.",
    },
    {
      question: "Can the AI see what I typed into a password box?",
      answer:
        "No. When a window is read, the contents of text-entry fields are replaced with [REDACTED] before the result reaches the model. It is told the field has content, but not what the content is. Labels and text an app draws on the page are passed through as written, so the protection covers what you type into a field, not everything on screen.",
    },
    {
      question: "Does screen automation work on Mac or Linux?",
      answer:
        "Not in this release. Screen automation is Windows only. On macOS and Linux the screen tools report that the feature is not available on that platform yet, and the setting has no effect there. The rest of InnerZero runs on all three.",
    },
  ],
  related: ["action-hub", "tools", "specialists"],
  published: "2026-07-27",
  modified: "2026-07-27",
};
