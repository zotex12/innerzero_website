import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  // Cheap in-memory pre-auth IP guard: caps a flood BEFORE the auth verification,
  // and deliberately NOT the shared/DB limiter here - a Postgres write on the
  // unauthenticated path would let a flood hammer the same database auth and
  // billing rely on. Global capping across instances is an edge / firewall
  // rate-limit rule (infra), not this guard.
  const rateLimited = checkRateLimit(request, "usageHistory");
  if (rateLimited) return rateLimited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const url = new URL(request.url);

  // Parse and validate optional limit
  let limit = DEFAULT_LIMIT;
  const limitParam = url.searchParams.get("limit");
  if (limitParam !== null) {
    const parsed = Number(limitParam);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return NextResponse.json(
        { error: "limit must be an integer between 1 and 100." },
        { status: 400 }
      );
    }
    limit = Math.min(MAX_LIMIT, parsed);
  }

  // Parse and validate optional cursor
  const cursorParam = url.searchParams.get("cursor");
  let cursor: string | null = null;
  if (cursorParam !== null) {
    const parsed = new Date(cursorParam);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "cursor must be a parseable ISO-8601 timestamp." },
        { status: 400 }
      );
    }
    cursor = parsed.toISOString();
  }

  const admin = createAdminClient();

  let query = admin
    .from("usage_transactions")
    .select("id, type, amount, description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: transactions } = await query;

  const rows = transactions ?? [];
  const nextCursor =
    rows.length === limit ? rows[rows.length - 1].created_at : null;

  return NextResponse.json({
    transactions: rows,
    next_cursor: nextCursor,
  });
}
