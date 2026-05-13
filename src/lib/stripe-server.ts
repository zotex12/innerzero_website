// Server-only Stripe SDK singleton. Keep this isolated from `src/lib/stripe.ts`
// so client components and tests can import the pure pricing constants and
// helpers without dragging the Stripe Node SDK (and the `STRIPE_SECRET_KEY`
// environment read) into the browser bundle. Only API routes under
// `src/app/api/stripe/**` should import this file.

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});
