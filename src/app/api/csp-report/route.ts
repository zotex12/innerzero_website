/**
 * Phase 7B-1. CSP violation report sink.
 *
 * Accepts both legacy (`application/csp-report`) and modern
 * (`application/reports+json`) report bodies and logs them to stdout so
 * Vercel's runtime logs pick them up during the 24-48h Phase 7B-1 smoke
 * window. Returns 204 No Content.
 *
 * Deliberately NO persistence, NO database write, NO rate-limit. This is
 * a short-lived observation tool, not infrastructure. Phase 7B-2 enforces
 * CSP and this endpoint becomes useful only as a long-tail signal — at
 * which point a more durable sink can be designed.
 *
 * Same-origin POST from the browser; no CORS header needed.
 */

export const runtime = "nodejs";

interface CspReportBody {
  "csp-report"?: Record<string, unknown>;
}

interface ReportingApiEntry {
  type?: string;
  url?: string;
  body?: Record<string, unknown>;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let payload: unknown = null;
  try {
    if (contentType.includes("application/csp-report")) {
      // Legacy single-report form: { "csp-report": { ... } }
      const json = (await request.json()) as CspReportBody;
      payload = json["csp-report"] ?? json;
    } else if (contentType.includes("application/reports+json")) {
      // Reporting API form: array of report entries.
      payload = (await request.json()) as ReportingApiEntry[];
    } else {
      // Defensive fallback. Some browsers send `application/json` for
      // legacy reports. Try parsing anyway.
      payload = await request.json().catch(() => null);
    }
  } catch {
    // Malformed body. Still return 204 — the browser does not retry on 4xx
    // and any signal is better than triggering retry storms.
  }

  // Single structured log line so Vercel log-search filters cleanly.
  console.log(
    JSON.stringify({
      event: "csp_report",
      ts: new Date().toISOString(),
      content_type: contentType,
      payload,
    }),
  );

  return new Response(null, { status: 204 });
}
