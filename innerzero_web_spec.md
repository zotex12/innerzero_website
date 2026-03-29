# InnerZero — Website & Online Infrastructure Spec

## Purpose

This document is the complete specification for InnerZero's online presence: the marketing website, account system, payment processing, licence API, download delivery, and how the desktop app connects to all of it.

This is written for Claude and Claude Code so all implementation stays aligned.

The desktop app (formerly Pantheon, now InnerZero) is covered by the separate `pantheon_claude_spec.md` and `CLAUDE.md`. This document covers everything on the web/server side.

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
- Runs entirely on your machine
- No cloud. No tracking. No data leaves your device.
- Subscription-licensed desktop software
- One plan. One price. Everything included.

### Pricing
- **£9.99/month** or **£79.99/year** (~£6.67/mo)
- 14-day free trial, full access, no card required
- Future add-ons (multi-device sync, team features) priced separately when they exist

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

### Backend (Phase 2+)
- **Supabase** (Postgres + Auth + Row Level Security)
- Or standalone Postgres + NextAuth.js if more control needed
- Decision deferred to Phase 2 — frontend is independent

### Payments (Phase 3)
- **Stripe** (Checkout + Customer Portal + Webhooks)
- Stripe handles subscription lifecycle, invoices, payment methods
- No custom billing UI beyond what Stripe provides

### Email (future)
- Transactional: Resend or Postmark (account confirmation, password reset, receipts)
- Marketing: to be decided (waitlist announcements, product updates)

---

## 4. Site Structure

### Public marketing pages (Phase 1)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Hero, feature summary, social proof, CTA |
| `/features` | Features | Detailed feature breakdown with sections |
| `/pricing` | Pricing | Plan card, FAQ, CTA |
| `/privacy` | Privacy | Privacy policy + "how your data stays local" explainer |
| `/about` | About | About InnerZero, Summers Solutions, the mission |
| `/blog` | Blog index | Empty shell for now, route exists for SEO |
| `/blog/[slug]` | Blog post | MDX-based blog posts (added over time) |
| `/contact` | Contact | Contact form (Formspree or similar initially) |
| `/waitlist` | Waitlist | Email capture, "coming soon" messaging |
| `/download` | Download | Coming soon initially; later: gated installer download |
| `/docs` | Documentation | Placeholder; later: setup guides, FAQ, troubleshooting |
| `/changelog` | Changelog | Release notes (can be MDX-based) |
| `/terms` | Terms of Service | Legal page |

### Account pages (Phase 2-3, behind auth)

| Route | Page | Purpose |
|-------|------|---------|
| `/login` | Login | Email + password login |
| `/register` | Register | Account creation |
| `/forgot-password` | Password reset | Reset flow |
| `/account` | Dashboard | Subscription status, plan, usage |
| `/account/billing` | Billing | Stripe Customer Portal redirect |
| `/account/devices` | Devices | Registered devices, deactivate option |
| `/account/downloads` | Downloads | Installer download links (gated) |
| `/account/settings` | Settings | Email, password, preferences |

