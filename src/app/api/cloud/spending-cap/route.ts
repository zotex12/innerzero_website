import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesktopUser } from "@/lib/auth-desktop";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

// Cap semantics (Phase 90 Batch 6):
//   null   → no cap (deduct freely)
//   0      → hard stop (reject every further deduction until cleared)
//   1..100000 → pence ceiling on cycle spend
interface SpendingCapBody {
  spending_cap_pence?: number | null;
}

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "spendingCap", getRateLimitKey(request));
  if (rateLimited) return rateLimited;

  const auth = await getDesktopUser(request);
  if ("error" in auth) return auth.error;

  let body: SpendingCapBody;
  try {
    body = (await request.json()) as SpendingCapBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Explicit field presence check — omitted field is a 400, not a silent null.
  if (!Object.prototype.hasOwnProperty.call(body, "spending_cap_pence")) {
    return NextResponse.json(
      { error: "spending_cap_pence field is required (send null to clear the cap)." },
      { status: 400 }
    );
  }

  const cap = body.spending_cap_pence;

  // Accept null (clear the cap) or an integer 0..100000. Never coerce 0 → null.
  if (cap !== null) {
    if (
      typeof cap !== "number" ||
      !Number.isInteger(cap) ||
      cap < 0 ||
      cap > 100000
    ) {
      return NextResponse.json(
        { error: "spending_cap_pence must be an integer between 0 and 100000, or null to clear." },
        { status: 400 }
      );
    }
  }

  const admin = createAdminClient();

  await admin
    .from("profiles")
    .update({ spending_cap_pence: cap })
    .eq("id", auth.user.id);

  const body_response: { spending_cap_pence: number | null; warning?: string } = {
    spending_cap_pence: cap,
  };
  if (cap === 0) {
    body_response.warning =
      "Cap set to 0 — all further cloud deductions will be rejected until you raise it or send null to clear.";
  }

  return NextResponse.json(body_response);
}
