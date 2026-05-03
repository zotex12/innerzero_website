"""
Local blog scheduler HTTP server.

Read-only viewer for the InnerZero blog corpus. Walks src/content/blog/
and blog-queue/, parses YAML frontmatter, and returns a JSON snapshot of
every post with status (published, scheduled, overdue, error, draft).

Python 3.12 stdlib only. No pip dependencies.
Bind: 127.0.0.1:7878 (never 0.0.0.0; this tool exposes file paths).

Frontmatter parsing mirrors the discipline of
scripts/publish-next-blog-post.py: the same `_normalise_text` BOM + CRLF
strip, the same YAML subset (quoted strings, inline lists, booleans).
"""

from __future__ import annotations

import datetime as _dt
import json
import re
import sys
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

HOST = "127.0.0.1"
PORT = 7878

THIS_DIR = Path(__file__).resolve().parent
REPO_ROOT = THIS_DIR.parent.parent
LIVE_DIR = REPO_ROOT / "src" / "content" / "blog"
QUEUE_DIR = REPO_ROOT / "blog-queue"

LIVE_BASE_URL = "https://innerzero.com/blog/"

# Publishing schedule: matches `.github/workflows/blog-auto-publish.yml`
# (Tuesday + Friday 09:00 UTC). Hardcoded here as a single source of truth
# for the UI; if the cron ever changes, update both the workflow file and
# these two constants.
CRON_EXPRESSION = "0 9 * * 2,5"
PUBLISH_TIME_UTC = "09:00"

DATE_FORMAT = "%Y-%m-%d"
QUICK_EDIT_COMMENT_RE = re.compile(
    r"\A\s*<!--\s*.*?-->\s*\n?",
    re.DOTALL,
)
FRONTMATTER_RE = re.compile(r"\A\s*---\n(.*?)\n---\n?", re.DOTALL)
INLINE_LIST_RE = re.compile(r"^\[(.*)\]$")


def _normalise_text(raw: str) -> str:
    """Strip a leading UTF-8 BOM and normalise CRLF to LF.

    Mirrors scripts/publish-next-blog-post.py::_normalise_text.
    """
    if raw.startswith("﻿"):
        raw = raw[1:]
    if "\r\n" in raw:
        raw = raw.replace("\r\n", "\n")
    return raw


def _strip_quotes(value: str) -> str:
    v = value.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ('"', "'"):
        return v[1:-1]
    return v


def _parse_scalar(value: str) -> Any:
    """Parse a YAML scalar value: bool, int, quoted string, or bare string."""
    v = value.strip()
    if not v:
        return ""
    lower = v.lower()
    if lower in ("true", "yes"):
        return True
    if lower in ("false", "no"):
        return False
    if lower == "null" or lower == "~":
        return None
    if v[0] in ('"', "'"):
        return _strip_quotes(v)
    try:
        if v.isdigit() or (v.startswith("-") and v[1:].isdigit()):
            return int(v)
    except ValueError:
        pass
    return v


def _parse_inline_list(body: str) -> list:
    """Parse `["a", "b", "c"]` style inline YAML/JSON list."""
    inner = body.strip()
    if not inner:
        return []
    items: list = []
    buf = ""
    in_str: str | None = None
    for ch in inner:
        if in_str is not None:
            if ch == in_str:
                in_str = None
            buf += ch
            continue
        if ch in ('"', "'"):
            in_str = ch
            buf += ch
            continue
        if ch == ",":
            items.append(_parse_scalar(buf))
            buf = ""
            continue
        buf += ch
    if buf.strip():
        items.append(_parse_scalar(buf))
    return items


