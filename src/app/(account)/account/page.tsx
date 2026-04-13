import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import type { Database } from "@/lib/supabase/types";
import { LogoutButton } from "./LogoutButton";
import { ManageBillingButton } from "./ManageBillingButton";
import { CopyButton } from "./CopyButton";
import { CloudUsageCard } from "./CloudUsageCard";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Licence = Database["public"]["Tables"]["licences"]["Row"];

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

  // Fetch licence data if the user has a business licence
  let licence: Licence | null = null;
  if (profile?.business_licence) {
    const { data: licData } = await supabase
      .from("licences")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    licence = licData as Licence | null;
  }

  const renewalDate = profile?.subscription_end
    ? new Date(profile.subscription_end).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

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

        {/* Business Licence */}
        <section className="rounded-xl border border-border-default bg-bg-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Business Licence
          </h2>
          {profile?.business_licence ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                  Active
                </span>
              </div>
              {profile.licence_key && (
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-text-secondary">Licence key</dt>
                  <dd className="flex items-center gap-2 text-sm text-text-primary font-mono">
                    {profile.licence_key.slice(0, 8)}...
                    <CopyButton text={profile.licence_key} />
                  </dd>
                </div>
              )}
              {profile.company_name && (
                <div className="flex justify-between">
                  <dt className="text-sm text-text-secondary">Company</dt>
                  <dd className="text-sm text-text-primary">{profile.company_name}</dd>
                </div>
              )}
              {licence?.seats && (
                <div className="flex justify-between">
                  <dt className="text-sm text-text-secondary">Seats</dt>
                  <dd className="text-sm text-text-primary">{licence.seats}</dd>
                </div>
              )}
              {renewalDate && (
                <div className="flex justify-between">
                  <dt className="text-sm text-text-secondary">Renews</dt>
                  <dd className="text-sm text-text-primary">{renewalDate}</dd>
                </div>
              )}
              <div className="pt-2">
                <ManageBillingButton />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-text-secondary">
                No business licence.{" "}
                <Link
                  href="/pricing"
                  className="text-accent-gold hover:text-accent-gold-hover transition-colors"
                >
                  Get one for £50/year
                </Link>
              </p>
            </div>
          )}
        </section>

        {/* Cloud AI Usage */}
        <CloudUsageCard
          userId={user.id}
          plan={profile?.plan ?? "free"}
          usageBalance={profile?.usage_balance ?? 0}
          usageMonthlyAllowance={profile?.usage_monthly_allowance ?? 0}
          billingCycleEnd={profile?.billing_cycle_end ?? null}
          stripeCustomerId={profile?.stripe_customer_id ?? null}
        />

        {/* InnerZero links */}
        <section className="rounded-xl border border-border-default bg-bg-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Community
          </h2>
          <div className="flex flex-col gap-2">
            <a
              href="https://ko-fi.com/innerzero"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-gold hover:text-accent-gold-hover transition-colors"
            >
              Support InnerZero on Ko-fi
            </a>
            <a
              href="https://discord.gg/rn9SPXgThT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-teal hover:text-accent-teal-hover transition-colors"
            >
              Join the Discord community
            </a>
          </div>
        </section>
      </div>

      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
