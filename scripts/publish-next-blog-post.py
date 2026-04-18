#!/usr/bin/env python3
"""
Weekly blog auto-publisher.

Reads the lowest-numbered NN-*.md file from blog-queue/, strips the leading
HTML QUICK-EDIT CHECKLIST comment, substitutes PUBLISH_DATE_PLACEHOLDER in
the frontmatter with today's date (UTC, ISO 8601), writes the result to
src/content/blog/ as slug.mdx (stripping the NN- prefix and converting
.md to .mdx), deletes the queue file, and git-commits the change.

Environment:
  DRY_RUN=1 / true / yes / on  -- print actions without writing or committing

Exit codes:
  0  published one post, or queue empty (no-op)
  1  any error (malformed queue file, missing placeholder, target collision,
     git failure, date-format mismatch with live posts, etc.)
"""

from __future__ import annotations

import datetime as _dt
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUEUE_DIR = ROOT / "blog-queue"
LIVE_DIR = ROOT / "src" / "content" / "blog"

# Existing live posts use `date: "YYYY-MM-DD"` ISO 8601 format. Verified
# against src/content/blog/ai-that-remembers.mdx and two others on
# 2026-04-18. If the live format ever changes, update DATE_FORMAT.
DATE_FORMAT = "%Y-%m-%d"
PLACEHOLDER = "PUBLISH_DATE_PLACEHOLDER"

# Queue filename pattern: NN-slug.md (NN = 2+ digits for future-proofing
# past post 99).
QUEUE_NAME_RE = re.compile(r"^(\d{2,})-(.+)\.md$")

# Leading HTML comment block. Defensive about whitespace and BOM, requires
# the QUICK-EDIT CHECKLIST marker so a legitimate non-checklist leading
# comment isn't accidentally stripped.
COMMENT_RE = re.compile(
    r"\A\s*<!--\s*.*?QUICK-EDIT CHECKLIST.*?-->\s*\n?",
    re.DOTALL,
)


def _truthy(value: str | None) -> bool:
    if not value:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


DRY_RUN = _truthy(os.environ.get("DRY_RUN"))


def log(msg: str) -> None:
    prefix = "[DRY-RUN] " if DRY_RUN else ""
    print(f"{prefix}{msg}", flush=True)


def err(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr, flush=True)


def _verify_date_format_against_live() -> None:
    """Cross-check DATE_FORMAT against an existing live post.

    Never commit a date in a format the site can't parse. If no live posts
    exist yet (fresh repo), we trust the assumption and proceed.
    """
    if not LIVE_DIR.is_dir():
        raise RuntimeError(f"live blog dir missing: {LIVE_DIR}")

    samples = sorted(LIVE_DIR.glob("*.mdx"))
    if not samples:
        log("No existing live posts to cross-check date format against. Proceeding.")
        return

    sample = samples[0]
    text = sample.read_text(encoding="utf-8")
    m = re.search(r'^date:\s*"([^"]+)"', text, re.MULTILINE)
    if not m:
        raise RuntimeError(
            f"could not find a date: line in sample live post {sample.name}. "
            "Refusing to publish until the format is confirmed."
        )
    sample_date = m.group(1)
    try:
        _dt.datetime.strptime(sample_date, DATE_FORMAT)
    except ValueError as e:
        raise RuntimeError(
            f"live post {sample.name} has date {sample_date!r} which does not "
            f"match DATE_FORMAT {DATE_FORMAT!r}. Refusing to publish with the "
            f"wrong format. Update DATE_FORMAT if the site has changed. "
            f"strptime error: {e}"
        )


def _select_next_queue_file() -> Path | None:
    if not QUEUE_DIR.is_dir():
        raise RuntimeError(f"queue dir missing: {QUEUE_DIR}")

    candidates: list[tuple[int, str, Path]] = []
    for path in sorted(QUEUE_DIR.iterdir()):
        if not path.is_file():
            continue
        m = QUEUE_NAME_RE.match(path.name)
        if not m:
            log(f"Skipping non-conforming file in queue: {path.name}")
            continue
        candidates.append((int(m.group(1)), path.name, path))

    if not candidates:
        return None

    candidates.sort(key=lambda c: (c[0], c[1]))
    return candidates[0][2]


