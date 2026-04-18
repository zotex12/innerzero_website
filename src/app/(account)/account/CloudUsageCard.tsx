"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface CloudPlan {
  id: string;
  name: string;
  plan_type: "subscription" | "payg";
  usage_amount: number;
  price_pence: number;
  sort_order: number;
}

interface PaygPack {
  id: string;
  usage_remaining: number;
  expires_at: string | null;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

interface CloudUsageCardProps {
  userId: string;
  plan: string;
  usageBalance: number;
  usageMonthlyAllowance: number;
  billingCycleEnd: string | null;
  stripeCustomerId: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const remaining = total - used;

  let barColor = "bg-accent-teal";
  if (pct >= 95) barColor = "bg-error";
  else if (pct >= 80) barColor = "bg-warning";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">
          {remaining.toLocaleString("en-GB")} of {total.toLocaleString("en-GB")} usage remaining
        </span>
        <span className="text-xs text-text-muted">{pct}% used</span>
      </div>
      <div className="h-3 w-full rounded-full bg-bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuickTopUpButton({
  planId,
  label,
  price,
}: {
  planId: string;
  label: string;
  price: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/account");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });

      const data = (await res.json()) as { url?: string; message?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message ?? "Something went wrong.");
        setLoading(false);
      }
    } catch {
      alert("Failed to start checkout.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex flex-col items-center gap-1 rounded-lg border border-border-default bg-bg-secondary px-4 py-3 text-center transition-all duration-150 hover:border-accent-gold hover:text-accent-gold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <span className="text-xs text-text-muted">{price}</span>
    </button>
  );
}

