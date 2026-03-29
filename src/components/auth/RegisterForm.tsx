"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          Check your email
        </h1>
        <p className="mt-4 text-text-secondary">
          We&apos;ve sent a confirmation link to your email address. Click the link to activate your account.
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
        Create your account
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Full name"
          name="full_name"
          placeholder="Your name"
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <PasswordInput
          label="Password"
          name="password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <PasswordInput
          label="Confirm password"
          name="confirm_password"
          placeholder="Confirm your password"
          required
          minLength={8}
          autoComplete="new-password"
        />

        <p className="text-xs text-text-muted">
          Password must be at least 8 characters.
        </p>

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-accent-gold hover:text-accent-gold-hover transition-colors"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
