"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
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
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/login?message=password-updated");
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-text-primary text-center">
        Set new password
      </h1>
      <p className="mt-2 text-center text-sm text-text-secondary">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <PasswordInput
          label="New password"
          name="password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <PasswordInput
          label="Confirm new password"
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
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </>
  );
}
