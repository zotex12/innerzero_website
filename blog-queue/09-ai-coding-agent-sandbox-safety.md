<!--
QUICK-EDIT CHECKLIST (before publish day):
- [ ] Verify no factual claims are stale (agent safety models, competitor feature sets)
- [ ] Re-check Cursor Composer, Continue, Aider, and Devin current sandbox behaviour
- [ ] Confirm InnerZero's approval flow description still matches what ships
- [ ] Update if any major AI coding tool has added or removed safety features
- [ ] Refresh the examples of "things an agent shouldn't do" if new incidents have become public
-->
---
title: "Why Every AI Coding Agent Should Have a Sandbox"
description: "AI coding agents shouldn't have free run of your disk. What a proper sandbox looks like, why most agents don't have one, and what to check before trusting any."
date: "PUBLISH_DATE_PLACEHOLDER"
author: "Louie"
authorRole: "Founder"
slug: "ai-coding-agent-sandbox-safety"
tags: ["coding agent", "privacy", "guide"]
readingTime: "7 min read"
featured: false
---

I've watched AI coding agents do things I didn't ask them to. **Delete files. Modify config outside the project directory. Write to places they shouldn't. Try to install packages that weren't on the task list.** Most of the time nothing bad happens because the task was boring and the agent stayed on rails. Occasionally something goes wrong and it becomes painfully clear that the safety model wasn't what you assumed it was.

This is about why **AI coding agents need a sandbox**, what one looks like, and why most popular tools don't have one worth the name.

> **Quick summary**
> - A sandbox is a boundary an agent physically can't cross, enforced by the tool, not the model
> - Most cloud AI coding agents don't have a proper sandbox; they rely on model alignment to stay inside the task
> - InnerZero's coding agent uses file-level path sandboxing with two approval gates
> - Trusting model alignment alone is fine until it isn't

## What does "sandbox" actually mean for an AI coding agent?

**A sandbox is a hard limit on what the agent can read, write, or execute, enforced at the tool layer rather than the model layer.** The model can decide to write to `/etc/passwd`. The sandbox makes that request fail before any file is touched. No matter what the model says, the boundary holds.

The key word is "hard". Most coding agents have soft limits: the system prompt says "don't modify files outside the project root", and the model usually complies. Usually. Model compliance isn't a security feature. It's a likelihood.

Proper sandboxing involves:

- **File access restriction.** The agent can only read and write files in explicitly granted paths
- **Execution restriction.** The agent can't run arbitrary shell commands or scripts
- **Network restriction.** The agent can't make outbound HTTP calls beyond its own AI inference
- **Confirmation gates.** High-impact actions (writes, deletions) require human approval
- **Snapshots for rollback.** Changes can be undone cleanly if something goes wrong

If any of those is missing or soft-enforced, the agent isn't really sandboxed. It's just well-behaved.

## Why don't most AI coding agents have proper sandboxes?

**Because sandboxing is friction, and friction is the enemy of user experience in demo mode.** The more constraints you add, the less impressive the "look, it just did everything for you" demo feels. Agent tooling has trended toward maximum autonomy, which is the opposite direction from sandboxing.

The specific reasons:

- **Cloud-hosted agents** often run in ephemeral containers, which are sandboxes-in-a-sense, but those containers usually have broad permissions within themselves. The sandbox is the container boundary, not a per-file gate.
- **Local-machine agents** often run with your user's full permissions, which means anything you can do, the agent can do. Delete, modify, install, whatever.
- **Model-alignment-only** safety assumes the model will stay on task. It usually does. Exceptions happen when the model hallucinates a destructive command.
- **Speed pressure.** Approval gates slow down autonomous flow. Vendors optimising for "agentic" feel often remove them.

I'll name a concrete example rather than dance around it. Cursor's Composer is impressive at multi-file edits. It also runs with full access to your project directory, and its safety model is "the model is trained not to do bad things". That's usually fine. It's also why I won't run Composer on my production code without reviewing every diff.

## How does InnerZero's coding agent sandbox work?

**InnerZero's coding agent is restricted to explicit file paths you grant for the task, can't execute code, and requires approval before any write touches disk.** The sandbox is enforced at the path-validation layer, so the agent physically cannot access files outside what you've granted.

The flow:

1. You start a coding task and grant access to specific files or directories
2. The agent can read and write within those paths only
3. Every proposed file write is staged in memory, not written to disk
4. You see a full diff of every change, every new file, every deletion
5. You approve the diff or reject it
6. Only on approval do writes actually land on disk
7. When the task ends, the grants are revoked

Files outside your grant are invisible to the agent. It can't read them, even if it tries. The path validation happens at the file-access layer before any I/O, not through a prompt that says "please don't".