def _parse_frontmatter(body: str) -> tuple[dict, list[str]]:
    """Return (metadata, errors). Metadata is empty dict on hard failure.

    The minimal YAML subset we need: top-level `key: value` lines where
    value is a quoted string, an inline list, a boolean, or a bare token.
    Block-style lists (- a\n- b) are not used by the blog schema, so we
    do not parse them.
    """
    errors: list[str] = []
    cleaned = QUICK_EDIT_COMMENT_RE.sub("", body, count=1)
    fm = FRONTMATTER_RE.search(cleaned)
    if not fm:
        errors.append("missing or malformed YAML frontmatter")
        return {}, errors

    block = fm.group(1)
    out: dict = {}
    for raw_line in block.split("\n"):
        line = raw_line.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        # Block-style list members (- foo) inside frontmatter are not
        # used by the blog schema; if one appears it is a malformed
        # entry, skip silently.
        if line.lstrip().startswith("-"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if not key:
            continue
        list_match = INLINE_LIST_RE.match(value)
        if list_match:
            out[key] = _parse_inline_list(list_match.group(1))
        else:
            out[key] = _parse_scalar(value)
    return out, errors


def _parse_iso_date(value: Any) -> _dt.date | None:
    if not isinstance(value, str):
        return None
    try:
        return _dt.datetime.strptime(value.strip(), DATE_FORMAT).date()
    except ValueError:
        return None


def _today_utc() -> _dt.date:
    return _dt.datetime.now(_dt.timezone.utc).date()


def _read_post(path: Path) -> tuple[dict, list[str]]:
    """Read a post file, normalise text, parse frontmatter."""
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError as e:
        return {}, [f"could not read file: {e}"]
    raw = _normalise_text(raw)
    return _parse_frontmatter(raw)


def _classify(folder: str, meta: dict, errors: list[str]) -> str:
    """Pick a status string from {published, scheduled, overdue, draft, error}.

    Slug-collision flagging happens later, in _build_payload, after the
    full file list is loaded.
    """
    if errors:
        return "error"
    if folder == "published":
        return "published"
    # queue folder
    if meta.get("draft") is True:
        return "draft"
    parsed_date = _parse_iso_date(meta.get("date"))
    if parsed_date is None:
        return "error"
    if parsed_date < _today_utc():
        return "overdue"
    return "scheduled"


def _post_dict(path: Path, folder: str) -> dict:
    """Build the JSON-shaped dict for a single post."""
    meta, errors = _read_post(path)

    # Required-field checks beyond raw frontmatter parsing.
    if meta:
        for required in ("title", "slug", "date"):
            value = meta.get(required)
            if value is None or (isinstance(value, str) and not value.strip()):
                errors.append(f"missing required field: {required}")
        # Date validity check — only flag if the field is present but
        # not parseable. Missing date is already covered above.
        if "date" in meta and meta.get("date") and _parse_iso_date(meta["date"]) is None:
            errors.append(f"unparseable date: {meta['date']!r}")

    status = _classify(folder, meta, errors)

    # Path strings: backslashed for filepath_abs (Windows-native) and
    # forward-slashed for vscode_url (the vscode://file/ scheme).
    abs_path = str(path.resolve())
    abs_forward = abs_path.replace("\\", "/")
    vscode_url = f"vscode://file/{abs_forward}"

    slug = meta.get("slug") if isinstance(meta.get("slug"), str) else ""
    live_url = f"{LIVE_BASE_URL}{slug}" if slug else ""

    tags_raw = meta.get("tags", [])
    if isinstance(tags_raw, list):
        tags = [str(t) for t in tags_raw]
    elif isinstance(tags_raw, str) and tags_raw.strip():
        tags = [tags_raw.strip()]
    else:
        tags = []

    return {
        "filename": path.name,
        "filepath_abs": abs_path,
        "folder": folder,
        "status": status,
        "title": meta.get("title", "") if isinstance(meta.get("title"), str) else "",
        "description": meta.get("description", "") if isinstance(meta.get("description"), str) else "",
        "date": meta.get("date", "") if isinstance(meta.get("date"), str) else "",
        "tags": tags,
        "slug": slug,
        "reading_time": meta.get("readingTime", "") if isinstance(meta.get("readingTime"), str) else "",
        "featured": bool(meta.get("featured", False)),
        "draft": bool(meta.get("draft", False)),
        "live_url": live_url,
        "vscode_url": vscode_url,
        "publish_time_utc": PUBLISH_TIME_UTC,
        "errors": errors,
    }


def _build_payload() -> dict:
    """Assemble the full /api/posts JSON response."""
    if not LIVE_DIR.is_dir():
        return _error_payload(f"live blog dir missing: {LIVE_DIR}")
    if not QUEUE_DIR.is_dir():
        return _error_payload(f"queue dir missing: {QUEUE_DIR}")

    posts: list[dict] = []
    for path in sorted(LIVE_DIR.glob("*.mdx")):
        posts.append(_post_dict(path, "published"))
    for path in sorted(QUEUE_DIR.glob("*.md")):
        posts.append(_post_dict(path, "queue"))

    # Slug-collision pass: any slug appearing in two or more files gets
    # flagged on every involved post. Published posts are NOT downgraded
    # status-wise (they keep `published`) but get the error annotation.
    slug_to_paths: dict[str, list[int]] = {}
    for idx, post in enumerate(posts):
        slug = post["slug"]
        if not slug:
            continue
        slug_to_paths.setdefault(slug, []).append(idx)
    for slug, indices in slug_to_paths.items():
        if len(indices) <= 1:
            continue
        for idx in indices:
            posts[idx]["errors"].append(f"duplicate slug: {slug}")
            if posts[idx]["status"] != "published":
                posts[idx]["status"] = "error"

    stats = {
        "published": sum(1 for p in posts if p["status"] == "published"),
        "scheduled": sum(1 for p in posts if p["status"] == "scheduled"),
        "overdue": sum(1 for p in posts if p["status"] == "overdue"),
        "errors": sum(1 for p in posts if p["status"] == "error" or p["errors"]),
        "draft": sum(1 for p in posts if p["status"] == "draft"),
    }

    return {
        "generated_at": _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "cron_expression": CRON_EXPRESSION,
        "publish_time_utc": PUBLISH_TIME_UTC,
        "stats": stats,
        "posts": posts,
    }


def _error_payload(message: str) -> dict:
    return {
        "generated_at": _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "cron_expression": CRON_EXPRESSION,
        "publish_time_utc": PUBLISH_TIME_UTC,
        "stats": {"published": 0, "scheduled": 0, "overdue": 0, "errors": 1, "draft": 0},
        "posts": [],
        "fatal_error": message,
    }


class Handler(BaseHTTPRequestHandler):
    """Two routes: GET /api/posts and GET / (everything else 404)."""

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        # Suppress default request logging; only errors print via log_error.
        return

    def _send_text(self, status: HTTPStatus, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 (BaseHTTPRequestHandler API)
        if self.path == "/api/posts":
            try:
                payload = _build_payload()
                body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
                self._send_text(HTTPStatus.OK, body, "application/json; charset=utf-8")
            except Exception as e:  # noqa: BLE001
                err_body = json.dumps({"error": str(e)}).encode("utf-8")
                self._send_text(
                    HTTPStatus.INTERNAL_SERVER_ERROR,
                    err_body,
                    "application/json; charset=utf-8",
                )
            return

        if self.path == "/" or self.path == "/index.html":
            html_path = THIS_DIR / "index.html"
            if not html_path.is_file():
                self._send_text(
                    HTTPStatus.NOT_FOUND,
                    b"index.html not found alongside server.py",
                    "text/plain; charset=utf-8",
                )
                return
            body = html_path.read_bytes()
            self._send_text(HTTPStatus.OK, body, "text/html; charset=utf-8")
            return

        self._send_text(HTTPStatus.NOT_FOUND, b"Not Found", "text/plain; charset=utf-8")


def main() -> int:
    if not (REPO_ROOT / "WEBCLAUDE.md").exists():
        print(
            f"ERROR: expected repo root at {REPO_ROOT} (no WEBCLAUDE.md found there).",
            file=sys.stderr,
        )
        print(
            "This tool must live at <repo-root>/tools/blog-scheduler/server.py.",
            file=sys.stderr,
        )
        return 1

    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Blog scheduler running at http://{HOST}:{PORT}")
    print("Close this window or press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
