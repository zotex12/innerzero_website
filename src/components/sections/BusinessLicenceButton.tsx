"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  MAX_SELF_SERVE_SEATS,
  SALES_CONTACT_EMAIL,
  type BusinessCadence,
} from "@/lib/stripe";

interface Props {
  seats: number;
  cadence: BusinessCadence;
}

// Renders either a Stripe checkout button (1 to MAX_SELF_SERVE_SEATS) or a
// mailto contact-sales CTA (25+ seats). The client posts the cadence and
// seat count only; /api/stripe/checkout resolves the cadence to the
// allowlisted Stripe price ID server-side, so the browser never needs to
// know any Stripe identifier.
export function BusinessLicenceButton({ seats, cadence }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (seats > MAX_SELF_SERVE_SEATS) {
    const subject = encodeURIComponent(`Business Licence enquiry (${seats} seats)`);
    return (
      <a
        href={`mailto:${SALES_CONTACT_EMAIL}?subject=${subject}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-accent-gold px-6 py-3 text-[15px] font-medium text-accent-gold transition-all duration-150 hover:bg-accent-gold hover:text-[#0a0a0f]"
      >
        Contact sales: {SALES_CONTACT_EMAIL}
        <Mail className="h-3.5 w-3.5" />
      </a>
    );
  }

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
        body: JSON.stringify({ cadence, quantity: seats }),
      });

      const data = (await res.json()) as { url?: string; message?: string };

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to start checkout. Please try again."
      );
      setLoading(false);
    }
  }

  const label =
    seats === 1
      ? "Buy Business Licence"
      : `Buy ${seats} Business Licences`;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold px-6 py-3 text-[15px] font-medium text-[#0a0a0f] transition-all duration-150 hover:bg-accent-gold-hover disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? "Processing..." : label}
      {!loading && <ExternalLink className="h-3.5 w-3.5" />}
    </button>
  );
}