def _transform_content(raw: str, publish_date: str) -> str:
    """Strip leading QUICK-EDIT CHECKLIST HTML comment and substitute the
    date placeholder inside the YAML frontmatter."""
    stripped = COMMENT_RE.sub("", raw, count=1)
    if stripped == raw:
        # No leading checklist comment. This is allowed but noteworthy.
        log(
            "No leading QUICK-EDIT CHECKLIST comment found. Continuing "
            "without comment removal."
        )

    if PLACEHOLDER not in stripped:
        raise RuntimeError(
            f"placeholder {PLACEHOLDER!r} not found in queue file content. "
            "Refusing to publish without a valid date token."
        )

    # Isolate the frontmatter (first --- ... --- block after optional
    # leading whitespace) so we only replace the placeholder inside it
    # and never accidentally rewrite the body.
    fm_match = re.search(r"\A\s*(---\n.*?\n---\n)", stripped, re.DOTALL)
    if not fm_match:
        raise RuntimeError(
            "could not locate YAML frontmatter block after comment removal. "
            "Refusing to publish."
        )
    frontmatter = fm_match.group(1)
    body_start = fm_match.end()
    body = stripped[body_start:]

    if PLACEHOLDER not in frontmatter:
        raise RuntimeError(
            f"placeholder {PLACEHOLDER!r} present in body but not in "
            "frontmatter. Refusing to publish (body placeholders are not "
            "supported and suggest a drafting mistake)."
        )

    frontmatter = frontmatter.replace(PLACEHOLDER, publish_date)

    # Preserve whatever leading whitespace preceded the frontmatter.
    leading = stripped[: fm_match.start(1)]
    return leading + frontmatter + body


def _run_git(*args: str) -> None:
    cmd = ["git", *args]
    log(f"$ {' '.join(cmd)}")
    if DRY_RUN:
        return
    result = subprocess.run(cmd, cwd=str(ROOT), check=False)
    if result.returncode != 0:
        raise RuntimeError(f"git command failed with code {result.returncode}: {' '.join(cmd)}")


def main() -> int:
    try:
        _verify_date_format_against_live()
    except Exception as e:
        err(str(e))
        return 1

    try:
        queue_file = _select_next_queue_file()
    except Exception as e:
        err(str(e))
        return 1

    if queue_file is None:
        print("queue empty")
        return 0

    m = QUEUE_NAME_RE.match(queue_file.name)
    assert m is not None  # guaranteed by _select_next_queue_file
    slug = m.group(2)
    target_name = f"{slug}.mdx"
    target_path = LIVE_DIR / target_name

    if target_path.exists():
        err(
            f"refusing to overwrite existing live post at "
            f"{target_path.relative_to(ROOT).as_posix()}. Resolve manually."
        )
        return 1

    try:
        raw = queue_file.read_text(encoding="utf-8")
        publish_date = _dt.datetime.now(_dt.timezone.utc).strftime(DATE_FORMAT)
        new_content = _transform_content(raw, publish_date)
    except Exception as e:
        err(str(e))
        return 1

    log(f"Selected queue file: {queue_file.relative_to(ROOT).as_posix()}")
    log(f"Publish date (UTC):  {publish_date}")
    log(f"Target path:         {target_path.relative_to(ROOT).as_posix()}")

    if DRY_RUN:
        log("DRY_RUN set. Printing first 40 lines of the transformed content:")
        preview = "\n".join(new_content.splitlines()[:40])
        print(preview)
        log(f"Would delete:  {queue_file.relative_to(ROOT).as_posix()}")
        log(f'Would commit: "Auto-publish: {slug}"')
        return 0

    try:
        target_path.write_text(new_content, encoding="utf-8")
        queue_file.unlink()
    except Exception as e:
        err(f"file operation failed: {e}")
        # Attempt to roll back a partial write if we created the live file
        # but failed before unlinking the queue file.
        try:
            if target_path.exists():
                target_path.unlink()
        except Exception:
            pass
        return 1

    try:
        _run_git("add", target_path.relative_to(ROOT).as_posix())
        # `git add` on a deleted path stages the deletion in git 2.0+.
        _run_git("add", queue_file.relative_to(ROOT).as_posix())
        _run_git("commit", "-m", f"Auto-publish: {slug}")
    except Exception as e:
        err(str(e))
        return 1

    print(f"Published: {slug}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
