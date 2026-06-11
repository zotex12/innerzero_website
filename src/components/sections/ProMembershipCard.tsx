"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { INNERZERO_PRO } from "@/lib/constants";
import { type ProCadence } from "@/lib/stripe";
import { cn } from "@/lib/utils";

// InnerZero Pro app-membership card. Self-contained: owns the monthly/annual
// cadence toggle and the Stripe checkout call so the surrounding PricingSection
// stays simple. The client posts only { product: "pro", cadence };
// /api/stripe/checkout resolves the cadence to the Pro price ID server-side
// (mirrors BusinessLicenceButton), so the browser never sees a Stripe id.
// Distinct from the "Cloud Pro" cloud-AI plan: this is a local-features
// membership, not online compute.
export function ProMembershipCard() {
  const [cadence, setCadence] = useState<ProCadence>("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/pricing");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "pro", cadence }),
      });

      const data = (await res.json()) as { url?: string; message?: string };

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start checkout. Please try again."
      );
      setLoading(false);
    }
  }

  const price =
    cadence === "annual" ? INNERZERO_PRO.annualPrice : INNERZERO_PRO.monthlyPrice;
  const period =
    cadence === "annual" ? INNERZERO_PRO.annualPeriod : INNERZERO_PRO.monthlyPeriod;

  return (
    <div className="rounded-xl border border-border-default bg-bg-card p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-accent-gold" />
        <h3 className="text-lg font-semibold text-text-primary">InnerZero Pro</h3>
      </div>

      <div
        role="radiogroup"
        aria-label="InnerZero Pro billing period"
        className="mb-4 inline-flex rounded-lg border border-border-default p-1"
      >
        <button
          type="button"
          role="radio"
          aria-checked={cadence === "monthly"}
          onClick={() => setCadence("monthly")}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold",
            cadence === "monthly"
              ? "bg-accent-gold-solid text-[#0a0a0f]"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={cadence === "annual"}
          onClick={() => setCadence("annual")}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold",
            cadence === "annual"
              ? "bg-accent-gold-solid text-[#0a0a0f]"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          Annual
        </button>
      </div>

      <div className="mb-3">
        <span className="text-2xl font-bold text-text-primary">{price}</span>
        <span className="text-text-secondary">{period}</span>
        {cadence === "annual" && (
          <span className="ml-2 inline-flex items-center rounded-full bg-accent-gold/15 px-2 py-0.5 text-xs font-medium text-accent-gold">
            Save 33%
          </span>
        )}
      </div>

      <p className="text-sm text-text-secondary mb-4">{INNERZERO_PRO.description}</p>

      <ul className="mb-6 space-y-2">
        {INNERZERO_PRO.perks.map((perk) => (
          <li
            key={perk}
            className="flex items-start gap-2 text-sm text-text-primary"
          >
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-gold" />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold-solid px-6 py-3 text-[15px] font-medium text-[#0a0a0f] transition-all duration-150 hover:bg-accent-gold-solid-hover disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? "Processing..." : INNERZERO_PRO.cta}
        {!loading && <ExternalLink className="h-3.5 w-3.5" />}
      </button>

      {error && (
        <p className="mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <p className="mt-3 text-xs text-text-secondary">{INNERZERO_PRO.note}</p>
    </div>
  );
}
