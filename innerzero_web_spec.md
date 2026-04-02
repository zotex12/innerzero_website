# InnerZero — Website & Online Infrastructure Spec

## Purpose

This document is the complete specification for InnerZero's online presence: the marketing website, account system, payment processing, cloud API service, and how the desktop app connects to all of it.

This is written for Claude and Claude Code so all implementation stays aligned.

The desktop app is covered by the separate `CLAUDE.md`. This document covers everything on the web/server side.

---

## 1. Brand Identity

### Product name
- Full name: **InnerZero**
- Casual name: **Zero** (users can say "Zero" in text or voice)
- Never: "Inner Zero" (two words) or "inner zero" (lowercase in branding)

### Domain
- Primary: `innerzero.com`
- Company: Summers Solutions (`summerssolutions.co.uk`)

### Tagline
- Primary: **inner peace. inner joy. innerzero.**
- Supporting: **Your AI. Your machine. Your data.**

### Brand positioning
- Local-first private AI assistant
- Runs entirely on your machine — free forever
- No cloud required. No tracking. No data leaves your device.
- Optional cloud features for faster reasoning, convenience, and premium models
- Privacy is the default. Cloud is the choice.

### Pricing model
- **Local app: Free forever.** No subscription required to use InnerZero locally.
- **Cloud AI plans:** Optional monthly "phone plan" style API bundles with credit allowances
- **Pay As You Go:** Optional per-credit cloud usage, no subscription required
- **Supporter:** Optional monthly donation to support development (separate from compute)
- **BYO API keys:** Power users can add their own provider keys for free, no markup

---

## 2. Design Direction

### Aesthetic reference
- Proton VPN / Proton Drive style: clean, premium, trust-focused
- Large typography, generous whitespace, section-based layouts
- Subtle gradients and glows, not flashy animations
- Professional but not corporate — approachable tech

### Colour scheme

#### Dark theme (default)
| Role | Colour | Hex |
|------|--------|-----|
| Background primary | Near-black | `#0a0a0f` |
| Background secondary | Dark grey | `#111118` |
| Background card/surface | Elevated dark | `#1a1a24` |
| Text primary | White | `#f0f0f5` |
| Text secondary | Muted grey | `#8888a0` |
| Accent primary | Gold | `#d4a843` |
| Accent primary hover | Bright gold | `#f0c040` |
| Accent secondary | Cyan/teal | `#00c9b7` |
| Accent secondary hover | Bright teal | `#0ed3cf` |
| Border | Subtle grey | `#2a2a3a` |
| Success | Green | `#22c55e` |
| Error | Red | `#ef4444` |

#### Light theme
| Role | Colour | Hex |
|------|--------|-----|
| Background primary | White | `#ffffff` |
| Background secondary | Off-white | `#f5f5f8` |
| Background card/surface | Light grey | `#eeeef2` |
| Text primary | Near-black | `#1a1a2e` |
| Text secondary | Dark grey | `#5a5a72` |
| Accent primary | Deep gold | `#b8922e` |
| Accent primary hover | Gold | `#d4a843` |
| Accent secondary | Dark teal | `#009e90` |
| Accent secondary hover | Teal | `#00c9b7` |
| Border | Light grey | `#d0d0da` |

#### Implementation
- CSS custom properties on `:root` and `[data-theme="light"]`
- Theme toggle persists to `localStorage`
- Default: dark
- Respect `prefers-color-scheme` on first visit if no stored preference

### Typography
- Primary font: Inter (Google Fonts) with system fallback stack
- Headings: Inter, semi-bold/bold
- Body: Inter, regular
- Code/mono: JetBrains Mono or system monospace

---

## 3. Tech Stack

### Frontend
- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS** (utility-first, custom theme tokens)
- **No UI component library** — custom components for premium feel
- Static generation (SSG) where possible for performance + SEO

### Hosting
- **Vercel** (free tier initially, scales with traffic)
- Automatic HTTPS, CDN, edge functions
- Deploy from GitHub repo

### Backend
- **Supabase** (Postgres + Auth + Row Level Security) — COMPLETE (Phase 2)
- Auth, waitlist, user accounts all live

### Payments (Phase 3)
- **Stripe** (Checkout + Customer Portal + Webhooks)
- Stripe handles supporter subscriptions, credit pack purchases, billing
- Stripe Billing for recurring cloud plans
- No custom billing UI beyond what Stripe provides

### Email (future)
- Transactional: Resend or Postmark (account confirmation, password reset, receipts)
- Marketing: to be decided (waitlist announcements, product updates)

---

## 4. Site Structure

