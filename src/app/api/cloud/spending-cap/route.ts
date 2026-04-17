import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDesktopUser } from "@/lib/auth-desktop";
import { checkRateLimit } from "@/lib/rate-limit";

interface SpendingCapBody {
  spending_cap_pence: number;
}

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "spendingCap");
  if (rateLimited) return rateLimited;

  const auth = await getDesktopUser(request);
  if ("error" in auth) return auth.error;

  let body: SpendingCapBody;
  try {
    body = (await request.json()) as SpendingCapBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const cap = body.spending_cap_pence;
  if (
    typeof cap !== "number" ||
    !Number.isInteger(cap) ||
    cap < 0 ||
    cap > 100000
  ) {
    return NextResponse.json(
      { error: "spending_cap_pence must be an integer between 0 and 100000." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  await admin
    .from("profiles")
    .update({ spending_cap_pence: cap })
    .eq("id", auth.user.id);

  return NextResponse.json({ spending_cap_pence: cap });
}
