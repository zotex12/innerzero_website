# Blog scheduler

Local-only browser UI for viewing the InnerZero blog corpus on a month-grid calendar. Read-only. Windows desktop only. Localhost-only HTTP server bound to `127.0.0.1:7878`.

## What it does

Walks `src/content/blog/*.mdx` (published posts) and `blog-queue/*.md` (scheduled posts) on every refresh, parses YAML frontmatter, and renders each post as a colour-coded chip on the day its `date:` field points at. No editing through this UI; clicks deep-link to either the live URL (published posts) or VS Code (queued posts).

## How to launch

Double-click `launch.bat`. It opens your default browser at `http://localhost:7878` and starts the Python server in its own console window.

Requires Python on PATH. No pip dependencies; stdlib only.

## Status colours

- **Green check (Published)** - file lives in `src/content/blog/`. Click opens `https://innerzero.com/blog/<slug>` in a new tab.
- **Orange clock (Scheduled)** - file lives in `blog-queue/` with a `date >=` today UTC. Click opens VS Code on the file.
- **Red triangle (Overdue)** - file lives in `blog-queue/` with a `date <` today UTC. Cron should have published it, did not. Click opens VS Code so you can fix or move it.
- **Red triangle on hatched chip (Error)** - frontmatter is malformed, a required field is missing, or two posts share a `slug:`. Side panel lists the specific reason.
- **Grey pencil (Draft)** - file lives in `blog-queue/` with `draft: true`. Click opens VS Code.

## What clicking a chip does

- Single click opens the relevant target (live URL for published, VS Code for everything else) and pops the side panel with the post's full details.
- Hover or keyboard focus also opens the side panel without navigating.
- The side panel's "Open live URL" button is disabled for non-published posts; "Edit in VS Code" works for every post.

## How to stop it

Close the launcher console window. The server is attached to that console, so the Python process exits cleanly with it.

## Known limits

- Windows desktop only (the launcher is a `.bat` file). Linux/macOS users would need a one-line `.sh` wrapper; not shipped in v1.
- Localhost only by design. The bind address is hardcoded to `127.0.0.1` so the file paths in the JSON payload never reach anything outside this machine.
- Read-only. Editing the calendar does not write back to disk; use VS Code or the Front Matter CMS extension for that.
