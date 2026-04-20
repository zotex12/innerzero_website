"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Turnstile, type TurnstileRef } from "@/components/ui/Turnstile";
import { cn } from "@/lib/utils";

// Reuses the existing <Turnstile> primitive that Login / Register /
// ForgotPassword already consume. The wider site convention is a
// visible managed challenge whose token populates a state variable;
// the submit button stays disabled until the user solves it. Picked
// consistency over the spec's invisible-mode preference because the
// rest of the auth surface uses this exact pattern and a divergent
// newsletter form would feel off.

interface NewsletterSignupProps {
  source: "homepage" | "download_page";
  title?: string;
  subtitle?: string;
  className?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS_HOLD_MS = 5_000;

export function NewsletterSignup({
  source,
  title = "Stay in the loop",
  subtitle = "Occasional updates on new features and releases. No spam. Unsubscribe anytime.",
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Lazy-mount gate for the Turnstile widget. Passive scrollers see a
  // clean form; the managed challenge only spins up after the user
  // first focuses or types into the email input. By the time they
  // finish typing an address, the token callback has typically fired
  // and Subscribe is enabled with no added delay.
  const [hasInteracted, setHasInteracted] = useState(false);

  function markInteracted() {
    if (!hasInteracted) setHasInteracted(true);
  }

  const turnstileRef = useRef<TurnstileRef | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup any pending success-fade timer on unmount.
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  function clearErrorOnTyping() {
    if (status === "error") {
      setStatus("idle");
      setErrorMessage(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || trimmed.length > 320 || !EMAIL_REGEX.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email");
      return;
    }
    if (!captchaToken) {
      // Defensive: button should be disabled in this state, but if
      // the user submits via Enter before the challenge resolves we
      // surface a clear nudge rather than a silent no-op.
      setStatus("error");
      setErrorMessage("Please complete the verification first");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source,
          turnstileToken: captchaToken,
        }),
      });
      let payload: { ok?: boolean; message?: string } = {};
      try {
        payload = (await res.json()) as { ok?: boolean; message?: string };
      } catch {
        // Non-JSON body. Fall through to generic error.
      }
      if (res.ok) {
        setStatus("success");
        setErrorMessage(null);
        setEmail("");
        setCaptchaToken("");
        turnstileRef.current?.reset();
        successTimerRef.current = setTimeout(() => {
          setStatus("idle");
          // Return to the clean pre-interaction state so a fresh
          // signup on the same device re-mounts Turnstile with a
          // new challenge rather than keeping the stale (already
          // burnt) widget around.
          setHasInteracted(false);
        }, SUCCESS_HOLD_MS);
      } else {
        setStatus("error");
        setErrorMessage(
          typeof payload.message === "string"
            ? payload.message
            : "Something went wrong. Please try again.",
        );
        // Burnt token is single-use on the server. Reset the widget
        // so the user gets a fresh challenge on retry.
        setCaptchaToken("");
        turnstileRef.current?.reset();
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
      setCaptchaToken("");
      turnstileRef.current?.reset();
    }
  }

  const isBusy = status === "submitting";
  const isSubmitDisabled = isBusy || !captchaToken;

  return (
    <section
      aria-label="Newsletter signup"
      className={cn("py-16 md:py-20", className)}
    >
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-2xl font-semibold text-text-primary md:text-[2rem] md:leading-tight">
          {title}
        </h2>
        <p className="mt-3 text-base text-text-secondary md:text-lg">
          {subtitle}
        </p>

        {status === "success" ? (
          <div
            role="status"
            className="mt-8 text-base font-medium text-accent-gold"
          >
            <span aria-hidden="true">&#x2713;</span> Thanks! You&apos;re on
            the list.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label
                htmlFor={`newsletter-email-${source}`}
                className="sr-only"
              >
                Email address
              </label>
              <input
                id={`newsletter-email-${source}`}
                type="email"
                autoComplete="email"
                required
                disabled={isBusy}
                value={email}
                onFocus={markInteracted}
                onChange={(e) => {
                  // Focus may not have fired first on paste or
                  // browser autofill, so the change handler is the
                  // second interaction gate. markInteracted is a
                  // no-op after the first call so this costs nothing
                  // on subsequent keystrokes.
                  markInteracted();
                  setEmail(e.target.value);
                  clearErrorOnTyping();
                }}
                placeholder="you@example.com"
                className="flex-1 rounded-lg border border-border-default bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitDisabled}
                aria-disabled={isSubmitDisabled}
                className="rounded-lg bg-accent-gold px-6 py-3 font-medium text-bg-primary transition-colors duration-150 hover:bg-accent-gold-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {hasInteracted && (
              <Turnstile
                ref={turnstileRef}
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken("")}
                onError={() => setCaptchaToken("")}
              />
            )}
          </form>
        )}

        {errorMessage && (
          <p role="alert" className="mt-4 text-sm text-error">
            {errorMessage}
          </p>
        )}

        <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-text-muted">
          By subscribing, you agree to receive occasional product updates. We
          store your email in our Supabase database and nowhere else.
          Unsubscribe anytime. Read our{" "}
          <Link
            href="/privacy"
            className="text-text-secondary underline-offset-4 transition-colors hover:text-accent-gold hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
