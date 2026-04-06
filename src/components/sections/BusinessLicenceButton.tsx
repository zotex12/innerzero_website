"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function BusinessLicenceButton() {
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
        router.push("/login?redirect=/pricing");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_LICENCE,
        }),
      });

      const data = (await res.json()) as { url?: string; message?: string };

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold px-6 py-3 text-[15px] font-medium text-[#0a0a0f] transition-all duration-150 hover:bg-accent-gold-hover disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? "Processing..." : "Buy Business Licence"}
      {!loading && <ExternalLink className="h-3.5 w-3.5" />}
    </button>
  );
}
