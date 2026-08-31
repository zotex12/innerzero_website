import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { UnsubscribeConfirm } from "@/components/sections/UnsubscribeConfirm";

// Utility page reached from the unsubscribe link in update emails. Kept
// out of search indexes; it is only useful with a per-subscriber token.
export const metadata: Metadata = {
  // Absolute: the string carries the brand, so the root template suffix
  // would double it (WEBCLAUDE.md title duplicate-brand rule).
  title: { absolute: "Unsubscribe | InnerZero" },
  description: "Unsubscribe from InnerZero update emails.",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="pt-28 pb-12 md:pt-36 md:pb-20">
      <Container>
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
            Unsubscribe
          </h1>
          <div className="mt-6">
            <UnsubscribeConfirm token={token ?? null} />
          </div>
        </div>
      </Container>
    </div>
  );
}
