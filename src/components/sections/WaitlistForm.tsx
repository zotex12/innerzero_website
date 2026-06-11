"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  // Honeypot value. Real users never see this field, so it stays empty.
  // Uses an opaque name (not a semantic one like "company") so browser
  // autofill and password managers do not populate it and silently drop
  // a real signup.
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, iz_hp: hp }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={className}>
        <div className="rounded-xl border border-success/30 bg-success/10 p-6 text-center">
          <p className="text-lg font-medium text-success">{message}</p>
          <p className="mt-2 text-sm text-text-secondary">
            We&apos;ll let you know when InnerZero is ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        {/* Honeypot: off-screen and aria-hidden so real users and
            assistive tech never reach it. Bots that auto-fill every
            field get dropped server-side. */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", height: 0, width: 0, overflow: "hidden" }}
        >
          <label htmlFor="wl-iz-hp">Leave this field empty</label>
          <input
            id="wl-iz-hp"
            type="text"
            name="iz_hp"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={status === "error" ? message : undefined}
            aria-label="Email address"
          />
        </div>
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Joining..." : "Join the Waitlist"}
        </Button>
      </form>
    </div>
  );
}