### API routes (Phase 2-3)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/waitlist` | POST | Collect waitlist emails (Phase 1) |
| `/api/auth/*` | Various | NextAuth.js or Supabase Auth handlers |
| `/api/licence/validate` | POST | Desktop app validates licence token |
| `/api/licence/activate` | POST | Desktop app activates on first run |
| `/api/licence/deactivate` | POST | Desktop app or web portal deactivates device |
| `/api/licence/status` | GET | Check subscription state |
| `/api/download/[channel]` | GET | Return signed download URL for installer |
| `/api/updates/check` | GET | Desktop app checks for available updates |
| `/api/updates/[channel]/latest` | GET | Returns latest version info + download URL |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/stripe/checkout` | POST | Create Stripe Checkout session |
| `/api/stripe/portal` | POST | Create Stripe Customer Portal session |

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
- Blog posts targeting: "local AI assistant", "private AI", "AI privacy", "run AI locally", "AI on your PC"
- Feature pages with clear H2/H3 structure for featured snippets
- FAQ sections with schema markup

---

## 6. Page Content Plan

### Home page (`/`)

**Hero section**
- Headline: "Your AI. Your machine. Your data."
- Tagline below: "inner peace. inner joy. innerzero."
- 1-2 sentence description: InnerZero is a private AI assistant that runs entirely on your PC. No cloud. No tracking. Just you and your AI.
- Primary CTA: "Join the Waitlist" (Phase 1) → "Download for Windows" (later)
- Secondary CTA: "Learn more" (scrolls to features)
- Subtle ambient glow / gradient animation in background (gold + teal on dark)

**Feature highlights (3-4 cards)**
- Runs 100% locally — your conversations never leave your machine
- Learns and remembers — personal memory that grows with every interaction
- Voice + text — talk to Zero or type, your choice
- Hardware-aware — automatically configures itself for your PC

**How it works (3 steps)**
1. Download and install — one click, InnerZero handles the rest
2. Zero configures itself — detects your hardware, downloads the right AI model
3. Start talking — text or voice, Zero remembers everything locally

**Trust / privacy statement**
- Bold statement about zero data leaving the machine
- Brief explainer: no accounts required for AI features, no telemetry, no cloud processing

**Social proof**
- Placeholder for testimonials / user count (when available)
- "Built by Summers Solutions" trust badge

**Final CTA**
- Pricing summary + "Join the Waitlist" / "Get Started"

### Features page (`/features`)

Detailed sections with icons/illustrations:

1. **Local-first AI** — runs on your PC, works offline, no internet required for AI
2. **Private memory system** — remembers your conversations, preferences, facts. All stored locally.
3. **Voice interaction** — speak to Zero, hear responses. STT + TTS built in.
4. **Document knowledge** — upload documents, ask questions across your files
5. **Smart tools** — web search, file management, calculations, URL fetching
6. **Hardware-aware setup** — detects your GPU, RAM, CPU and picks the best configuration
7. **Sleep & reflection** — Zero reviews past conversations and learns while idle
8. **One-click install** — download, run setup, start chatting. No technical setup required.

Future features (marked as "Coming Soon"):
- Multi-device sync
- Team/office shared memory
- Email integration
- Mobile companion app

### Pricing page (`/pricing`)

**Single plan card** (centered, prominent):
- InnerZero — £9.99/month or £79.99/year
- "Everything included. No tiers. No limits."
- Feature checklist showing everything
- CTA: "Start 14-Day Free Trial" / "Join Waitlist"

**FAQ section** (below pricing):
- What happens after the trial?
- Do I need a powerful PC?
- Is my data really private?
- Can I use Zero offline?
- What AI models does it use?
- Can I cancel anytime?
- What about updates?
- Will there be a Mac/Linux version? (Planned)

### Privacy page (`/privacy`)

Two sections:
1. **How InnerZero protects your privacy** — plain-language explainer (not legal text)
   - All AI runs on your hardware
   - Memory stored in local database on your machine
   - No cloud processing, no data uploads
   - Subscription validation is the only network call (and what it sends: licence key, app version — nothing personal)
   - Optional telemetry: none by default. May add opt-in anonymous crash reporting later.

2. **Privacy Policy** — standard legal privacy policy
   - What data the website collects (account email, payment via Stripe, basic analytics)
   - What data the app collects (nothing leaves your machine except licence checks)
   - Cookie policy for the website
   - GDPR compliance

### About page (`/about`)
- What InnerZero is and why it exists
- Mission: AI should be personal and private
- About Summers Solutions
- Link to contact

---

## 7. Desktop App ↔ Website Connection

This is how InnerZero (the desktop app) connects to the online account system. This follows the same pattern as Adobe Creative Cloud, JetBrains IDEs, and similar subscription desktop software.

### Activation flow (first run)

```
User installs InnerZero
    → First-run wizard starts
    → Step 2: "Log in or start free trial"
    → User has two options:

    Option A: User already has an account (bought via website)
        → Enters email + password
        → App calls POST /api/licence/activate
            Body: { email, password, device_id, hardware_fingerprint, app_version }
        → Server validates credentials + subscription status
        → Server creates device record, returns licence_token + expiry
        → App stores licence_token in user_data/settings/licence.json
        → App proceeds to hardware check → model download → setup complete

    Option B: User has no account (starts trial from app)
        → Enters email only (or email + password to create account)
        → App calls POST /api/licence/activate
            Body: { email, password?, device_id, hardware_fingerprint, app_version, trial: true }
        → Server creates account (if needed) + starts 14-day trial
        → Server creates device record, returns licence_token + expiry + trial_end_date
        → App stores licence_token in user_data/settings/licence.json
        → App proceeds to setup
