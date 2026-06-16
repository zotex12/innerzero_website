"use client";

import { useState } from "react";
import Link from "next/link";

// Unsubscribe confirmation island. A confirm button (rather than acting
// on page load) avoids inbox link-prefetchers and antivirus scanners
// silently unsubscribing people when they merely receive the email.
// The token is the per-subscriber unsubscribe_token from the email link.

interface UnsubscribeConfirmProps {
  token: string | null;
}

export function UnsubscribeConfirm({ token }: UnsubscribeConfirmProps) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");

  async function handleUnsubscribe() {
    if (!token) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <p className="text-base text-text-secondary">
        This unsubscribe link is missing its token. Please use the link from
        the bottom of one of our emails, or contact us and we will remove you.
      </p>
    );
  }

  if (status === "done") {
    return (
      <div role="status">
        <p className="text-base font-medium text-accent-gold">
          <span aria-hidden="true">&#x2713;</span> You have been unsubscribed.
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          You will not receive any more update emails. Changed your mind? You
          can sign up again from the{" "}
          <Link
            href="/"
            className="text-accent-gold underline underline-offset-4"
          >
            homepage
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-base text-text-secondary">
        Click below to stop receiving InnerZero update emails.
      </p>
      <button
        type="button"
        onClick={handleUnsubscribe}
        disabled={status === "submitting"}
        className="mt-6 rounded-lg bg-accent-gold-solid px-6 py-3 font-medium text-[#0a0a0f] transition-colors duration-150 hover:bg-accent-gold-solid-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Unsubscribing..." : "Unsubscribe me"}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-4 text-sm text-error">
          Something went wrong. Please try again, or contact us and we will
          remove you.
        </p>
      )}
    </div>
  );
}
