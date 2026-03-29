import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import { SettingsForms } from "./SettingsForms";

export const metadata: Metadata = createMetadata({
  title: "Settings",
  description: "Manage your InnerZero account settings.",
  robots: { index: false, follow: false },
});

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const profile = data as { full_name: string | null } | null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
      <SettingsForms
        userId={user.id}
        currentName={profile?.full_name || ""}
        email={user.email || ""}
      />
    </div>
  );
}
