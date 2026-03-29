import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = createMetadata({
  title: "Reset Password",
  description: "Reset your InnerZero account password.",
  robots: { index: false, follow: false },
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