```

### Licence token structure

The licence token is a signed JWT (or similar signed payload) containing:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "subscription_status": "active|trial|grace",
  "trial_end": "2026-04-11T00:00:00Z",
  "subscription_end": "2026-04-28T00:00:00Z",
  "device_id": "unique-device-hash",
  "max_devices": 2,
  "channel": "stable",
  "issued_at": "2026-03-28T00:00:00Z",
  "expires_at": "2026-04-04T00:00:00Z"
}
```

The token itself expires after 7 days, forcing periodic revalidation. The subscription can be valid much longer — the token just needs refreshing.

### Periodic validation (while app is running)

```
App starts
    → Reads licence.json
    → Checks token expiry

    If token is still valid (not expired):
        → App launches normally
        → Schedules background revalidation every 24 hours

    If token is expired:
        → App calls POST /api/licence/validate
            Body: { licence_token, device_id, app_version }
        → Server checks subscription status
        → If active: returns fresh token → app stores it → launches normally
        → If expired/revoked: returns error → app shows "subscription expired" screen
        → If server unreachable: grace period logic (see below)
```

### Grace period (offline / server unreachable)

```
Token is expired AND server is unreachable:

    If last successful validation was < 7 days ago:
        → App launches normally (offline grace period)
        → Shows subtle "offline — reconnect to verify licence" indicator

    If last successful validation was 7-14 days ago:
        → App launches with warning banner
        → "Your licence hasn't been verified in X days. Please connect to the internet."

    If last successful validation was > 14 days ago:
        → App shows locked screen
        → "Unable to verify your subscription. Please connect to the internet or contact support."
        → User data is NOT deleted — just app access is blocked
```

### Licence states (app-side)

| State | Meaning | App behaviour |
|-------|---------|---------------|
| `active` | Paid subscription, verified | Full access |
| `trial` | Free trial period | Full access, trial countdown shown |
| `grace` | Server unreachable, within grace window | Full access, subtle warning |
| `expired` | Subscription ended or trial expired | Locked screen, upgrade prompt |
| `revoked` | Manually revoked (refund, abuse, etc.) | Locked screen, contact support |

### Device management

- Each licence allows **2 devices** by default (can adjust later)
- Device identified by a hardware fingerprint hash (CPU ID + motherboard serial + OS install ID or similar)
- Users can deactivate devices from the web portal (`/account/devices`)
- If user tries to activate a 3rd device, activation fails with "device limit reached — deactivate a device at innerzero.com/account/devices"

### What the desktop app sends to the server

This is critical for the privacy story. The app sends ONLY:
- Email + password (on login/activation only)
- Licence token (on validation)
- Device fingerprint hash (not raw hardware IDs)
- App version string
- OS name (for update channel matching)

The app NEVER sends:
- Conversation content
- Memory data
- File contents
- Usage patterns
- Prompts or responses
- Personal facts or profile data
- Any AI-related data whatsoever

This must be documented clearly on the Privacy page.

### Desktop app file: `licence.json`

Stored at `user_data/settings/licence.json`:
```json
{
  "token": "eyJ...",
  "email": "user@example.com",
  "status": "active",
  "trial_end": null,
  "last_validated": "2026-03-28T10:00:00Z",
  "device_id": "sha256-hash-of-hardware"
}
```

This file is:
- Created on first activation
- Updated on every successful validation
- Never deleted by app updates
- Deleted only on explicit logout or full uninstall

---

## 8. Stripe Integration

### Subscription model
- One product: "InnerZero"
- Two prices: Monthly (£9.99) and Annual (£79.99)
- 14-day free trial on both
- Stripe handles all billing, invoices, payment methods, cancellation

### Checkout flow (website)

