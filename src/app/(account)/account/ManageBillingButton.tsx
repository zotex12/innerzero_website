"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; message?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Portal error:", data.message);
        setLoading(false);
      }
    } catch {
      console.error("Failed to open billing portal");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-primary transition-all duration-150 hover:border-accent-gold hover:text-accent-gold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? "Loading..." : "Manage Billing"}
    </button>
  );
}