This is the pattern. Hard limits, enforced by code, backed by approval gates, with rollback as a safety net. It's not the fastest possible UX, but it's the one I can actually trust on real codebases.

## What about packages and shell commands?

**InnerZero's coding agent currently can't install packages, run scripts, or execute arbitrary commands. It's read and write only.** This is a deliberate choice. Once an agent can execute code, the safety story gets much harder.

Package installation and script execution are capabilities users genuinely want. Agents that can set up their own dependencies, run tests, and verify their work end-to-end are more useful than agents that just write code. But the safety model for execution is fundamentally different from the safety model for file I/O. You need process-level sandboxing, resource limits, network controls, and more.

The honest answer: I'd rather ship a narrow, trustworthy agent than a broad, scary one. Some day InnerZero will probably grow execution capabilities, and when it does, those will be behind proper sandboxing and additional approval gates. Until then, the agent does what it does safely.

## What should I check before trusting any AI coding agent with my code?

**Six questions.** If the tool you're evaluating can't answer these cleanly, you don't have a sandbox. You have a hope.

1. Which files can the agent read?
2. Which files can the agent write?
3. Can the agent delete files, and if so, is approval required?
4. Can the agent execute commands or scripts?
5. What happens if the model asks to do something destructive?
6. Can I undo the agent's work after the fact?

A tool with answers like "any file in this project", "any file in this project", "yes without approval", "yes", "the model is trained not to", "no" is not a tool you should trust with code that matters. Those answers describe a lot of popular AI coding assistants.

A tool with answers like "files you grant", "files you grant, after approval", "yes but with approval", "no", "the file access layer refuses", "yes via snapshots" is actually sandboxed.

## Comparison table: coding agent safety by tool

| Feature | InnerZero | Cursor Composer | Aider | Devin |
|---------|-----------|-----------------|-------|-------|
| File-level path sandbox | Yes | Limited to project | Limited to git repo | Container-level |
| Approval before write | Yes (diff review) | Yes (preview) | Yes (confirm) | Varies |
| Execution allowed | No | Via terminal tools | Via shell command | Yes (remote) |
| Rollback via snapshots | Yes | Git-based | Git-based | Session-based |
| Can delete files | Yes, with approval | Yes | Yes | Yes |
| Runs locally | Yes | Yes (editor) | Yes | Remote |

No agent is perfect. InnerZero, Aider, and Cursor all have approval flows. The differences are in enforcement strength and scope.

## Are two approval gates better than one?

**Yes, because they catch different classes of problems.** The first gate (plan approval) lets you reject a bad approach before the agent writes anything. The second gate (diff review) lets you catch specific mistakes the agent made while executing a good plan.

I've seen both gates matter:

- Plan approval caught an agent that wanted to "refactor" by deleting the existing code and rewriting from scratch
- Diff review caught an agent that correctly implemented my requested change but also silently modified an unrelated file it shouldn't have touched

One gate would have missed one of those. Two gates cost you about 30 seconds per task and save you from writing dangerous things to disk.

## Frequently asked questions

### Can I turn off the approval gates for faster workflow?

You can configure some autoapprove behaviour in InnerZero's Settings, but by default both gates are on. I don't recommend turning them off for real code. The time saved is small, and the downside of a rogue write is large. Autoapprove makes sense for sandboxed experimental projects where you don't care if the agent breaks something.

### What if I approve the diff but the code is buggy?

The agent wrote bad code. That's not a sandbox failure, it's a model quality issue. Review the output, reject, ask again. The sandbox protects against unintended destruction, not against suboptimal output.

### Does the sandbox affect performance?

Negligibly. Path validation is a handful of function calls per file access, way below the noise floor of model inference time. You won't notice it.

### Can I see what the agent did after the fact?

Yes. InnerZero keeps a log of all agent actions, and the snapshots from before each write let you roll back cleanly. The audit trail is local only, no cloud reporting.

### What about when using a cloud model for the coding agent?

The sandbox is enforced at the file-access layer in InnerZero, independent of which model provides the reasoning. Whether you're using local qwen2.5-coder or cloud Claude Opus 4.7 via BYO, the same sandbox rules apply. The model changes; the safety model doesn't.

## Try it yourself

[Download InnerZero](/download) for Windows, macOS, or Linux. The coding agent ships with proper sandboxing enabled by default. If you want the broader context on how the coding agent works, [why I built a coding agent that runs offline](/blog/offline-coding-agent) covers the design decisions, and [InnerZero vs Cursor](/blog/innerzero-vs-cursor) compares the two tools directly on safety and capability.
