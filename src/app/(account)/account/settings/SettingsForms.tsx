"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

interface SettingsFormsProps {
  userId: string;
  currentName: string;
  email: string;
}

export function SettingsForms({ userId, currentName, email }: SettingsFormsProps) {
  return (
    <div className="mt-8 space-y-10">
      <ChangeNameForm userId={userId} currentName={currentName} />
      <ChangePasswordForm />
      <DeleteAccountSection email={email} />
    </div>
  );
}

function ChangeNameForm({
  userId,
  currentName,
}: {
  userId: string;
  currentName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("full_name") as string;

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Name updated.");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <section className="rounded-xl border border-border-default bg-bg-card p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Change Name
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="full_name"
          defaultValue={currentName}
          placeholder="Your name"
          required
        />
        {error && (
          <p className="text-sm text-error" role="alert">{error}</p>
        )}
        {message && (
          <p className="text-sm text-success">{message}</p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Name"}
        </Button>
      </form>
    </section>
  );
}

function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("new_password") as string;
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
    } else {
      setMessage("Password updated.");
      e.currentTarget.reset();
    }
    setLoading(false);
  }

  return (
    <section className="rounded-xl border border-border-default bg-bg-card p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Change Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="New password"
          name="new_password"
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
        {error && (
          <p className="text-sm text-error" role="alert">{error}</p>
        )}
        {message && (
          <p className="text-sm text-success">{message}</p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </section>
  );
}

function DeleteAccountSection({ email }: { email: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (res.ok) {
        router.push("/?account-deleted=true");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete account.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-error/30 bg-error/5 p-6">
      <h2 className="text-lg font-semibold text-error mb-2">
        Delete Account
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {!confirming ? (
        <Button
          variant="secondary"
          className="border-error/50 text-error hover:border-error hover:text-error"
          onClick={() => setConfirming(true)}
        >
          Delete My Account
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-error font-medium">
            Are you sure? This will permanently delete your account ({email}) and all associated data.
          </p>
          {error && (
            <p className="text-sm text-error" role="alert">{error}</p>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="border-error/50 text-error hover:border-error hover:text-error"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Yes, Delete Everything"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
