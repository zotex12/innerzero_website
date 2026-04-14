import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/metadata";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = createMetadata({
  title: "Log In",
  description: "Log in to your InnerZero account.",
  robots: { index: false, follow: false },
});

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