export function CloudUsageCard({
  plan,
  usageBalance,
  usageMonthlyAllowance,
  billingCycleEnd,
  stripeCustomerId,
}: CloudUsageCardProps) {
  const [paygPacks, setPaygPacks] = useState<PaygPack[]>([]);
  const [paygPlans, setPaygPlans] = useState<CloudPlan[]>([]);
  const [planName, setPlanName] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const hasPlan = plan && plan !== "free";
  const used = usageMonthlyAllowance - usageBalance;

  useEffect(() => {
    // Fetch cloud plans for name resolution and PAYG quick top-up
    fetch("/api/cloud/plans")
      .then((r) => r.json())
      .then((data: { plans: CloudPlan[] }) => {
        const plans = data.plans ?? [];
        setPaygPlans(plans.filter((p) => p.plan_type === "payg"));
        const match = plans.find((p) => p.id === plan);
        if (match) setPlanName(match.name);
      })
      .catch(() => {});

    // Fetch PAYG packs via the balance endpoint from the browser (cookie auth)
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // Schema has purchased_at, not created_at — regression guard.
      supabase
        .from("usage_packs")
        .select("id, usage_remaining, expires_at")
        .eq("user_id", user.id)
        .gt("usage_remaining", 0)
        .order("purchased_at", { ascending: true })
        .then(({ data }) => {
          if (data) setPaygPacks(data as PaygPack[]);
        });
    });
  }, [plan]);

  function loadHistory() {
    if (transactions.length > 0) {
      setHistoryOpen(!historyOpen);
      return;
    }
    setHistoryOpen(true);
    fetch("/api/cloud/usage-history")
      .then((r) => r.json())
      .then((data: { transactions: Transaction[] }) => {
        setTransactions(data.transactions ?? []);
      })
      .catch(() => {});
  }

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.open(data.url, "_blank");
      else setBillingLoading(false);
    } catch {
      setBillingLoading(false);
    }
  }

  const paygTotal = paygPacks.reduce((sum, p) => sum + p.usage_remaining, 0);

  if (!hasPlan && paygPacks.length === 0) {
    // No plan, no packs
    return (
      <section className="rounded-xl border border-border-default bg-bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-accent-gold" />
          <h2 className="text-lg font-semibold text-text-primary">Cloud AI</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Running on local AI. Add Cloud AI for faster responses and premium models.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/pricing"
            className="inline-flex items-center rounded-lg bg-accent-gold px-4 py-2 text-sm font-medium text-[#0a0a0f] transition-all duration-150 hover:bg-accent-gold-hover"
          >
            View Cloud Plans
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-primary transition-all duration-150 hover:border-accent-gold hover:text-accent-gold"
          >
            Top Up
          </a>
        </div>

        {/* Quick Top Up */}
        {paygPlans.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border-default">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
              Quick Top Up
            </p>
            <div className="grid grid-cols-3 gap-2">
              {paygPlans.map((p) => (
                <QuickTopUpButton
                  key={p.id}
                  planId={p.id}
                  label={`${p.usage_amount.toLocaleString("en-GB")} usage`}
                  price={formatPence(p.price_pence)}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border-default bg-bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent-gold" />
          <h2 className="text-lg font-semibold text-text-primary">Cloud AI</h2>
        </div>
        {hasPlan && planName && (
          <span className="inline-flex items-center rounded-full bg-accent-gold-muted px-3 py-1 text-xs font-medium text-accent-gold">
            {planName}
          </span>
        )}
      </div>

      {/* Usage progress bar */}
      {hasPlan && usageMonthlyAllowance > 0 ? (
        <UsageBar used={Math.max(0, used)} total={usageMonthlyAllowance} />
      ) : (
        <div className="mb-2">
          <span className="text-sm font-medium text-text-primary">
            {usageBalance.toLocaleString("en-GB")} usage remaining
          </span>
        </div>
      )}

      {/* Reset date */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {billingCycleEnd
            ? `Resets ${formatDate(billingCycleEnd)}`
            : "No expiry"}
        </span>
      </div>

      {/* PAYG top-up balance */}
      {paygTotal > 0 ? (() => {
        // Earliest expiry across eligible packs; ISO sort is correct for
        // timestamptz strings. Older pre-policy packs with null expires_at
        // are shown as indefinite until the cron-side backfill migrates them.
        const expiries = paygPacks
          .map((p) => p.expires_at)
          .filter((e): e is string => !!e)
          .sort();
        const earliest = expiries[0];
        const hasIndefinite = paygPacks.some((p) => !p.expires_at);
        return (
          <div className="mt-3 pt-3 border-t border-border-default">
            <span className="text-sm text-text-secondary">
              Top Up Balance: {paygTotal.toLocaleString("en-GB")} remaining
            </span>
            <div className="mt-1 text-xs text-text-muted">
              {earliest
                ? `Earliest expiry ${formatDate(earliest)}`
                : null}
              {earliest && hasIndefinite ? " · " : ""}
              {hasIndefinite ? "Some legacy credits have no expiry date set" : ""}
            </div>
          </div>
        );
      })() : null}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-3">
        {stripeCustomerId && (
          <button
            onClick={handleManageBilling}
            disabled={billingLoading}
            className="inline-flex items-center rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-primary transition-all duration-150 hover:border-accent-gold hover:text-accent-gold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {billingLoading ? "Loading..." : "Manage Billing"}
          </button>
        )}
        <a
          href="/pricing"
          className="inline-flex items-center rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-primary transition-all duration-150 hover:border-accent-gold hover:text-accent-gold"
        >
          Change Plan
        </a>
      </div>

      {/* Quick Top Up */}
      {paygPlans.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border-default">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
            Quick Top Up
          </p>
          <div className="grid grid-cols-3 gap-2">
            {paygPlans.map((p) => (
              <QuickTopUpButton
                key={p.id}
                planId={p.id}
                label={`${p.usage_amount.toLocaleString("en-GB")} usage`}
                price={formatPence(p.price_pence)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Usage History (collapsible) */}
      <div className="mt-6 pt-4 border-t border-border-default">
        <button
          onClick={loadHistory}
          className="flex w-full items-center justify-between text-left cursor-pointer"
        >
          <span className="text-sm font-medium text-text-secondary">
            Usage History
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-text-muted transition-transform duration-200",
              historyOpen && "rotate-180"
            )}
          />
        </button>

        {historyOpen && (
          <div className="mt-3">
            {transactions.length === 0 ? (
              <p className="text-xs text-text-muted py-2">No usage history yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg bg-bg-secondary px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-text-primary">
                        {tx.type === "usage"
                          ? "Usage"
                          : tx.type === "monthly_grant"
                            ? "Monthly Grant"
                            : tx.type === "payg_purchase"
                              ? "Credit Purchase"
                              : tx.type === "adjustment"
                                ? "Adjustment"
                                : tx.type}
                      </span>
                      {tx.description && (
                        <span className="text-xs text-text-muted truncate max-w-[200px]">
                          {tx.description}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          tx.amount >= 0 ? "text-success" : "text-text-secondary"
                        )}
                      >
                        {tx.amount >= 0 ? "+" : ""}
                        {tx.amount}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDate(tx.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
