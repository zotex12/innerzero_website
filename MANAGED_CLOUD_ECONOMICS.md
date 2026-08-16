# Managed Cloud Economics and Pricing Systems Reference

Purpose: the single findable reference for how InnerZero's managed cloud
plans work economically and where every pricing-related piece lives, so a
future session working on prices (checking, updating, margin questions)
does not have to re-derive the system or get misled by stale seed data.
NOT auto-loaded; read it when the task touches managed-cloud pricing,
provider costs, credits, margins, or plan changes.

Facts here are dated. Trust the LIVE state (code + DB + Vercel env) over
this file, and update the dated sections when prices or routing change.

## Current live state (verified 2026-08-16)

- Managed text requests run on DIRECT DeepSeek (`api.deepseek.com`,
  model `deepseek-v4-flash`, thinking disabled, `max_tokens: 2048`) via
  the B0 path, activated 2026-07-19 (`CLOUD_PROXY_B0_V4FLASH_ENABLED=true`
  in Vercel prod). See `src/lib/cloud-failover.ts` (B0_PRIMARY/B0_FALLBACK,
  circuit breaker) and `callDeepSeekDirect` in `src/lib/cloud-providers.ts`.
- AZURE IS RETIRED (operator decision 2026-07-17, locked decision 9 of the
  managed-cloud-subscriber-readiness master plan). The Azure `callDeepSeek`
  leg in cloud-providers.ts is DEAD CODE kept only for the flag-off path;
  a post-B0 cleanup phase (not yet run) removes it and
  `AZURE_DEEPSEEK_API_KEY`. Do not route anything new through Azure.
- The Gemini fallback (`gemini-2.5-flash-lite` via
  `CLOUD_PROXY_B0_GEMINI_FALLBACK_ENABLED`) is OFF pending the operator
  signing the Google paid-tier DPA. With it off, a DeepSeek failure returns
  a clean 502 and the desktop falls back to local.
- MODEL TIERS ARE ROUTING-DEAD. The `model_tiers` DB rows (and their model
  lists: deepseek-chat, gemini-2.5-*, claude haiku/sonnet/opus) survive for
  ACCESS GATING and the CREDIT MULTIPLIER only (auto/budget 1x, standard
  2x, premium 4x, ultra 8x). Every tier's request is served by the same B0
  pair. Do not trust the seeded model lists in migration 007 as routing
  truth; that is exactly the confusion this file exists to prevent.
- Managed voice is separate: OpenAI Realtime via ephemeral session secrets
  (`src/lib/cloud-voice.ts`, `/api/cloud/voice/session`), billed 15
  credits per started minute.

## Where everything lives

WEBSITE repo (this repo) - the money side:
- `src/app/api/cloud/proxy/route.ts` - the managed text proxy: tier
  validation, credit deduction, B0 routing, caps/ceilings enforcement.
- `src/lib/cloud-providers.ts` - provider calls + `PROVIDER_COSTS` (pence
  per 1K tokens at the $1 = GBP 0.79 convention, rounded UP for margin).
  `estimateCostPence` feeds `costPence` for the caps/ceilings, so a stale
  row weakens the protection rails; keep it current when providers move.
- `src/lib/cloud-plans.ts` - plan lookup + atomic grant/deduct.
- `supabase/migrations/007_billing_schema_baseline.sql` - the SEED for
  `cloud_plans` and `model_tiers` (live DB is authoritative; verify via the
  `supabase-summers` MCP, project `chdsbjydwswtshjflkva`, never the plugin
  `supabase` server).
- `supabase/migrations/009_spend_caps_and_cost_ceiling.sql` - user default
  spending cap (2000p) + per-plan provider cost ceilings.
- `tests/cloud-failover.test.ts` - pins the DeepSeek cost row at the
  official rate; re-point deliberately when prices change.
- The archived master plan with every locked pricing decision:
  `InnerZero/.ai/phases/done_archive/managed-cloud-subscriber-readiness/`.

DESKTOP repo (InnerZero) - the display side:
- `api_usage.py::PROVIDER_PRICING` - BYO cost-ESTIMATE table (USD per 1M)
  behind the Costs page. Display only, never routing or billing. Legacy and
  retired model rows must stay at billed-era rates because recorded
  `cost_usd` is written at log time and old rows only price old history.
- `cloud_subscription.py` - the desktop client of the managed proxy.
- `.claude/rules/cloud-and-privacy.md` - the routing/privacy contracts.

## Plan economics (seed values; verify live rows before money decisions)

