import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
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

  // Use admin client to delete the user (cascades to profile via FK)
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { message: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
