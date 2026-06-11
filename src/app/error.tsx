"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

// Branded error boundary for the root segment. Because the root layout
// reads headers() every route renders dynamically, so an uncaught render
// or data error at request time would otherwise surface Next's default
// unstyled error screen. This keeps the brand and a path back.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center pt-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-5xl font-bold text-accent-gold">Something went wrong</p>
          <h1 className="mt-4 text-2xl font-bold text-text-primary md:text-3xl">
            This page hit an unexpected error
          </h1>
          <p className="mt-4 text-text-secondary">
            Sorry about that. You can try loading the page again, or head back to the homepage.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button href="/" variant="secondary">
              Back to home
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
