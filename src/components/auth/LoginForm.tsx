"use client";

import { useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Turnstile, type TurnstileRef } from "@/components/ui/Turnstile";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = searchParams.get("desktop") === "true";
  // Post-login destination. Only same-origin relative paths are honoured so a
  // crafted ?redirect= cannot become an open redirect ("//host", "/\\host", or
  // an absolute URL all fall back to /account).
  const redirectParam = searchParams.get("redirect");
  const safeRedirect =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//") &&
    !redirectParam.startsWith("/\\")
      ? redirectParam
      : "/account";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [desktopToken, setDesktopToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const tokenRef = useRef<HTMLElement>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileRef = useRef<TurnstileRef>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!captchaToken) {
      setError("Complete the verification above.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (authError) {
      setError(authError.message);
      setCaptchaToken("");
      turnstileRef.current?.reset();
      setLoading(false);
      return;
    }

    // Desktop login: show token for the user to paste into the app.
    // Format: base64(JSON({at: access_token, rt: refresh_token}))
    // The desktop app's login_to_account() decodes this to extract both tokens.
    if (isDesktop && data.session) {
      const tokenPayload = JSON.stringify({
        at: data.session.access_token,
        rt: data.session.refresh_token,
      });
      setDesktopToken(btoa(tokenPayload));
      setLoading(false);
      return;
    }

    router.push(safeRedirect);
    router.refresh();
  }

  // Select the token text in the code block so a manual Ctrl+C works even
  // when programmatic clipboard access is unavailable.
  function selectTokenText() {
    const node = tokenRef.current;
    if (!node) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function handleCopy() {
    // The async Clipboard API can be blocked (permissions policy, unfocused
    // document, some Chromium configurations). Never fail silently: fall back
    // to the legacy execCommand path, and if that also fails, select the
    // token and tell the user to press Ctrl+C. The token value itself never
    // reaches logs or error messages.
    setCopyFailed(false);
    setCopied(false);
    try {
      await navigator.clipboard.writeText(desktopToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    } catch {
      // fall through to the legacy path
    }
    try {
      selectTokenText();
      const ok = document.execCommand("copy");
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch {
      // fall through to the manual-copy prompt
    }
    selectTokenText();
    setCopyFailed(true);
  }

  // Desktop token display — shown after successful login with ?desktop=true
  if (desktopToken) {
    return (
      <>
        <h1 className="text-2xl font-bold text-text-primary text-center">
          Connect InnerZero
        </h1>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-text-secondary text-center">
            Copy this token and paste it into the InnerZero desktop app to connect your account.
          </p>

          <div className="relative rounded-lg border border-border-default bg-bg-secondary p-4">
            <code
              ref={tokenRef}
              className="block text-xs text-text-primary break-all max-h-24 overflow-y-auto font-mono"
            >
              {desktopToken}
            </code>
          </div>

          <Button onClick={handleCopy} className="w-full">
            {copied ? "Copied!" : "Copy Token"}
          </Button>

          {copyFailed && (
            <p className="text-xs text-error text-center" role="alert">
              Automatic copy is blocked in this browser. The token above is now
              selected: press Ctrl+C (Cmd+C on Mac) to copy it.
            </p>
          )}

          <p className="text-xs text-text-muted text-center">
            This token expires after 1 hour, but InnerZero will automatically refresh it.
            You can close this page after copying.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-text-primary text-center">
        {isDesktop ? "Log in to connect InnerZero" : "Log in to InnerZero"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          placeholder="Your password"
          required
          autoComplete="current-password"
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-accent-gold hover:text-accent-gold-hover transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Turnstile
          ref={turnstileRef}
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
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-accent-gold hover:text-accent-gold-hover transition-colors"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