```
User clicks "Start Free Trial" or "Subscribe"
    → Frontend calls POST /api/stripe/checkout
        Body: { price_id, email? }
    → Server creates Stripe Checkout Session
        - mode: "subscription"
        - trial_period_days: 14
        - success_url: /account?session_id={CHECKOUT_SESSION_ID}
        - cancel_url: /pricing
    → Redirect user to Stripe Checkout
    → User completes payment
    → Stripe redirects to success_url
    → Stripe fires webhook: checkout.session.completed
    → Server creates/updates user record with subscription_id
```

### Billing management

- "Manage Billing" button in `/account/billing`
- Creates Stripe Customer Portal session (POST /api/stripe/portal)
- User can: update payment method, view invoices, cancel subscription, switch plan
- No custom billing UI needed — Stripe handles it all

### Webhook events to handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create user record, set status to trial/active |
| `customer.subscription.updated` | Update subscription status |
| `customer.subscription.deleted` | Set status to expired |
| `invoice.payment_succeeded` | Confirm active, extend period |
| `invoice.payment_failed` | Set grace period, send email warning |
| `customer.subscription.trial_will_end` | Send email: trial ending in 3 days |

### Important Stripe rules
- Always verify webhook signatures
- Idempotent webhook handling (same event may fire multiple times)
- Store Stripe customer_id and subscription_id in user record
- Never store card details — Stripe handles all PCI compliance

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
  "download_url": "https://innerzero.com/api/download/stable/innerzero-0.2.0-win-setup.exe",
  "release_notes_url": "https://innerzero.com/changelog#v0.2.0",
  "release_notes_summary": "Voice improvements, memory performance, bug fixes",
  "mandatory": false,
  "min_supported_version": "0.1.0"
}
```

### Release channels

| Channel | Audience | Update frequency |
|---------|----------|-----------------|
| `stable` | All customers | Tested releases only |
| `beta` | Opt-in testers | Pre-release builds |
| `dev` | Louie only | Every build |

### Download delivery
- Installer files stored in cloud storage (Vercel Blob, S3, or similar)
- Download URLs are signed/temporary (expire after 1 hour)
- Downloads gated behind active subscription check (except trial)
- No direct public link to installer binary

---

## 10. Database Schema (Phase 2)

### Users table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'none',
    trial_end TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    max_devices INTEGER DEFAULT 2,
    release_channel TEXT DEFAULT 'stable',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Devices table
```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    os TEXT,
    app_version TEXT,
    last_validated TIMESTAMPTZ DEFAULT now(),
    activated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, device_fingerprint)
);
```

### Waitlist table (Phase 1, simple)
```sql
CREATE TABLE waitlist (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### Licence events table (audit log)
```sql
CREATE TABLE licence_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    device_id UUID REFERENCES devices(id),
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
```

Event types: `activated`, `validated`, `validation_failed`, `deactivated`, `expired`, `revoked`, `grace_period_entered`, `trial_started`, `trial_ended`, `subscription_started`, `subscription_cancelled`, `subscription_renewed`

---

## 11. Email System

### Transactional emails (Phase 3)
Sent via Resend or Postmark:

| Trigger | Email |
|---------|-------|
| Account created | Welcome + confirm email |
| Trial started | Welcome to your trial |
| Trial ending (3 days before) | Trial expires soon — subscribe to keep access |
| Trial expired | Trial ended — subscribe to continue |
| Subscription started | Payment confirmed, you're subscribed |
| Payment failed | Payment failed — update payment method |
| Password reset | Reset link |
| Device activated | New device logged in |
| Subscription cancelled | Cancellation confirmed + access end date |

### Marketing emails (later)
- Waitlist announcements ("InnerZero is live!")
- Product updates / new features
- Blog post notifications
- Must include unsubscribe link (CAN-SPAM / GDPR)

---

## 12. Security Requirements

### Authentication
- Email + password (bcrypt hashed)
- Rate limiting on login attempts (5 per minute per IP)
- CSRF protection on all forms
- Secure, HttpOnly, SameSite cookies for web sessions
- JWT tokens for desktop app communication (signed with server secret, short expiry)

### API security
- All licence API endpoints require valid licence token or credentials
- Stripe webhooks verified via signature
- Rate limiting on all API endpoints
- Input validation on all parameters
- No sensitive data in URL query strings

### Desktop app security
- Licence token stored in user_data, not in app code
- Device fingerprint is a one-way hash (cannot be reversed to identify hardware)
- HTTPS only for all server communication
- Certificate pinning considered for licence validation (optional, adds complexity)

### Data protection
- GDPR compliant: user can request data export or deletion
- Minimal data collection: email, payment (via Stripe), device records
- No tracking, no analytics cookies without consent
- Support bundle from desktop app never includes memory/conversation data unless user opts in

---

## 13. Build Order

### Phase 1: Marketing Frontend (immediate)
**Goal: Get innerzero.com live with branding, pages, and waitlist capture.**

Build:
1. Initialise Next.js project (TypeScript, Tailwind, App Router)
2. Set up CSS custom properties for dark/light theme
3. Theme toggle component with localStorage persistence
4. Shared layout: header (nav + theme toggle), footer
5. Home page with all sections
6. Features page
7. Pricing page (with "Coming Soon" / waitlist CTA)
8. Privacy page
9. About page
10. Contact page (Formspree integration)
11. Waitlist page with email capture (Next.js API route → JSON file or Formspree)
12. Download page (placeholder "Coming Soon")
13. Blog index (empty shell)
14. Changelog page (empty shell)
15. Terms of Service page
16. SEO: metadata, sitemap, robots.txt, structured data
17. Responsive: mobile-first, tested on phone/tablet/desktop
18. Deploy to Vercel

**No database, no auth, no Stripe.** Pure static marketing site with a simple email capture.

Deliverable: Live website at innerzero.com that looks professional and collects waitlist emails.

### Phase 2: Database + Auth
**Goal: User accounts exist.**

Build:
1. Set up Supabase project (or standalone Postgres)
2. Users table + Waitlist table
3. Auth system (NextAuth.js or Supabase Auth)
4. Login page
5. Register page
6. Password reset flow
7. Basic account dashboard (shows email, account created date)
8. Migrate waitlist from JSON/Formspree to database
9. Transactional email setup (Resend or Postmark) for welcome + password reset

Deliverable: Users can create accounts and log in. No payment yet.

### Phase 3: Stripe + Subscriptions
**Goal: Users can pay.**

Build:
1. Stripe product + prices created (monthly + annual)
2. POST /api/stripe/checkout endpoint
3. POST /api/stripe/portal endpoint
4. POST /api/stripe/webhook endpoint
5. Webhook handlers for all subscription events
6. Account dashboard shows subscription status
7. Billing page redirects to Stripe Customer Portal
8. Trial flow: 14 days free on first subscription
9. "Start Free Trial" and "Subscribe" CTAs replace waitlist CTAs on pricing page
10. Trial-ending and payment-failed transactional emails

Deliverable: Users can subscribe, pay, manage billing, cancel. Full subscription lifecycle.

### Phase 4: Licence API + Download Gating
**Goal: Desktop app can activate and validate.**

Build:
1. Devices table
2. Licence events table
3. POST /api/licence/activate endpoint
4. POST /api/licence/validate endpoint
5. POST /api/licence/deactivate endpoint
6. GET /api/licence/status endpoint
7. Device management page in account portal
8. Download page: gated behind active subscription
9. Signed download URLs (temporary, 1 hour expiry)
10. GET /api/updates/check endpoint
11. Release channel support (stable/beta/dev)
12. Licence event audit logging

Deliverable: Desktop app can activate, validate, and receive updates. Downloads are gated.

### Phase 5: Desktop App Integration
**Goal: Wire InnerZero desktop app to the licence system.**

Build (in the desktop app codebase, not the website):
1. `licence.py` module: activate, validate, deactivate, read/write licence.json
2. Device fingerprint generation (hashed hardware ID)
3. First-run wizard: login/trial step calls /api/licence/activate
4. Background validation task (every 24 hours)
5. Grace period logic
6. Locked screen for expired/revoked state
7. "Log out" / "Deactivate device" in Settings
8. Update checker: calls /api/updates/check on startup

Deliverable: Full activation loop working end-to-end. User signs up on website → pays → downloads → activates → uses.

### Phase 6: Polish + Production Hardening
**Goal: Ready for real customers.**

Build:
1. Rate limiting on all API endpoints
2. Error monitoring (Sentry or similar)
3. Transactional email for all triggers (device activated, trial ending, etc.)
4. Account deletion / data export (GDPR)
5. Support / docs pages with real content
6. Blog with initial posts (SEO)
7. Analytics (privacy-respecting: Plausible or Fathom, not Google Analytics)
8. Cookie consent banner if needed
9. Load testing on licence validation endpoint
10. Security audit of auth + licence flows

---

## 14. Future Add-Ons (Not Built Now)

These are planned future revenue extensions. Do not build yet. Listed here for awareness so current architecture doesn't block them.

### Multi-device sync
- Sync project memory across multiple InnerZero devices
- Requires a sync server (likely Supabase Realtime or custom)
- Separate add-on pricing: TBD (£5-10/mo on top of base)
- Privacy consideration: encrypted sync, server never reads content

### Team / Office plan
- Shared project memory across a team
- Admin controls, user management
- Centralised licence management
- Separate pricing tier: TBD (£20-30/seat/mo)
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

1. The website must never have access to user conversation data, memory, or AI content
2. The only data the server stores about users is: email, payment info (via Stripe), device records, and licence events
3. The desktop app only contacts the server for: licence validation, update checks, and (optionally) crash reports
4. App updates must never overwrite user memory data
5. Downloads must be gated behind active subscription
6. All licence API endpoints must be rate-limited
7. Stripe webhook signatures must always be verified
8. Grace period must exist — users must never be locked out due to a server outage
9. Public builds must never expose dev/beta download links
10. GDPR compliance: users can delete their account and all server-side data

---

## 16. File Structure (Phase 1)

```
innerzero_website/
├── public/
│   ├── favicon.ico
│   ├── og-image.png            # Default Open Graph image
│   ├── robots.txt
│   └── images/                 # Marketing images, screenshots
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout: fonts, theme, header, footer
│   │   ├── page.tsx            # Home page
│   │   ├── features/
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── waitlist/
│   │   │   └── page.tsx
│   │   ├── download/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx        # Blog index
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Individual posts
│   │   ├── changelog/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── waitlist/
│   │           └── route.ts    # Email capture endpoint
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Privacy.tsx
│   │   │   └── CTA.tsx
│   │   └── icons/
│   │       └── Logo.tsx
│   ├── lib/
│   │   └── utils.ts            # Shared utilities
│   └── styles/
│       └── globals.css         # Tailwind + CSS custom properties
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
Pricing on the website should show:
- UK: £9.99/month (inc. VAT) — or £8.33 + VAT depending on preference
- Clearest option: show the price the customer actually pays. "£9.99/month" is the final price.

---

## 18. Legal Requirements

### Before taking money, these must exist:

**Terms of Service** (`/terms`)
Must cover:
- What InnerZero is (local desktop software, subscription licence)
- Subscription terms: auto-renewal, billing cycle, cancellation
- Refund policy (see below)
- Licence scope: personal use, single user, device limits
- Intellectual property: software is licensed not sold
- Limitation of liability: InnerZero provides no guarantees about AI output accuracy
- Termination: right to revoke access for abuse
- Governing law: England and Wales
- Can be generated initially via Termly, iubenda, or similar — then reviewed by a solicitor before significant revenue

**Privacy Policy** (`/privacy`)
Must cover:
- UK GDPR compliance
- What data the website collects (email, payment via Stripe, basic analytics if any)
- What data the desktop app collects (nothing leaves the machine except licence checks — be explicit)
- What the licence check sends (licence token, device fingerprint hash, app version, OS — nothing personal)
- Cookie usage on the website
- Data retention periods
- Right to access, correct, delete personal data
- Data processor details (Stripe, Supabase/hosting provider, email service)
- Contact details for data requests
- Should be generated via a proper GDPR-compliant tool or template, not hand-written

**EULA (End User Licence Agreement)**
Shown during desktop app install or first run. Covers:
- Software is licensed, not sold
- Subscription required for continued use
- No warranty on AI output
- User is responsible for their local data
- Restrictions: no reverse engineering, no redistribution
- Can be a separate document or incorporated into Terms of Service

### Refund policy
Recommendation:
- 14-day free trial means most users never pay before trying
- After payment: **30-day money-back guarantee**, no questions asked
- After 30 days: no refunds, user can cancel to prevent future charges
- Refunds processed via Stripe (simple, one-click from dashboard)
- This policy builds trust, reduces payment disputes, and very few people actually claim refunds on working software

State the refund policy clearly on the pricing page and in the Terms of Service.

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
- Common issues and fixes (Ollama not starting, model download failed, etc.)
- How to update InnerZero
- How to uninstall
- How to contact support
- FAQ (can overlap with pricing page FAQ)

### Status page
If the licence server goes down, users need to know. Set up a simple status page:
- **Instatus** (free tier) or **Upptime** (free, GitHub Pages hosted)
- Monitors: licence API endpoint, website, Stripe webhook endpoint
- Link from footer: "System Status"
- Takes 10 minutes to set up, prevents panicked support emails during outages

### Operational monitoring
- **Vercel** provides basic analytics and function logs for free
- **Sentry** (free tier) for error tracking on API routes
- **UptimeRobot** (free) or similar for uptime monitoring + email alerts
- Review Stripe dashboard weekly for failed payments, disputes, churn

---

## 20. Cookie Consent

### Rules
- UK GDPR / PECR requires consent before setting non-essential cookies
- If the site uses **zero analytics and zero third-party cookies**, no banner is needed at launch
- The moment any analytics (even privacy-friendly ones like Plausible) or third-party scripts are added, a cookie consent banner is required

### Recommendation
- Launch Phase 1 with **no analytics** — no cookie banner needed
- When adding analytics in Phase 6, add a simple cookie consent banner
- Use a lightweight solution (cookie-consent by Osano, or a simple custom banner)
- Never use Google Analytics — use Plausible or Fathom (privacy-respecting, often don't require consent for basic page views, but check current UK guidance)

---

## 21. Pre-Launch Checklist

Before announcing InnerZero publicly or taking payments, all of these must be done:

### Legal
- [ ] Terms of Service — real text, not placeholder
- [ ] Privacy Policy — real text, UK GDPR compliant
- [ ] Refund policy stated on pricing page
- [ ] Cookie consent banner if any analytics are active
- [ ] EULA ready for desktop app installer

### Tax
- [ ] VAT handling configured (Stripe Tax or Paddle)
- [ ] Pricing displayed correctly (inc. VAT for UK)
- [ ] VAT registration submitted if required

### Support
- [ ] help@innerzero.com email working
- [ ] Contact form tested end-to-end
- [ ] Documentation pages populated with real content
- [ ] FAQ answers written
- [ ] Status page live and monitoring

### Technical
- [ ] All pages render correctly on mobile, tablet, desktop
- [ ] Both themes (dark/light) tested on all pages
- [ ] Waitlist / signup flow tested end-to-end
- [ ] Payment flow tested with Stripe test mode
- [ ] Licence activation tested end-to-end with desktop app
- [ ] Grace period logic tested (disconnect from server, verify app still works)
- [ ] Emails sending correctly (welcome, trial ending, payment failed, etc.)
- [ ] SSL certificate valid on innerzero.com
- [ ] Sitemap submitted to Google Search Console
- [ ] OG images rendering correctly when shared on social media
- [ ] 404 page working
- [ ] All links checked — no broken links
- [ ] Lighthouse score 95+ on all public pages

### Business
- [ ] Stripe account fully verified and activated
- [ ] Bank account connected to Stripe for payouts
- [ ] Domain email set up (help@innerzero.com, hello@innerzero.com)
- [ ] At minimum one blog post live (for SEO, even if basic)
- [ ] Social media accounts created (even if empty — reserve the names)

---

## 22. Summary

InnerZero's online infrastructure has four layers:

1. **Marketing website** — public pages, branding, SEO, waitlist capture
2. **Account system** — user registration, authentication, account management
3. **Payment system** — Stripe subscriptions, billing, trial management
4. **Licence API** — desktop app activation, validation, device management, update delivery

These are built in order, each layer independent from the next. Phase 1 (marketing frontend) ships immediately with zero backend dependencies.

The desktop app connects to the online system only for licence validation and update checks. All AI processing, memory, conversations, and user data remain entirely local on the user's machine.