### Public marketing pages (Phase 1 — COMPLETE)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Hero, feature summary, social proof, CTA |
| `/features` | Features | Detailed feature breakdown with sections |
| `/pricing` | Pricing | Free local, cloud plans, supporter, FAQ |
| `/privacy` | Privacy | Privacy policy + "how your data stays local" explainer |
| `/about` | About | About InnerZero, Summers Solutions, the mission |
| `/blog` | Blog index | Empty shell for now, route exists for SEO |
| `/blog/[slug]` | Blog post | MDX-based blog posts (added over time) |
| `/contact` | Contact | Contact form (Formspree or similar initially) |
| `/waitlist` | Waitlist | Email capture, "coming soon" messaging |
| `/download` | Download | Free download with system requirements |
| `/docs` | Documentation | Placeholder; later: setup guides, FAQ, troubleshooting |
| `/changelog` | Changelog | Release notes (can be MDX-based) |
| `/terms` | Terms of Service | Legal page |

### Account pages (Phase 2-3, behind auth)

| Route | Page | Purpose |
|-------|------|---------|
| `/login` | Login | Email + password login |
| `/register` | Register | Account creation |
| `/forgot-password` | Password reset | Reset flow |
| `/account` | Dashboard | Cloud plan status, credit balance, supporter status |
| `/account/billing` | Billing | Stripe Customer Portal redirect |
| `/account/usage` | Usage | Credit usage history, remaining balance |
| `/account/settings` | Settings | Email, password, preferences, API keys |

