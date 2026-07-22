/**
 * Phase 7B-1. CSP violation report sink.
 *
 * Accepts both legacy (`application/csp-report`) and modern
 * (`application/reports+json`) report bodies and logs them to stdout so
 * Vercel's runtime logs pick them up as a long-tail CSP signal. Returns 204
 * No Content for accepted reports.
 *
 * Hardening (website-security-hardening-medium): this endpoint is
 * unauthenticated and browser-driven, so it is bounded on every axis an
 * attacker could push:
 *   - IP rate limit (LIMITS.cspReport) so a flood cannot drive log/compute
 *     cost. Returns 429.
 *   - Body-size cap (MAX_BODY_BYTES) checked on the declared content-length
 *     AND the actual decoded text, so a missing or lying content-length still
 *     cannot blow past the cap. Returns 413.
 *   - The logged payload is truncated to MAX_LOG_CHARS so a single large (but
 *     under-cap) report cannot bloat a log line.
 *   - Logging is sampled (1 in LOG_SAMPLE_RATE) so a sustained stream under
 *     the rate limit still only writes a fraction of lines. Size, shape, and
 *     the 204/413/429 contract are unaffected by sampling.
 *
 * Same-origin POST from the browser; no CORS header needed.
 */

import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// CSP reports are small JSON objects. 16KB is generous headroom for a real
// report and still a hard ceiling against a padded body.
const MAX_BODY_BYTES = 16 * 1024;
// Cap on the serialised log line so one report cannot bloat stdout.
const MAX_LOG_CHARS = 2048;
// Log 1 in N accepted reports. First accepted report always logs (counter
// starts at 0), so the signal is never fully silent even at low volume.
const LOG_SAMPLE_RATE = 5;

let acceptedCount = 0;

interface CspReportBody {
  "csp-report"?: Record<string, unknown>;
}

interface ReportingApiEntry {
  type?: string;
  url?: string;
  body?: Record<string, unknown>;
}

type CappedBody =
  | { status: "ok"; text: string }
  | { status: "too_large" }
  | { status: "unreadable" };

/**
 * Read a request body into a string with a hard byte ceiling, aborting the
 * stream as soon as the accumulated bytes exceed `maxBytes`. This bounds
 * buffering even when Content-Length is absent or understated (chunked bodies),
 * which `request.text()` alone does not.
 */
async function readCappedBody(request: Request, maxBytes: number): Promise<CappedBody> {
  const body = request.body;
  if (!body) {
    // No stream (empty body). text() is safe and small.
    try {
      const text = await request.text();
      if (Buffer.byteLength(text, "utf8") > maxBytes) return { status: "too_large" };
      return { status: "ok", text };
    } catch {
      return { status: "unreadable" };
    }
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > maxBytes) {
          await reader.cancel();
          return { status: "too_large" };
        }
        chunks.push(value);
      }
    }
  } catch {
    return { status: "unreadable" };
  }
  return { status: "ok", text: Buffer.concat(chunks).toString("utf8") };
}

export async function POST(request: Request) {
  // Rate limit first: reject a flood before spending any parse/log work.
  const limited = checkRateLimit(request, "cspReport");
  if (limited) return limited;

  // Reject an oversized body cheaply on the declared length first.
  const declared = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  // Read the body with a hard byte cap, streaming so a missing or understated
  // Content-Length cannot make us buffer past MAX_BODY_BYTES. Abort the stream
  // the moment the accumulated bytes exceed the cap.
  const capped = await readCappedBody(request, MAX_BODY_BYTES);
  if (capped.status === "too_large") return new Response(null, { status: 413 });
  if (capped.status === "unreadable") return new Response(null, { status: 204 });
  const raw = capped.text;

  // Sample the log. The 204 contract and all rejection paths above run for
  // every request; only the console line is sampled.
  const shouldLog = acceptedCount % LOG_SAMPLE_RATE === 0;
  acceptedCount = (acceptedCount + 1) % LOG_SAMPLE_RATE;
  if (!shouldLog) {
    return new Response(null, { status: 204 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  let payload: unknown = null;
  if (raw.length > 0) {
    try {
      const json = JSON.parse(raw);
      if (contentType.includes("application/csp-report")) {
        // Legacy single-report form: { "csp-report": { ... } }
        payload = (json as CspReportBody)["csp-report"] ?? json;
      } else if (contentType.includes("application/reports+json")) {
        // Reporting API form: array of report entries.
        payload = json as ReportingApiEntry[];
      } else {
        // Defensive fallback. Some browsers send `application/json` for
        // legacy reports.
        payload = json;
      }
    } catch {
      // Malformed JSON. Still 204 — any signal beats a retry storm.
    }
  }

  // Single structured log line so Vercel log-search filters cleanly, truncated
  // to a fixed length so a large payload cannot bloat the line.
  const line = JSON.stringify({
    event: "csp_report",
    ts: new Date().toISOString(),
    content_type: contentType,
    payload,
  });
  const marker = "...[truncated]";
  console.log(
    line.length > MAX_LOG_CHARS
      ? line.slice(0, MAX_LOG_CHARS - marker.length) + marker
      : line,
  );

  return new Response(null, { status: 204 });
}
