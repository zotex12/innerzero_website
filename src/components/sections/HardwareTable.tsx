import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HARDWARE_TIERS } from "@/lib/hardware";

// Server component. Renders HARDWARE_TIERS as a real <table> on md+ for
// dense scanning and as stacked cards on smaller viewports for screen
// readers, dyslexia-friendly reading flow, and clean LLM extraction.
//
// Tiers and columns live in src/lib/hardware.ts. Adding a tier is one
// array entry; adding a column is one interface field plus one <th>/<td>
// pair plus one mobile-card row. No code change here for tier additions.

interface FieldDef {
  key: "ram" | "cpu" | "gpu" | "storage";
  label: string;
}

const FIELDS: FieldDef[] = [
  { key: "ram", label: "RAM" },
  { key: "cpu", label: "CPU" },
  { key: "gpu", label: "GPU" },
  { key: "storage", label: "Storage" },
];

export function HardwareTable() {
  return (
    <section
      id="system-requirements"
      aria-labelledby="system-requirements-heading"
      className="py-12 md:py-16"
    >
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center md:text-left">
              <h2
                id="system-requirements-heading"
                className="text-2xl font-bold text-text-primary"
              >
                System requirements
              </h2>
              <p className="mt-1 text-text-secondary">
                InnerZero scales from modest laptops to dedicated workstations.
                Pick a tier. Zero detects your hardware and configures itself
                on first launch.
              </p>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="overflow-hidden rounded-xl border border-border-default bg-bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg-secondary text-text-secondary">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-text-primary">
                        Tier
                      </th>
                      {FIELDS.map((f) => (
                        <th key={f.key} className="px-5 py-3 font-semibold">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HARDWARE_TIERS.map((tier) => (
                      <tr
                        key={tier.id}
                        className={`border-t border-border-default ${
                          tier.recommended ? "bg-accent-gold/5" : ""
                        }`}
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-semibold text-text-primary">
                              {tier.name}
                            </span>
                            {tier.recommended && (
                              <span className="rounded-full border border-accent-gold/40 bg-accent-gold/10 px-2 py-0.5 text-xs font-medium text-accent-gold">
                                Recommended
                              </span>
                            )}
                            {!tier.recommended && (
                              <span className="rounded-full border border-accent-teal/40 bg-accent-teal/10 px-2 py-0.5 text-xs font-medium text-accent-teal">
                                Entry
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-text-secondary">
                            {tier.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {tier.modelExamples.map((m) => (
                              <span
                                key={m}
                                className="rounded-md border border-border-default bg-bg-secondary px-2 py-0.5 text-xs text-text-secondary"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                          {tier.notes && (
                            <p className="mt-3 text-xs text-text-muted leading-relaxed">
                              {tier.notes}
                            </p>
                          )}
                        </td>
                        {FIELDS.map((f) => (
                          <td
                            key={f.key}
                            className="px-5 py-4 align-top text-text-secondary"
                          >
                            {tier[f.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile stacked cards */}
            <div className="space-y-4 md:hidden">
              {HARDWARE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-xl border bg-bg-card p-5 ${
                    tier.recommended
                      ? "border-accent-gold/40"
                      : "border-border-default"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-text-primary">
                      {tier.name}
                    </h3>
                    {tier.recommended && (
                      <span className="rounded-full border border-accent-gold/40 bg-accent-gold/10 px-2 py-0.5 text-xs font-medium text-accent-gold">
                        Recommended
                      </span>
                    )}
                    {!tier.recommended && (
                      <span className="rounded-full border border-accent-teal/40 bg-accent-teal/10 px-2 py-0.5 text-xs font-medium text-accent-teal">
                        Entry
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {tier.description}
                  </p>
                  <dl className="mt-4 space-y-2 text-sm">
                    {FIELDS.map((f) => (
                      <div
                        key={f.key}
                        className="flex justify-between gap-4 border-t border-border-default pt-2"
                      >
                        <dt className="font-medium text-text-secondary">
                          {f.label}
                        </dt>
                        <dd className="text-right text-text-primary">
                          {tier[f.key]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tier.modelExamples.map((m) => (
                      <span
                        key={m}
                        className="rounded-md border border-border-default bg-bg-secondary px-2 py-0.5 text-xs text-text-secondary"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  {tier.notes && (
                    <p className="mt-3 text-xs text-text-muted leading-relaxed">
                      {tier.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