| Plan | Price | Credits | Pence/credit | Tier access (seed) | Provider cost ceiling |
|---|---|---|---|---|---|
| Starter | GBP 9.99/mo | 1,000 | ~1.0p | auto/budget/standard | 400p |
| Plus | GBP 19.99/mo | 2,500 | ~0.8p | + premium | 800p |
| Pro | GBP 39.99/mo | 6,000 | ~0.67p | + ultra | 1,600p |
| Top-up 200 | GBP 5 | 200 | 2.5p | see PAYG note | none (PAYG) |
| Top-up 600 | GBP 12 | 600 | 2.0p | see PAYG note | none |
| Top-up 1500 | GBP 25 | 1,500 | ~1.67p | see PAYG note | none |

Credits charged per request = the tier multiplier (1/1/2/4/8). The
ceilings are sized at 50% of net plan revenue (locked decision 10), so the
worst-case gross margin floor is ~50% by construction - PROVIDED
`PROVIDER_COSTS` is current, because the ceiling counts ESTIMATED pence.

PAYG NOTE (verified in the proxy 2026-08-16, Codex round): the server
checks `tier_access` ONLY when the user has a subscription plan
(`if (hasPlan)` in the proxy route). A plan-free PAYG user is NOT
tier-restricted at the trust boundary despite the seed rows' tier_access
arrays - they can request premium/ultra and simply pay 4x/8x credits for
the same B0 model. No provider-cost harm, but do not document or promise a
PAYG tier restriction anywhere customer-facing until the server enforces
one. OPERATOR DECIDED 2026-08-16: enforce it server-side so PAYG matches
subscriptions - tracked as a known bug in the desktop repo backlog
(`InnerZero/.ai/phases/knownbugs_todolist/payg-tier-access-not-enforced-server-side.md`);
flip this note to the enforced state when that phase ships.

## Margin snapshot (computed 2026-08-16, DeepSeek peak-schedule rates)

Per-request provider cost on the B0 path (typical ~2K tokens in, ~500 out):
~0.12p at peak (01:00-04:00 + 06:00-10:00 UTC), ~0.06p off-peak. Max-size
request (90K-char budget, 2048 out): ~1p peak.

- Full-utilisation gross margin band at typical request sizes: ~82% (Pro,
  all-peak, every credit spent at 1x) to ~94% (Starter, off-peak); top-ups
  ~93-97%. Real blended margin is higher because most subscribers do not
  spend every credit.
- Premium/ultra now cost 4x/8x credits for the same V4-Flash call, so those
  tiers run ~96-98%.
- A subscriber who spends EVERY credit on typical requests costs roughly:
  Starter GBP 1.20, Plus GBP 3, Pro GBP 7.30 (peak; half off-peak).
- Hard floor via ceilings: ~56-58% after Stripe (UK ~1.5% + 20p), assuming
  the cost table is current.
- VAT: not configured (operator decision 2026-07-19, below threshold).

Recompute this section whenever provider prices or plan definitions move.

## Checklist for a price-update session

1. Verify live provider pricing online (do not trust any repo table or
   this file's dated numbers).
2. WEBSITE: update `PROVIDER_COSTS` (pence/1K at 0.79 GBP, round UP) +
   re-point the pin in `tests/cloud-failover.test.ts` red-first. For
   DeepSeek carry the PEAK rate (off-peak is half; recorded in comments).
3. DESKTOP: update `api_usage.PROVIDER_PRICING` (USD/1M) + re-point any
   value pin (`tests/test_deepseek_v4_flash_rename.py` holds the DeepSeek
   one). NEVER touch legacy/retired rows - they price history.
4. Recompute the margin snapshot above and update its date.
5. If plan prices/credits/ceilings change: that is a Stripe + Supabase +
   operator-approval change (locked decisions; see the archived master
   plan) - not a table edit.
6. Customer-facing pricing copy is a separate locked surface
   (`innerzero.com/pricing` renders live DB plan rows; no invented stats,
   no em dashes).

## History anchors

- 2026-07-17: Azure retirement decided; B0 designed (locked decisions 9/10/11).
- 2026-07-19: B0 activated (direct V4-Flash live); caps/ceilings live since
  2026-07-18 (migration 009); A2 honest-copy phase shipped.
- 2026-08-16: DeepSeek peak/off-peak schedule effective (peak up to ~4.7x
  the old rates); both repos' cost tables refreshed the same day (website
  commit: this file's commit; desktop commits 79160235 + 8c7269f3 context).
