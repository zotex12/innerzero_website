"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!captchaToken) {
      setError("Complete the verification above.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      captchaToken,
    });

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          Check your email
        </h1>
        <p className="mt-4 text-text-secondary">
          If an account exists with that email, you&apos;ll receive a password reset link shortly.
        </p>
        <p className="mt-6 text-sm text-text-muted">
          <Link
            href="/login"
            className="text-accent-gold hover:text-accent-gold-hover transition-colors"
          >
            Back to login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-text-primary text-center">
        Reset your password
      </h1>
      <p className="mt-2 text-center text-sm text-text-secondary">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <Turnstile
          onVerify={setCaptchaToken}
          onExpire={() => setCaptchaToken("")}
          onError={() => setCaptchaToken("")}
        />

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading || !captchaToken} className="w-full">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link
          href="/login"
          className="text-accent-gold hover:text-accent-gold-hover transition-colors"
        >
          Back to login
        </Link>
      </p>
    </>
  );
}
