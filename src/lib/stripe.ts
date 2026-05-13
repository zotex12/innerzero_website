// ── Business Licence: tiered pricing (client-safe constants and helpers) ──
//
// This module is intentionally free of the Stripe Node SDK so it can be
// imported from `"use client"` components and tests without bundling the
// server SDK and the `STRIPE_SECRET_KEY` access into the browser. The Stripe
// client singleton lives in `src/lib/stripe-server.ts` and is consumed only
// by API routes.
//
// Replaces the flat £50/year price (archived 2026-05-14). Two live prices on
// product prod_UHTYBXr4zrFbyi:
//
//   Annual (volume-tiered in Stripe):
//     - 1 to 4 seats:  £149.99 per seat per year
//     - 5 to 24 seats: £129.99 per seat per year
//   Monthly (flat per seat):
//     - £19.99 per seat per month
//
// 25+ seats is not self-serve. The pricing UI hides the Buy button at that
// threshold and shows a mailto contact-sales CTA. The Stripe checkout API
// also rejects quantity > MAX_SELF_SERVE_SEATS as a defence in depth.
//
// Price IDs default to the live values so deployments do not need new env
// vars to function. Set the env var to override per environment (e.g. point
// to Stripe test-mode price IDs during local dev).

export const BUSINESS_LICENCE_ANNUAL_PRICE_ID =
  process.env.STRIPE_BUSINESS_LICENCE_ANNUAL_PRICE_ID ??
  "price_1TWljfIcHKhxPb7ApNtXqTkN";

export const BUSINESS_LICENCE_MONTHLY_PRICE_ID =
  process.env.STRIPE_BUSINESS_LICENCE_MONTHLY_PRICE_ID ??
  "price_1TWljiIcHKhxPb7AfMmtOKmJ";

export const TIER1_ANNUAL_PENCE = 14999;
export const TIER2_ANNUAL_PENCE = 12999;
export const MONTHLY_PENCE = 1999;
export const VOLUME_THRESHOLD = 5;
export const MAX_SELF_SERVE_SEATS = 24;
export const SALES_CONTACT_EMAIL = "help@innerzero.com";

export type BusinessCadence = "annual" | "monthly";

export interface BusinessTotal {
  totalPence: number;
  perSeatPence: number;
  isVolume: boolean;
  cadence: BusinessCadence;
}

// Returns the totals for a (seats, cadence) configuration. Seats outside
// [1, MAX_SELF_SERVE_SEATS] are clamped so callers can pass raw slider
// values without pre-validation; UI is still responsible for routing 25+
// to the mailto path.
export function computeBusinessTotal(
  seats: number,
  cadence: BusinessCadence
): BusinessTotal {
  const clamped = Math.max(1, Math.min(Math.trunc(seats), MAX_SELF_SERVE_SEATS));
  const isVolume = cadence === "annual" && clamped >= VOLUME_THRESHOLD;
  const perSeatPence =
    cadence === "monthly"
      ? MONTHLY_PENCE
      : isVolume
        ? TIER2_ANNUAL_PENCE
        : TIER1_ANNUAL_PENCE;
  return {
    totalPence: perSeatPence * clamped,
    perSeatPence,
    isVolume,
    cadence,
  };
}

export interface YearlySavings {
  percent: number;
  poundsPerYearRounded: number;
}

// Headline yearly-vs-monthly saving used in toggle copy. Uses tier 1 (1-4
// seats) single-seat math so the badge and inline note are consistent
// regardless of the current slider value; savings scale linearly per seat
// at tier 1 and slightly larger at tier 2, so reporting tier-1 is the
// conservative figure.
export function computeYearlySavings(): YearlySavings {
  const annualPence = TIER1_ANNUAL_PENCE;
  const monthlyAnnualPence = MONTHLY_PENCE * 12;
  const savingsPence = monthlyAnnualPence - annualPence;
  return {
    percent: Math.round((savingsPence / monthlyAnnualPence) * 100),
    poundsPerYearRounded: Math.round(savingsPence / 100),
  };
}

// Used by the checkout API allowlist and the webhook routing predicate.
export const BUSINESS_LICENCE_PRICE_IDS: ReadonlySet<string> = new Set([
  BUSINESS_LICENCE_ANNUAL_PRICE_ID,
  BUSINESS_LICENCE_MONTHLY_PRICE_ID,
]);

export function isBusinessLicencePriceId(
  priceId: string | null | undefined
): boolean {
  return typeof priceId === "string" && BUSINESS_LICENCE_PRICE_IDS.has(priceId);
}

// Server-only helper used by the checkout API to map the client-supplied
// cadence to the matching Stripe price ID. Lives here (not in stripe-server.ts)
// because it only references constants and is safe for tests to import.
export function priceIdForCadence(cadence: BusinessCadence): string {
  return cadence === "annual"
    ? BUSINESS_LICENCE_ANNUAL_PRICE_ID
    : BUSINESS_LICENCE_MONTHLY_PRICE_ID;
}
