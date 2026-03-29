import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/sections/ContactForm";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Contact",
  description:
    "Get in touch with the InnerZero team. Questions, feedback, or support — we aim to respond within 48 hours.",
  openGraph: {
    title: "Contact | InnerZero — Private AI Assistant",
    description: "Get in touch with the InnerZero team.",
    url: "https://innerzero.com/contact",
  },
});

export default function ContactPage() {
  return (
    <div className="pt-28 pb-12 md:pt-36 md:pb-20">
      <Container>
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Contact Us
          </h1>
          <p className="mt-4 text-text-secondary">
            Have a question, feedback, or just want to say hello? We aim to respond within 48 hours.
          </p>
          <p className="mt-2 text-sm text-text-muted">
            You can also email us directly at{" "}
            <a
              href="mailto:help@innerzero.com"
              className="text-accent-gold hover:text-accent-gold-hover transition-colors"
            >
              help@innerzero.com
            </a>
          </p>

          <ContactForm />
        </div>
      </Container>
    </div>
  );
}
