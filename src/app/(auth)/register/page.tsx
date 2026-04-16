import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/register" },
  title: "Sign Up",
  description: "Create your InnerZero account.",
  robots: { index: false, follow: false },
});

export default function RegisterPage() {
  return <RegisterForm />;
}
