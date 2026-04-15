import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "accountDelete");
  if (rateLimited) return rateLimited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 }
    );
  }

  const admin = createAdminClient();
  const errors: string[] = [];

  // 1. Delete proxy cost log (no FKs to other public tables)
  try {
    await admin.from("proxy_cost_log").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`proxy_cost_log: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 2. Delete usage transactions
  try {
    await admin.from("usage_transactions").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`usage_transactions: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 3. Delete usage packs
  try {
    await admin.from("usage_packs").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`usage_packs: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 4. Delete theme redemptions
  try {
    await admin.from("theme_redemptions").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`theme_redemptions: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 5. Delete licence events
  try {
    await admin.from("licence_events").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`licence_events: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 6. Delete devices
  try {
    await admin.from("devices").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`devices: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 7. Delete licences
  try {
    await admin.from("licences").delete().eq("user_id", user.id);
  } catch (e) {
    errors.push(`licences: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 8. Delete profile
  try {
    await admin.from("profiles").delete().eq("id", user.id);
  } catch (e) {
    errors.push(`profiles: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 9. Delete waitlist entry (by email)
  try {
    if (user.email) {
      await admin.from("waitlist").delete().eq("email", user.email);
    }
  } catch (e) {
    errors.push(`waitlist: ${e instanceof Error ? e.message : "failed"}`);
  }

  // 10. Delete auth user
  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    errors.push(`auth: ${authError.message}`);
  }

  if (errors.length > 0 && authError) {
    // Auth deletion failed, which is critical
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fully delete account. Please contact support.",
        errors,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Your account and all associated data have been permanently deleted.",
    ...(errors.length > 0 ? { partial_errors: errors } : {}),
  });
}
