import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/reset-password" },
  title: "Set New Password",
  description: "Set a new password for your InnerZero account.",
  robots: { index: false, follow: false },
});

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