### API routes (Phase 3+)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/waitlist` | POST | Collect waitlist emails (Phase 1 — COMPLETE) |
| `/api/auth/*` | Various | Supabase Auth handlers (Phase 2 — COMPLETE) |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/stripe/checkout` | POST | Create Stripe Checkout session (cloud plan or supporter) |
| `/api/stripe/portal` | POST | Create Stripe Customer Portal session |
| `/api/credits/balance` | GET | Desktop app checks credit balance |
| `/api/credits/use` | POST | Desktop app reports credit usage |
| `/api/cloud/proxy` | POST | Managed API proxy (routes to provider, deducts credits) |
| `/api/download/[channel]` | GET | Return download URL for installer |
| `/api/updates/check` | GET | Desktop app checks for available updates |

---

## 5. SEO Strategy

### Per-page metadata
Every page must export unique:
- `title` — format: `Page Name | InnerZero — Private AI Assistant`
- `description` — unique, keyword-rich, under 160 chars
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

### Technical SEO
- `next-sitemap` for auto-generated sitemap.xml
- `robots.txt` — allow all public pages, disallow `/account/*`, `/api/*`
- Semantic HTML throughout: proper heading hierarchy (one `h1` per page), `nav`, `main`, `article`, `section`, `footer` landmarks
- Alt text on all images
- Structured data (JSON-LD): Organization, SoftwareApplication, FAQPage where appropriate
- Canonical URLs on every page
- Clean URL structure (no trailing slashes, no query params for content)

### Performance
- Static generation for all marketing pages
- Image optimisation via Next.js `<Image>`
- Font subsetting (Inter: Latin only initially)
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Lighthouse score target: 95+ on all public pages

### Content strategy (ongoing)
- Blog posts targeting: "local AI assistant", "private AI", "AI privacy", "run AI locally", "AI on your PC", "free AI assistant"
- Feature pages with clear H2/H3 structure for featured snippets
- FAQ sections with schema markup

---

## 6. Pricing Strategy

### Core principles
1. **Local is free forever.** No subscription, no account, no trial period for local AI usage.
2. **Cloud is optional.** Users who want faster reasoning, premium models, or convenience can opt into managed cloud plans.
3. **BYO API keys always free.** Power users can add their own provider API keys at zero markup.
4. **Supporter is separate from compute.** Supporting the project does not buy API credits.
5. **No unlimited AI promises.** All cloud plans have clear credit allowances.
6. **Simple is better than clever.** Credits, not raw tokens. One credit ≈ one standard AI message.

### API cost reference (April 2026)

These are the underlying provider costs InnerZero pays. This table is internal — never shown to users.

| Provider | Model | Input/1M tokens | Output/1M tokens | Cost per standard message (~1K in + 500 out) |
|----------|-------|-----------------|-------------------|-----------------------------------------------|
| DeepSeek | V3.2 / V4 | $0.28–0.30 | $0.42–0.50 | ~£0.0004 |
| Google | Gemini Flash | $0.30 | $2.50 | ~£0.001 |
| Anthropic | Haiku 4.5 | $1.00 | $5.00 | ~£0.003 |
| Anthropic | Sonnet 4.6 | $3.00 | $15.00 | ~£0.008 |
| Anthropic | Opus 4.6 | $5.00 | $25.00 | ~£0.012 |
| OpenAI | GPT-5.2 | $1.75 | $14.00 | ~£0.005 |

**Key insight:** API costs have dropped dramatically. Budget models cost fractions of a penny per message. Margins on managed plans should be 80%+ — this is normal for API resellers providing convenience, routing, and simplified billing. Do not price at 1.5x markup; that leaves almost zero revenue at these underlying costs.

### Credit system

**1 credit = 1 standard AI cloud message.** This abstracts away token math for users.

Credit costs vary by model tier — the system auto-routes by default, or users choose:

| Model tier | Credit cost | What it covers |
|------------|-------------|----------------|
| Auto (smart routing) | 1 credit | System picks best model for the task |
| Budget (DeepSeek, Gemini Flash) | 1 credit | Fast, cheap, good for simple tasks |
| Standard (Haiku, GPT-mini) | 2 credits | Better reasoning, moderate tasks |
| Premium (Sonnet, GPT-5) | 4 credits | Strong reasoning, complex tasks |
| Ultra (Opus) | 8 credits | Best available, hardest problems |

**Expensive operations** (image generation, voice synthesis, web search) cost additional credits per use — metered separately from standard chat credits. Exact rates set when these features are built.

### Phase 1 pricing (launch)

#### Free Local — £0/forever
- Full InnerZero desktop app
- All local AI features (chat, voice, memory, tools, sleep, projects)
- Runs on user's hardware via Ollama
- No account required
- No internet required for local features
- BYO API keys: user adds their own provider keys for free, zero markup

#### Supporter — £4.99/month
- Supports InnerZero development (not compute)
- Perks: supporter badge in app, early access to new features, extra themes, Discord role, roadmap voting
- No API credits included — this is donation, not usage
- Cancel anytime
- One-off donations also accepted (any amount via Stripe)

#### Founder — £79 one-time
- Limited to first 100 buyers — then retired permanently
- Permanent supporter perks (badge, themes, early access, Discord role)
- Includes future hosted personal tier when it launches (Phase 2 only — not business/team)
- Does NOT include unlimited cloud credits
- Scope is explicitly limited: supporter perks + personal hosted access. Nothing else is promised.

### Phase 1b pricing (after 50+ active users — adds cloud plans)

#### Cloud Starter — £9.99/month
- 300 credits/month
- Auto-routed model selection
- Access to Budget + Standard model tiers
- Overage: £4 per 100 credits

#### Cloud Plus — £19.99/month
- 800 credits/month
- All model tiers including Premium (Sonnet, GPT-5)
- Priority routing
- Overage: £3.50 per 100 credits

#### Cloud Pro — £39.99/month
- 2,000 credits/month
- All model tiers including Ultra (Opus)
- Priority routing
- Overage: £3 per 100 credits

#### Pay As You Go — no subscription
- Buy credit packs: 100 credits = £5 (£0.05/credit)
- Access to Budget + Standard tiers
- Premium/Ultra available at higher credit cost
- Credits expire after 90 days
- No monthly commitment

### Phase 1b cloud plan rules
- Credits do NOT roll over month to month. Unused credits expire at billing cycle reset.
- Overage is charged per 100-credit block, auto-billed to payment method on file.
- Hard spending cap available: user sets monthly maximum, service pauses when reached. No surprise bills.
- Soft cap warning at 80% usage via email and in-app notification.
- PAYG credit packs are one-time purchases, not subscriptions.

### Phase 2 pricing (future — hosted convenience)

#### Cloud Hosted — ~£19.99/month (on top of cloud plan)
- One-click setup (no Ollama/Docker manual install)
- Cloud sync across devices
- Remote access via web dashboard
- Automatic backups
- Managed updates
- Includes 500 cloud credits (stacks with any cloud plan)

This sits alongside local, never replaces it. Users choose: run locally (free), or pay for hosted convenience. Messaging: "Same Zero. Hosted for convenience."

### Phase 3 pricing (future — pro automation)

#### Cloud Pro+ / Automation — ~£39.99–49.99/month
- Everything in Cloud Hosted
- Scheduled jobs and background tasks
- Cloud-triggered actions
- Advanced observability and logging
- Higher credit allowance (3,000+ credits)
- Webhook integrations

### Phase 4 pricing (future — business)

#### Business — ~£99–299/month
- Team accounts with user management
- Role-based permissions
- Audit logs
- Shared knowledge bases
- Policy controls
- Priority support
- Commercial use licence
- Optional onboarding: ~£299–499 one-time setup fee

Framing: "Business" or "Team", never "Commercial Licence" — the latter sounds like a penalty for using the product at work.

Self-hosted business tier (same features, runs on company infrastructure) planned for later.

---

## 7. Desktop App ↔ Website Connection

### How it works under the new model

The desktop app is **free and fully functional offline.** No login required for local use.

An account is only needed when the user wants:
- Managed cloud AI (credit plans or PAYG)
- Supporter/founder perks
- Future hosted features (sync, backup, web dashboard)

### Account linking flow

```
User installs InnerZero (free download)
    → First-run wizard runs (hardware check → model download → benchmark)
    → App works immediately — no login, no account, no internet needed

    Later, user wants cloud AI or supporter perks:
    → Settings > Account > "Connect Account"
    → User logs in or creates account (opens innerzero.com/login in browser)
    → Browser redirects back to app with auth token
    → App stores account token in user_data/settings/account.json
    → Cloud features become available in app

    User adds BYO API keys (no account needed):
    → Settings > API Keys
    → User enters provider API key (DeepSeek, OpenAI, Anthropic, etc.)
    → Stored locally in user_data/settings/api_keys.json (encrypted)
    → Cloud models become available immediately, routed directly to provider
    → Zero markup, zero tracking
```

### Account token structure

```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "plan": "cloud_starter|cloud_plus|cloud_pro|payg|supporter|founder|free",
  "credits_remaining": 245,
  "credits_monthly_allowance": 300,
  "supporter": true,
  "founder": false,
  "billing_cycle_end": "2026-05-01T00:00:00Z",
  "issued_at": "2026-04-02T00:00:00Z",
  "expires_at": "2026-04-09T00:00:00Z"
}
```

Token expires after 7 days, app refreshes silently in background. If server unreachable, local features continue working — only cloud features pause.

### Credit usage flow

```
User sends a cloud-routed message in InnerZero:
    → App checks: has account token? has credits?
    → If yes: sends request to /api/cloud/proxy with auth token
    → Server routes to appropriate provider (DeepSeek, Claude, GPT, etc.)
    → Server deducts credits based on model tier
    → Returns AI response to app
    → App updates local credit display

    If BYO API key is set for that provider:
    → App routes directly to provider API
    → No server involvement, no credit deduction
    → Zero markup
```

### What the desktop app sends to the server

**When using managed cloud (credit plans):**
- Auth token
- The AI prompt/message (sent to provider via our proxy)
- Model preference
- App version

**When using BYO API keys:**
- Nothing. Direct to provider. InnerZero server is not involved.

**When checking for updates:**
- App version, OS name (no personal data)

**Never sent (regardless of mode):**
- Local memory data
- Local conversation history
- File contents
- Personal profile facts
- Usage patterns or analytics

This must be documented clearly on the Privacy page.

### Grace period (cloud features)

```
Server unreachable:

    Local features: Always work. No grace period needed.

    Cloud features:
    If last successful token refresh < 7 days ago:
        → Cloud features work (cached token still valid)
        → Subtle "offline" indicator

    If last refresh > 7 days ago:
        → Cloud features pause
        → Local features continue
        → "Connect to internet to refresh cloud access"

    App never locks. Local AI always works.
```

---

## 8. Stripe Integration

### Products and prices

Stripe products to create:

| Product | Type | Price | Stripe mode |
|---------|------|-------|-------------|
| Cloud Starter | Subscription | £9.99/month | `subscription` |
| Cloud Plus | Subscription | £19.99/month | `subscription` |
| Cloud Pro | Subscription | £39.99/month | `subscription` |
| Supporter | Subscription | £4.99/month | `subscription` |
| Founder | One-time | £79 | `payment` |
| PAYG 100 credits | One-time | £5 | `payment` |
| PAYG 500 credits | One-time | £22 | `payment` |
| One-off donation | One-time | Variable | `payment` (custom amount) |
| Overage 100 credits | Metered | £3–4 (tier dependent) | `subscription` add-on or auto-charge |

### Checkout flow

```
User clicks "Subscribe" or "Buy Credits" on innerzero.com or in-app:
    → Frontend calls POST /api/stripe/checkout
        Body: { price_id, email? }
    → Server creates Stripe Checkout Session
        - mode: "subscription" or "payment" depending on product
        - success_url: /account?session_id={CHECKOUT_SESSION_ID}
        - cancel_url: /pricing
    → Redirect user to Stripe Checkout
    → User completes payment
    → Stripe redirects to success_url
    → Stripe fires webhook
    → Server updates user record (plan, credits, supporter status)
```

### Billing management
- "Manage Billing" button in `/account`
- Creates Stripe Customer Portal session (POST /api/stripe/portal)
- User can: update payment method, view invoices, cancel subscription, switch plan
- No custom billing UI needed — Stripe handles it all

### Webhook events to handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Update user plan, add credits, set supporter/founder status |
| `customer.subscription.updated` | Update plan tier |
| `customer.subscription.deleted` | Revert to free, keep local access |
| `invoice.payment_succeeded` | Refresh credits for new billing cycle |
| `invoice.payment_failed` | Pause cloud features, send email warning |

### Important Stripe rules
- Always verify webhook signatures
- Idempotent webhook handling (same event may fire multiple times)
- Store Stripe customer_id in user record
- Never store card details — Stripe handles all PCI compliance
- Failed payment pauses cloud features only — local app continues working

---

## 9. Update System (Server Side)

The desktop app checks for updates. The server provides update metadata.

### Update check endpoint

`GET /api/updates/check?channel=stable&version=0.1.0&os=windows`

Response:
```json
{
  "update_available": true,
  "latest_version": "0.2.0",
  "current_version": "0.1.0",
  "download_url": "https://innerzero.com/downloads/innerzero-0.2.0-win-setup.exe",
  "release_notes_url": "https://innerzero.com/changelog#v0.2.0",
  "release_notes_summary": "Voice improvements, memory performance, bug fixes",
  "mandatory": false,
  "min_supported_version": "0.1.0"
}
```

### Release channels

| Channel | Audience | Update frequency |
|---------|----------|-----------------|
| `stable` | All users | Tested releases only |
| `beta` | Opt-in testers | Pre-release builds |
| `dev` | Louie only | Every build |

### Download delivery
- Installer hosted on GitHub Releases or Vercel Blob
- Downloads are **free and public** — no paywall, no login required
- Update checker runs on app startup (non-blocking)

---

## 10. Database Schema

### Users table (extends Supabase Auth)
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    plan TEXT DEFAULT 'free',
    credits_balance INTEGER DEFAULT 0,
    credits_monthly_allowance INTEGER DEFAULT 0,
    supporter BOOLEAN DEFAULT false,
    founder BOOLEAN DEFAULT false,
    billing_cycle_end TIMESTAMPTZ,
    release_channel TEXT DEFAULT 'stable',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Waitlist table (Phase 1 — COMPLETE)
```sql
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### Credit transactions table (Phase 3)
```sql
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    model_tier TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

Transaction types: `monthly_grant`, `purchase`, `usage`, `overage`, `expiry`, `refund`

### Founder tracking (Phase 3)
```sql
CREATE TABLE founder_slots (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    claimed_at TIMESTAMPTZ DEFAULT now()
);
-- Max 100 rows. Check count before allowing new founder purchases.
```

---

## 11. Email System

### Transactional emails (Phase 3)
Sent via Resend or Postmark:

| Trigger | Email |
|---------|-------|
| Account created | Welcome + confirm email |
| Cloud plan started | Welcome to your cloud plan, credits info |
| Credits running low (80%) | Usage alert |
| Credits exhausted | Credits used up — upgrade or buy more |
| Supporter started | Thank you for supporting InnerZero |
| Founder purchased | Founder welcome + perks summary |
| Payment failed | Payment failed — update payment method |
| Password reset | Reset link |
| Plan cancelled | Cancellation confirmed, local access continues |

### Marketing emails (later)
- Waitlist announcements ("InnerZero is live — download free!")
- Product updates / new features
- Blog post notifications
- Must include unsubscribe link (CAN-SPAM / GDPR)

---

## 12. Security Requirements

### Authentication
- Supabase Auth (email + password, bcrypt hashed)
- Rate limiting on login attempts (5 per minute per IP)
- CSRF protection on all forms
- Secure, HttpOnly, SameSite cookies for web sessions
- Short-lived JWT tokens for desktop app communication

### API security
- Cloud proxy endpoint requires valid auth token + positive credit balance
- Stripe webhooks verified via signature
- Rate limiting on all API endpoints
- Input validation on all parameters
- No sensitive data in URL query strings
- BYO API keys stored locally on user's machine, never sent to InnerZero servers

### Data protection
- GDPR compliant: user can request data export or deletion
- Minimal data collection: email, payment (via Stripe), credit usage records
- No tracking, no analytics cookies without consent
- Cloud proxy forwards prompts to the provider and returns responses — InnerZero does not store, log, or read prompt content

---

## 13. Build Order

### Phase 1: Marketing Frontend — COMPLETE
Live at innerzero.com. 12 pages, dark/light themes, responsive, SEO, waitlist capture.

### Phase 2: Database + Auth — COMPLETE
Supabase Auth, login/register/reset, account dashboard, waitlist migrated to database, branded email templates.

### Phase 3: Stripe + Cloud Plans
**Goal: Users can pay for supporter tier, founder slot, and cloud credit plans.**

Build:
1. Stripe products + prices created (supporter, founder, cloud plans, PAYG packs)
2. POST /api/stripe/checkout endpoint
3. POST /api/stripe/portal endpoint
4. POST /api/stripe/webhook endpoint
5. Webhook handlers for all subscription/payment events
6. user_profiles table with plan, credits, supporter/founder fields
7. credit_transactions table for usage tracking
8. founder_slots table with 100-slot cap
9. Account dashboard shows: plan status, credit balance, supporter badge, founder badge
10. Billing page redirects to Stripe Customer Portal
11. Pricing page updated: free local + cloud plans + supporter + founder (if slots remain)
12. PAYG credit purchase flow
13. One-off donation flow
14. Credit balance API endpoint for desktop app

### Phase 4: Cloud API Proxy + Credit Metering
**Goal: Desktop app can use managed cloud AI via InnerZero's proxy.**

Build:
1. POST /api/cloud/proxy — accepts auth token + prompt, routes to provider, deducts credits
2. Model routing logic (auto-route or user-selected tier)
3. Credit deduction per model tier
4. Overage handling (auto-charge or hard cap based on user preference)
5. Usage dashboard in /account/usage
6. Spending cap configuration
7. 80% usage warning emails

### Phase 5: Desktop App Integration
**Goal: Wire InnerZero desktop app to optional account system.**

Build (in the desktop app codebase, not the website):
1. `account.py` module: login, token refresh, credit balance check
2. Settings > Account section: connect/disconnect, plan display, credit balance
3. Cloud routing in reasoning layer: if managed plan → route via proxy; if BYO key → route direct
4. Credit display in status bar (when cloud plan active)
5. Graceful degradation: cloud unavailable → fall back to local model
6. BYO API key management UI in Settings (local storage, encrypted)
7. Update checker: calls /api/updates/check on startup

### Phase 6: Polish + Production Hardening
**Goal: Ready for real customers.**

Build:
1. Rate limiting on all API endpoints
2. Error monitoring (Sentry or similar)
3. Transactional email for all triggers
4. Account deletion / data export (GDPR)
5. Support / docs pages with real content
6. Blog with initial posts (SEO)
7. Analytics (privacy-respecting: Plausible or Fathom, not Google Analytics)
8. Cookie consent banner if needed
9. Load testing on cloud proxy endpoint
10. Security audit of auth + payment + proxy flows

---

## 14. Future Add-Ons (Not Built Now)

These are planned future revenue extensions. Do not build yet. Listed here for awareness so current architecture doesn't block them.

### Multi-device sync
- Sync project memory across multiple InnerZero devices
- Requires a sync server (likely Supabase Realtime or custom)
- Part of future hosted tier
- Privacy consideration: encrypted sync, server never reads content

### Team / Business plan
- Shared project memory across a team
- Admin controls, user management
- Centralised billing and credit pools
- Separate pricing tier: ~£99–299/month
- Requires significant backend work

### Email integration
- InnerZero manages/drafts emails
- Likely via IMAP/SMTP connection configured locally
- May need OAuth for Gmail/Outlook
- Privacy consideration: email content stays local, only auth tokens stored

### Mobile companion
- Lightweight mobile app that connects to desktop InnerZero
- Would require local network discovery or cloud relay
- Significant new project

---

## 15. Hard Rules

1. The local app is free forever. No subscription, no trial, no lockout.
2. The website must never have access to user conversation data, memory, or AI content
3. The only data the server stores about users is: email, payment info (via Stripe), credit balance, and usage records
4. When using the cloud proxy, prompts are forwarded to the AI provider and returned — never stored or logged by InnerZero
5. BYO API keys are stored locally on the user's machine, never transmitted to InnerZero
6. Downloads are free and public — no login required to download InnerZero
7. All cloud API endpoints must be rate-limited
8. Stripe webhook signatures must always be verified
9. Cloud features pause gracefully when payment fails — local app always works
10. GDPR compliance: users can delete their account and all server-side data
11. Supporter perks must never overlap with paid cloud features — supporter is donation, not compute
12. Founder slots capped at 100 — never increase the cap
13. Never promise "unlimited" cloud AI usage on any plan

---

## 16. File Structure

```
innerzero_website/
├── public/
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── og-default.png
│   ├── robots.txt
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── features/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── waitlist/page.tsx
│   │   ├── download/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── changelog/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── not-found.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── account/page.tsx
│   │   ├── account/billing/page.tsx
│   │   ├── account/usage/page.tsx
│   │   ├── account/settings/page.tsx
│   │   └── api/
│   │       ├── waitlist/route.ts
│   │       ├── stripe/checkout/route.ts
│   │       ├── stripe/webhook/route.ts
│   │       ├── stripe/portal/route.ts
│   │       ├── credits/balance/route.ts
│   │       ├── credits/use/route.ts
│   │       ├── cloud/proxy/route.ts
│   │       └── updates/check/route.ts
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── sections/
│   │   └── icons/
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── metadata.ts
│   │   ├── utils.ts
│   │   ├── supabase/
│   │   └── stripe.ts
│   └── styles/
│       └── globals.css
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── next-sitemap.config.js
```

---

## 17. VAT and Tax

### UK VAT
InnerZero is a digital service. UK law requires 20% VAT on digital services sold to UK consumers.

### Options
1. **Stripe Tax** — Stripe calculates and collects the correct tax automatically based on the customer's location. Added to the checkout price. You remit the collected VAT to HMRC. You need to register for VAT once revenue exceeds the VAT threshold (currently £90,000) or voluntarily register before that.
2. **Paddle (Merchant of Record)** — Paddle replaces Stripe. They act as the seller, handle all VAT/tax globally, and pay you net. You never deal with tax authorities. Less control, slightly higher fees (~5% vs Stripe's ~2.9%), but zero tax headaches. Worth seriously considering for a solo operation.

### Recommendation
Start with **Stripe + Stripe Tax** if you want maximum control and lower fees. Switch to **Paddle** if tax compliance becomes a burden. Either way, this must be configured before taking real payments — not after.

### EU/international sales
If selling to EU customers: EU VAT MOSS rules apply. Stripe Tax handles this automatically. If using Paddle, they handle everything.

### Display
Pricing on the website should show the price the customer actually pays. "£9.99/month" is the final price including VAT where applicable.

---

## 18. Legal Requirements

### Before taking money, these must exist:

**Terms of Service** (`/terms`)
Must cover:
- What InnerZero is (free local desktop software with optional paid cloud services)
- Cloud plan terms: auto-renewal, billing cycle, cancellation, credit expiry
- Supporter terms: recurring donation, cancel anytime
- Founder terms: one-time purchase, scope of included perks, non-refundable
- Refund policy (see below)
- Intellectual property: software is provided under free personal licence; cloud services are a separate subscription
- Limitation of liability: InnerZero provides no guarantees about AI output accuracy
- Cloud proxy disclaimer: prompts forwarded to third-party AI providers (named) — user accepts provider terms
- Termination: right to revoke cloud access for abuse
- Governing law: England and Wales

**Privacy Policy** (`/privacy`)
Must cover:
- UK GDPR compliance
- What data the website collects (email, payment via Stripe, credit usage)
- What data the desktop app collects locally (all AI data stays on machine)
- What the cloud proxy handles (prompts forwarded to provider, not stored)
- What BYO API key mode does (direct to provider, InnerZero not involved)
- Cookie usage on the website
- Data retention periods
- Right to access, correct, delete personal data
- Data processor details (Stripe, Supabase, AI providers when using managed cloud)
- Contact details for data requests

**EULA (End User Licence Agreement)**
Shown during desktop app install or first run. Covers:
- Software is free for personal use
- Cloud services require separate subscription
- No warranty on AI output
- User is responsible for their local data
- Restrictions: no reverse engineering, no redistribution
- Can be incorporated into Terms of Service

### Refund policy
- Local app is free — no refund needed
- Cloud plans: **7-day money-back guarantee** on first subscription month, no questions asked
- After 7 days: no refunds, user can cancel to prevent future charges
- PAYG credit packs: non-refundable once purchased (credits are consumable)
- Supporter subscriptions: cancel anytime, no refund for current period
- Founder: non-refundable (limited collectible, explicit at purchase)
- Refunds processed via Stripe (one-click from dashboard)

---

## 19. Support and Operations

### Minimum viable support
- **Support email**: help@innerzero.com (forwards to personal email initially)
- **Contact form**: on `/contact` page, submits to Formspree → same email
- **Response target**: within 48 hours (set expectation on the contact page)
- No live chat needed at launch
- No ticketing system needed at launch — just email

### Documentation (before launch)
The `/docs` page needs real content covering:
- System requirements (minimum and recommended specs)
- Installation guide (step-by-step with screenshots)
- First-run setup walkthrough
- How to add BYO API keys
- How to connect an account for cloud features
- Common issues and fixes (Ollama not starting, model download failed, etc.)
- How to update InnerZero
- How to uninstall
- How to contact support
- FAQ (can overlap with pricing page FAQ)

### Status page
Set up a simple status page for cloud API availability:
- **Instatus** (free tier) or **Upptime** (free, GitHub Pages hosted)
- Monitors: cloud proxy endpoint, website, Stripe webhook endpoint
- Link from footer: "System Status"

### Operational monitoring
- **Vercel** provides basic analytics and function logs for free
- **Sentry** (free tier) for error tracking on API routes
- **UptimeRobot** (free) or similar for uptime monitoring + email alerts
- Review Stripe dashboard weekly for failed payments, disputes, churn
- Monitor cloud proxy costs vs revenue weekly

---

## 20. Cookie Consent

### Rules
- UK GDPR / PECR requires consent before setting non-essential cookies
- If the site uses **zero analytics and zero third-party cookies**, no banner is needed at launch
- The moment any analytics (even privacy-friendly ones like Plausible) or third-party scripts are added, a cookie consent banner is required

### Recommendation
- Launch with **no analytics** — no cookie banner needed
- When adding analytics in Phase 6, add a simple cookie consent banner
- Use a lightweight solution (cookie-consent by Osano, or a simple custom banner)
- Never use Google Analytics — use Plausible or Fathom

---

## 21. Pre-Launch Checklist

Before announcing InnerZero publicly or taking payments, all of these must be done:

### Legal
- [ ] Terms of Service — real text, not placeholder
- [ ] Privacy Policy — real text, UK GDPR compliant
- [ ] Refund policy stated on pricing page
- [ ] Cookie consent banner if any analytics are active

### Tax
- [ ] VAT handling configured (Stripe Tax or Paddle)
- [ ] Pricing displayed correctly (inc. VAT for UK)
- [ ] VAT registration submitted if required

### Support
- [ ] help@innerzero.com email working
- [ ] Contact form tested end-to-end
- [ ] Documentation pages populated with real content
- [ ] FAQ answers written
- [ ] Status page live and monitoring (when cloud features launch)

### Technical
- [ ] All pages render correctly on mobile, tablet, desktop
- [ ] Both themes (dark/light) tested on all pages
- [ ] Waitlist / signup flow tested end-to-end
- [ ] Supporter payment flow tested with Stripe test mode
- [ ] Founder purchase flow tested with Stripe test mode
- [ ] Cloud plan subscription flow tested with Stripe test mode
- [ ] Credit purchase (PAYG) tested with Stripe test mode
- [ ] Emails sending correctly (welcome, plan confirmation, payment failed, etc.)
- [ ] SSL certificate valid on innerzero.com
- [ ] Sitemap submitted to Google Search Console
- [ ] OG images rendering correctly when shared on social media
- [ ] 404 page working
- [ ] All links checked — no broken links
- [ ] Lighthouse score 95+ on all public pages
- [ ] Desktop app download accessible without login

### Business
- [ ] Stripe account fully verified and activated
- [ ] Bank account connected to Stripe for payouts
- [ ] Domain email set up (help@innerzero.com, louie@innerzero.com)
- [ ] At minimum one blog post live (for SEO, even if basic)
- [ ] Social media accounts created (even if empty — reserve the names)

---

## 22. Internal Pricing Policy

These rules are for internal reference only — never shown to users.

1. **Local is free.** Never charge for the desktop app itself. Monetisation comes from optional cloud services.
2. **Supporter is separate from compute.** Supporter perks are cosmetic and access-based (badges, themes, early access). Supporters do not get API credits.
3. **Founder lifetime is limited.** Capped at 100 slots. Includes supporter perks + future personal hosted tier. Does NOT include unlimited credits, business features, or team access. Scope is locked — never expand what "founder" includes after launch.
4. **Expensive tools get separate metering.** Image generation, voice synthesis via cloud, and web search may cost additional credits beyond standard chat messages. Price these when built, not before.
5. **Never promise unlimited AI usage.** All plans have credit caps. Hard spending limits available. This protects against runaway costs and sets sustainable expectations.
6. **Keep pricing simple.** Credits, not tokens. One credit ≈ one message. Users should never need to understand token math.
7. **Do not undermine future tiers.** Free local must not include features that should be in paid hosted/business tiers. Keep clear boundaries: local = your hardware; hosted = our infrastructure; business = team features.
8. **Margins must be healthy.** Cloud plans should maintain 80%+ gross margin on API costs. If provider prices change significantly, adjust credit allowances rather than plan prices.
9. **Monitor cost per user.** Track actual API spend per plan tier monthly. Adjust credit allowances or model routing if margins drop below 70%.

---

## 23. Risks and Mistakes to Avoid

1. **Pricing too cheap.** The underlying API costs are pennies. Don't pass those savings to users — charge for convenience, simplicity, and routing. 80%+ margin is normal in this space.
2. **Pricing too complex.** Three cloud tiers + PAYG + supporter + founder is already a lot. Do not add more tiers, add-ons, or per-feature charges until usage data justifies it.
3. **Unlimited usage traps.** Never offer "unlimited" on any cloud plan. Credits with clear caps. Always.
4. **Supporter cannibalising paid tiers.** Supporter perks must be cosmetic only. If supporters get early access to features that later require a paid plan, that's fine — but never give supporters free cloud credits.
5. **Founder scope creep.** "Founder includes personal hosted tier" is already generous. Do not expand this to include team features, business use, or unlimited anything. If founders complain, they paid £79 — they got a great deal.
6. **Mixing business and personal poorly.** Business use requires business pricing. Do not allow £9.99/month personal plans to be used by companies. Add "personal use only" to Terms of Service for personal plans. Business plan addresses this.
7. **Building cloud infrastructure too early.** Phase 1 launch is free local + supporter only. Cloud plans (Phase 1b) only after you have 50+ active users and real usage data. Do not build the proxy, metering, or credit system before there are users to serve.
8. **Ignoring provider price changes.** API pricing drops regularly. If DeepSeek halves their price, do not halve your plan price — keep your margins and give users more credits instead.

---

## 24. Summary

InnerZero's online infrastructure has five layers:

1. **Marketing website** — public pages, branding, SEO, waitlist capture, free download
2. **Account system** — user registration, authentication, optional account linking
3. **Payment system** — Stripe subscriptions (cloud plans, supporter), one-time purchases (founder, PAYG credits, donations)
4. **Cloud API proxy** — managed AI routing, credit metering, model selection
5. **Update system** — desktop app version checks, download delivery

These are built in order, each layer independent from the next. The desktop app is free and fully functional without any of these layers.

The desktop app connects to the online system only for: optional cloud AI (managed plans), optional account features (supporter/founder perks), and update checks. All AI processing, memory, conversations, and user data remain entirely local on the user's machine unless the user explicitly opts into cloud routing.
