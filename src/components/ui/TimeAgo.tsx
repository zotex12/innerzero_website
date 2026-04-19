"use client";

import { useEffect, useState } from "react";

interface TimeAgoProps {
  /** ISO 8601 date string. Blog posts store YYYY-MM-DD which parses as UTC midnight. */
  date: string;
  className?: string;
}

/**
 * Day-level precision. Blog posts are YYYY-MM-DD so finer buckets would be
 * meaningless. Scale per the blog's freshness signal requirements:
 *   0 days  -> "today"
 *   1 day   -> "yesterday"
 *   2..13   -> "Nd ago"
 *   14..56  -> "Nw ago"
 *   57..364 -> "Nmo ago"
 *   365+    -> "Ny ago"
 * Returns null for future dates so the caller can fall back to the absolute.
 */
function getRelativeLabel(iso: string, now: Date): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  // Compare at UTC-midnight precision to avoid off-by-one at local day
  // boundaries (users in UTC+13 shouldn't see "yesterday" before a UTC+0
  // user sees "today").
  const postUtcMidnight = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  );
  const nowUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const days = Math.floor((nowUtcMidnight - postUtcMidnight) / 86_400_000);

  if (days < 0) return null; // future-dated; caller keeps absolute
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days <= 13) return `${days}d ago`;
  if (days <= 56) return `${Math.floor(days / 7)}w ago`;
  if (days <= 364) {
    // Force minimum of 2 to avoid "1mo ago" showing up in the 57-59 day
    // gap between the weeks and months buckets, which would feel jarring
    // right after "8w ago".
    const months = Math.max(2, Math.floor(days / 30));
    return `${months}mo ago`;
  }
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * Renders the post date as a relative timestamp ("6d ago") with the
 * absolute ISO date kept on the underlying <time> element for screen
 * readers, crawlers, and LLMs.
 *
 * Server render and initial client render are byte-identical: the
 * absolute ISO string. After the mount effect runs we swap to the
 * relative label. This avoids hydration mismatches caused by computing
 * "today" on the server at a different UTC instant than the client.
 *
 * Returns null for missing or unparseable dates rather than rendering
 * "Invalid Date".
 */
export function TimeAgo({ date, className }: TimeAgoProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const rel = getRelativeLabel(date, new Date());
    if (rel !== null) setLabel(rel);
  }, [date]);

  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  // Display: on server and first client render, `label` is null so we
  // render the raw ISO string (matches the prior site format exactly).
  // After mount, `label` holds the relative string and we swap to that.
  const display = label ?? date;

  return (
    <time dateTime={date} className={className}>
      {display}
    </time>
  );
}
