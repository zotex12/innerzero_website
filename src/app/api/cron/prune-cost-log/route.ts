import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Retention: delete proxy_cost_log rows older than 30 days. Supports the
// privacy policy's 30-day retention commitment and keeps the audit table
// bounded. Runs daily at 04:00 UTC (one hour after the 03:00 jobs).

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("proxy_cost_log")
    .delete()
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    console.error(
      JSON.stringify({
        event: "cron_prune_cost_log_error",
        error: error.message,
      })
    );
    return NextResponse.json({ error: "Prune failed." }, { status: 500 });
  }

  const pruned = data?.length ?? 0;
  const durationMs = Date.now() - startTime;

  console.log(
    JSON.stringify({
      event: "cron_prune_cost_log",
      pruned,
      duration_ms: durationMs,
      cutoff,
    })
  );

  return NextResponse.json({ pruned, duration_ms: durationMs });
}
