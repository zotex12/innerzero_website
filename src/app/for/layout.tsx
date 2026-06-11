import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// The /for/* persona pages live outside the (marketing) route group, so
// they need their own layout to mount the global Header and Footer.
// Without it these high-intent SEO pages render with no navigation, no
// footer link mesh, and a gap under the fixed-header padding the pages
// already assume.
export default function ForLayout({
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
