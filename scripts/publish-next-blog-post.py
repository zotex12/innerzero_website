#!/usr/bin/env python3
"""
Weekly blog auto-publisher (date-based scheduling).

Phase 2026-05-03: switched from NN-prefix ordering to frontmatter `date:`
field so the queue is visually schedulable in Front Matter CMS. Each queue
file now carries a real publish date in its frontmatter; the script picks
the file with the earliest `date <= today UTC` (filename alphabetical
tie-break) and publishes it.

Behaviour per file selected:
  - Strip the leading QUICK-EDIT CHECKLIST HTML comment if present.
  - Substitute any remaining PUBLISH_DATE_PLACEHOLDER tokens in the body
    with the frontmatter's date value. The frontmatter `date:` line is
    already a real ISO date (set by the human editor) and is left
    untouched, but a small subset of legacy queue files reference the
    same placeholder inline in body copy (e.g. "Last verified:" lines).
    Those would otherwise leak the literal token onto the live site.
  - Write to src/content/blog/<original_stem>.mdx (the queue filename
    minus its .md extension, plus .mdx).
  - Delete the queue file and git-add both paths, then git-commit.

Robustness:
  - Files with missing or malformed frontmatter are skipped with a
    warning instead of aborting (one bad file no longer blocks a good
    one).
  - Empty queue or all-future-dated queue exits 0 cleanly. The workflow's
    empty-push guard handles the no-commit case.

Environment:
  DRY_RUN=1 / true / yes / on  -- print actions without writing or committing

Exit codes:
  0  published one post, OR no candidates due today (clean no-op)
  1  any error (target collision, git failure, date-format mismatch with
     live posts, live blog dir missing, queue dir missing, etc.)
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

# Leading HTML comment block. Defensive about whitespace and BOM, requires
# the QUICK-EDIT CHECKLIST marker so a legitimate non-checklist leading
# comment isn't accidentally stripped.
COMMENT_RE = re.compile(
    r"\A\s*<!--\s*.*?QUICK-EDIT CHECKLIST.*?-->\s*\n?",
    re.DOTALL,
)

# YAML frontmatter block matcher: optional leading whitespace, then
# `---\n...\n---\n`. Same shape used by the live site's MDX loader.
FRONTMATTER_RE = re.compile(r"\A\s*---\n(.*?)\n---\n", re.DOTALL)

# Match `date: "YYYY-MM-DD"` (or single-quoted, or unquoted) inside a
# frontmatter block. Tolerant of trailing whitespace and Windows line
# endings. Captures the bare date token only.
DATE_LINE_RE = re.compile(
    r"^date:\s*['\"]?(\d{4}-\d{2}-\d{2})['\"]?\s*$",
    re.MULTILINE,
)


def _truthy(value: str | None) -> bool:
    if not value:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


DRY_RUN = _truthy(os.environ.get("DRY_RUN"))


def log(msg: str) -> None:
    prefix = "[DRY-RUN] " if DRY_RUN else ""
    print(f"{prefix}{msg}", flush=True)


def warn(msg: str) -> None:
    print(f"WARN: {msg}", flush=True)


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


def _extract_frontmatter_date(raw: str) -> _dt.date | None:
    """Return the parsed frontmatter date, or None if missing/malformed.

    Tries python-frontmatter first if available, falls back to the
    regex-based parser. The fallback is what runs in CI (the workflow
    does not pip-install anything).

    Strips any leading QUICK-EDIT CHECKLIST HTML comment before parsing
    so frontmatter detection works on queue files that carry the
    pre-publish checklist as a leading comment block.
    """
    # Strip a leading UTF-8 BOM if present, then the leading HTML comment
    # (if any), so both the python-frontmatter parser and the regex
    # fallback see the `---` block at position 0. \s in Python regex does
    # not match U+FEFF (it's category Cf, not Zs) so the BOM strip has to
    # be explicit.
    if raw.startswith("﻿"):
        raw = raw[1:]
    cleaned = COMMENT_RE.sub("", raw, count=1)

    # Optional fast path via python-frontmatter (developer convenience;
    # never required, never imported as a hard dependency).
    try:
        import frontmatter  # type: ignore[import-not-found]

        post = frontmatter.loads(cleaned)
        date_value = post.metadata.get("date")
        if date_value is None:
            return None
        if isinstance(date_value, _dt.date) and not isinstance(date_value, _dt.datetime):
            return date_value
        if isinstance(date_value, _dt.datetime):
            return date_value.date()
        if isinstance(date_value, str):
            return _dt.datetime.strptime(date_value, DATE_FORMAT).date()
        return None
    except ImportError:
        pass
    except (ValueError, KeyError):
        return None
    except Exception:
        # Fall through to the regex path on any other parser error.
        pass

    # Regex fallback: locate the frontmatter block, then the date line.
    fm_match = FRONTMATTER_RE.search(cleaned)
    if not fm_match:
        return None
    fm_block = fm_match.group(1)
    date_match = DATE_LINE_RE.search(fm_block)
    if not date_match:
        return None
    try:
        return _dt.datetime.strptime(date_match.group(1), DATE_FORMAT).date()
    except ValueError:
        return None


def _select_next_queue_file(today_utc: _dt.date) -> Path | None:
    """Pick the queue file with the earliest date <= today UTC.

    Tie-break on filename (alphabetical). Returns None if no candidate is
    due. Files with missing or malformed frontmatter are skipped with a
    warning.
    """
    if not QUEUE_DIR.is_dir():
        raise RuntimeError(f"queue dir missing: {QUEUE_DIR}")

    candidates: list[tuple[_dt.date, str, Path]] = []
    for path in sorted(QUEUE_DIR.iterdir()):
        if not path.is_file():
            continue
        if path.suffix != ".md":
            log(f"Skipping non-.md file in queue: {path.name}")
            continue

        try:
            raw = path.read_text(encoding="utf-8")
        except OSError as e:
            warn(f"Could not read {path.name}: {e}. Skipping.")
            continue

        date_value = _extract_frontmatter_date(raw)
        if date_value is None:
            warn(
                f"{path.name}: missing or malformed frontmatter `date:` "
                "field. Skipping."
            )
            continue

        if date_value > today_utc:
            # Future-dated, not yet due.
            continue

        candidates.append((date_value, path.name, path))

    if not candidates:
        return None

    # Earliest date wins; alphabetical filename breaks ties so behaviour
    # is deterministic when two files share the same date.
    candidates.sort(key=lambda c: (c[0], c[1]))
    return candidates[0][2]


def _split_frontmatter_and_body(raw: str) -> tuple[str, str, str]:
    """Return (leading_whitespace, frontmatter_block, body) for a file.

    The frontmatter_block includes the wrapping `---` lines and trailing
    newline. body is everything after.
    """
    fm_match = FRONTMATTER_RE.search(raw)
    if not fm_match:
        raise RuntimeError(
            "could not locate YAML frontmatter block. Refusing to publish."
        )
    leading = raw[: fm_match.start()]
    frontmatter_block = raw[fm_match.start() : fm_match.end()]
    body = raw[fm_match.end() :]
    return leading, frontmatter_block, body


def _transform_content(raw: str, publish_date: str) -> str:
    """Strip the QUICK-EDIT comment and substitute any body PUBLISH_DATE
    tokens with the frontmatter's date value.

    Phase 2026-05-03 deviation: the frontmatter date is already real
    (set by the human editor when scheduling) so we do NOT replace it.
    But a small subset of legacy queue files reference the same
    PUBLISH_DATE_PLACEHOLDER token inline in body copy (e.g. "Last
    verified:" lines). Those would otherwise leak the literal token to
    the live site, so we substitute them using the frontmatter's date
    value as the source of truth.
    """
    stripped = COMMENT_RE.sub("", raw, count=1)
    if stripped == raw:
        log(
            "No leading QUICK-EDIT CHECKLIST comment found. Continuing "
            "without comment removal."
        )

    leading, frontmatter_block, body = _split_frontmatter_and_body(stripped)

    if PLACEHOLDER in body:
        replacements = body.count(PLACEHOLDER)
        body = body.replace(PLACEHOLDER, publish_date)
        log(
            f"Substituted {replacements} body PUBLISH_DATE_PLACEHOLDER token(s) "
            f"with {publish_date!r}."
        )

    if PLACEHOLDER in frontmatter_block:
        # Defensive: a freshly-scheduled file should always have a real
        # date in its frontmatter, but if it slipped through, substitute
        # so the live post is well-formed rather than blocking publish.
        frontmatter_block = frontmatter_block.replace(PLACEHOLDER, publish_date)
        warn(
            f"Frontmatter still contained PUBLISH_DATE_PLACEHOLDER. "
            f"Substituted with {publish_date!r}, but please set a real "
            "frontmatter date when scheduling new posts."
        )

    return leading + frontmatter_block + body


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

    today_utc = _dt.datetime.now(_dt.timezone.utc).date()

    try:
        queue_file = _select_next_queue_file(today_utc)
    except Exception as e:
        err(str(e))
        return 1

    if queue_file is None:
        print("queue empty or all future-dated, exiting cleanly")
        return 0

    slug = queue_file.stem  # filename without the .md extension
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
        # The frontmatter date is the source of truth (set by the human
        # editor when scheduling). _select_next_queue_file already
        # validated it parses correctly; re-extract here for body
        # substitution.
        publish_date_value = _extract_frontmatter_date(raw)
        if publish_date_value is None:
            err(
                f"unexpected: {queue_file.name} parsed as a candidate but "
                "frontmatter date no longer extracts. Refusing to publish."
            )
            return 1
        publish_date = publish_date_value.strftime(DATE_FORMAT)
        new_content = _transform_content(raw, publish_date)
    except Exception as e:
        err(str(e))
        return 1

    log(f"Selected queue file: {queue_file.relative_to(ROOT).as_posix()}")
    log(f"Frontmatter date:    {publish_date}")
    log(f"Today (UTC):         {today_utc.strftime(DATE_FORMAT)}")
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
