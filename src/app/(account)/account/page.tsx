import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import type { Database } from "@/lib/supabase/types";
import { LogoutButton } from "./LogoutButton";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const metadata: Metadata = createMetadata({
  title: "Account",
  description: "Manage your InnerZero account.",
  robots: { index: false, follow: false },
});

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Account Dashboard</h1>

      <div className="mt-8 space-y-6">
        {/* Profile info */}
        <section className="rounded-xl border border-border-default bg-bg-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Profile
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-text-secondary">Email</dt>
              <dd className="text-sm text-text-primary">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-text-secondary">Name</dt>
              <dd className="text-sm text-text-primary">
                {profile?.full_name || "Not set"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-text-secondary">Member since</dt>
              <dd className="text-sm text-text-primary">{createdAt}</dd>
            </div>
          </dl>
        </section>

        {/* InnerZero status */}
        <section className="rounded-xl border border-border-default bg-bg-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            InnerZero
          </h2>
          <p className="text-sm text-text-secondary">
            InnerZero is free to use locally. Connect your account in the desktop app for cloud features and supporter perks when they become available.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="https://ko-fi.com/innerzero"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-gold hover:text-accent-gold-hover transition-colors"
            >
              Support InnerZero on Ko-fi
            </a>
            <a
              href="https://discord.gg/5XjCe2RNAJ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-teal hover:text-accent-teal-hover transition-colors"
            >
              Join the Discord community
            </a>
          </div>
        </section>

        {/* Quick links */}
        <section className="rounded-xl border border-border-default bg-bg-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Quick Links
          </h2>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-muted">
              Manage Billing — coming soon
            </span>
            <span className="text-sm text-text-muted">
              Cloud AI Usage — coming soon
            </span>
          </div>
        </section>
      </div>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
