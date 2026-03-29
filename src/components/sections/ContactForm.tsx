"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/xxxxx",
        {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        }
      );

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Unable to send your message. Please try again later.");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-8 rounded-xl border border-success/30 bg-success/10 p-6 text-center">
        <p className="text-lg font-medium text-success">Message sent!</p>
        <p className="mt-2 text-sm text-text-secondary">
          Thank you for reaching out. We&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <Input label="Name" name="name" placeholder="Your name" required />
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
      />
      <Input
        label="Subject"
        name="subject"
        placeholder="What is this about?"
        required
      />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message"
          className="text-sm font-medium text-text-secondary"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Your message..."
          className="rounded-lg border border-border-default bg-bg-card px-4 py-3 text-text-primary placeholder:text-text-muted outline-none transition-colors duration-150 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 resize-y"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-error" role="alert">
          {errorMsg}
        </p>
      )}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
