# Blog scheduler

Local-only browser UI for viewing the InnerZero blog corpus on a month-grid calendar. Read-only. Windows desktop only. Localhost-only HTTP server bound to `127.0.0.1:7878`.

## What it does

Walks `src/content/blog/*.mdx` (published posts) and `blog-queue/*.md` (scheduled posts) on every refresh, parses YAML frontmatter, and renders each post as a colour-coded chip on the day its `date:` field points at. No editing through this UI; clicks deep-link to either the live URL (published posts) or VS Code (queued posts).

## How to launch

Double-click `launch.bat`. It opens your default browser at `http://localhost:7878` and starts the Python server in its own console window.

Requires Python on PATH. No pip dependencies; stdlib only.

## Status colours

- **Green check (Published)** - file lives in `src/content/blog/`.
- **Orange clock (Scheduled)** - file lives in `blog-queue/` with a `date >=` today UTC.
- **Red triangle (Overdue)** - file lives in `blog-queue/` with a `date <` today UTC. Cron should have published it, did not.
- **Red triangle on hatched chip (Error)** - frontmatter is malformed, a required field is missing, or two posts share a `slug:`. Side panel lists the specific reason.
- **Grey pencil (Draft)** - file lives in `blog-queue/` with `draft: true`.

## How the side panel works

The right side panel is always visible at 360 px wide. It has three states:

- **Default (empty state):** shows a board of useful links - site URLs, repo folders, Discord, dashboards. This is what you see on first load.
- **Hover preview:** hovering any chip on the calendar fills the panel with that post's details. Moving your mouse off the chip leaves the content as it was. The panel does not auto-close.
- **Selected:** clicking a chip marks it with an outline ring and fills the panel with its details. Click another chip to switch. Click the home icon at the top of the panel to return to the link board.

The panel is permanent. The calendar always sits to its left at the remaining width. To act on the post currently shown, use the "Open live URL" or "Edit in VS Code" buttons at the bottom of the panel; live URL is enabled only for published posts.

## Filters and search

- Filter pills at the top of the page show or hide posts by status (Published, Scheduled, Overdue, Errors, Drafts). Toggle state persists across launches via localStorage.
- The search box filters by case-insensitive substring across title, slug, and tags. Stats line shows "X of Y" while a search or filter is active.
- Tag pills inside the side panel are clickable. Clicking a tag fills the search box with that tag and filters the calendar to it; clicking the same tag again clears the filter.

## Keyboard shortcuts

- Left / Right arrows: previous / next month
- T: jump to today
- /: focus the search box
- Esc: clear search; if no search, blur the focused input
- ?: toggle the keyboard shortcut help overlay

The help overlay is also reachable from the "?" icon in the top right of the page.

## How to stop it

Close the launcher console window. The server is attached to that console, so the Python process exits cleanly with it.

## Known limits

- Windows desktop only (the launcher is a `.bat` file). Linux/macOS users would need a one-line `.sh` wrapper; not shipped in v1.
- Localhost only by design. The bind address is hardcoded to `127.0.0.1` so the file paths in the JSON payload never reach anything outside this machine.
- Read-only. Editing the calendar does not write back to disk; use VS Code or the Front Matter CMS extension for that.
