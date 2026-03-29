import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { NOT_FOUND } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center pt-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-6xl font-bold text-accent-gold">404</p>
          <h1 className="mt-4 text-2xl font-bold text-text-primary md:text-3xl">
            {NOT_FOUND.headline}
          </h1>
          <p className="mt-4 text-text-secondary">{NOT_FOUND.description}</p>
          <div className="mt-8">
            <Button href="/">{NOT_FOUND.cta}</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
