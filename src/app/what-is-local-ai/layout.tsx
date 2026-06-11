import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// /what-is-local-ai lives outside the (marketing) route group, so it needs
// its own layout to mount the global Header and Footer. See
// src/app/for/layout.tsx.
export default function WhatIsLocalAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
