# InnerZero Website — Project Guide for Claude Code

## What this project is

Marketing website and account portal for InnerZero (innerzero.com), a local-first private AI desktop assistant. Built with Next.js, TypeScript, and Tailwind CSS.

The full product and infrastructure spec is in `innerzero_web_spec.md` — read it before making any architectural decisions.

## Current state

Phase 1 (marketing frontend), Phase 2 (auth + database), pricing pivot, terms/privacy rewrite, Phase 3 (Stripe checkout, webhooks, portal, business licence), Phase 3b (cloud subscription infrastructure, proxy, checkout, usage tracking, PAYG, pricing page, account cloud usage, cron jobs), Phase 4 (licence validation API, cloud API proxy endpoint, spending caps, usage alerts, cost logging), SEO (JSON-LD, blog metadata, comparison posts), and Phase 6 (rate limiting, GDPR deletion, CORS hardening, security audit partial) are all done and deployed to Vercel at innerzero.com.

Phase 5 desktop app integration (account.py, cloud routing, BYO API key UI) is complete in the desktop codebase. The website API routes that support it were built in Phase 3b.

**Remaining website work:**
- Phase 3: Founder slot tracking (100 cap), account dashboard plan/supporter/founder display
- Phase 4: Credit metering (done: spending caps, usage alerts, cost logging). Overage billing deferred by design (overage_enabled defaults to false)
- Phase 5: Update check API
- Phase 6: Error monitoring, analytics (Plausible/Fathom). Rate limiting, GDPR account deletion, CORS hardening, security headers, and partial security audit are all complete

---

## Tech stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router) | TypeScript strict mode |
| Styling | Tailwind CSS | Custom theme tokens via CSS variables |
| Fonts | Inter (Google Fonts) | Latin subset only, swap display |
| Icons | Lucide React | Or inline SVGs — no icon font libraries |
| Forms | Native + server actions | Formspree for contact, API route for waitlist |
| Sitemap | next-sitemap | Auto-generated on build |
| Auth | Supabase Auth (@supabase/ssr) | Cookie-based session management |
| Database | Supabase (Postgres + RLS) | Row Level Security on all tables |
| Hosting | Vercel | Deploy from GitHub, auto HTTPS |
| Analytics | @vercel/analytics | Added to root layout; privacy-friendly, no Google Analytics |

### Not used
- No UI component library (no shadcn, no Radix, no MUI)
- No CSS-in-JS
- No Redux or state management library
- No heavy animation libraries (no Framer Motion unless explicitly requested)
- No Google Analytics or tracking scripts

---

## Brand identity

| Property | Value |
|----------|-------|
| Product name | InnerZero |
| Casual name | Zero |
| Domain | innerzero.com |
| Tagline | inner peace. inner joy. innerzero. |
| Supporting line | Your AI. Your machine. Your data. |
| Company | Summers Solutions |
| Local app | Free forever — no subscription, no trial, no account required |
| Cloud plans | Optional — Starter £9.99/mo, Plus £19.99/mo, Pro £39.99/mo (live) |
| BYO API keys | Free — user adds their own, zero markup |
| Supporter | £4.99/month — donation, not compute |
| Founder | £79 one-time — first 100 only |

---

## Design system

### Colour tokens

All colours are defined as CSS custom properties in `globals.css` on `:root` (dark) and `[data-theme="light"]`. Tailwind config maps to these variables.

#### Dark theme (default)
```
--bg-primary: #0a0a0f
--bg-secondary: #111118
--bg-card: #1a1a24
--bg-card-hover: #22222e
--text-primary: #f0f0f5
--text-secondary: #8888a0
--text-muted: #55556a
--accent-gold: #d4a843
--accent-gold-hover: #f0c040
--accent-gold-muted: rgba(212, 168, 67, 0.15)
--accent-teal: #00c9b7
--accent-teal-hover: #0ed3cf
--accent-teal-muted: rgba(0, 201, 183, 0.15)
--border: #2a2a3a
--border-hover: #3a3a4a
--success: #22c55e
--error: #ef4444
--warning: #f59e0b
```

#### Light theme
```
--bg-primary: #ffffff
--bg-secondary: #f5f5f8
--bg-card: #eeeef2
--bg-card-hover: #e4e4ea
--text-primary: #1a1a2e
--text-secondary: #5a5a72
--text-muted: #8888a0
--accent-gold: #b8922e
--accent-gold-hover: #d4a843
--accent-gold-muted: rgba(184, 146, 46, 0.12)
--accent-teal: #009e90
--accent-teal-hover: #00c9b7
--accent-teal-muted: rgba(0, 158, 144, 0.12)
--border: #d0d0da
--border-hover: #b8b8c8
```

### Usage rules
- **Gold** is the primary action colour — CTAs, buttons, links, highlights
- **Teal** is the secondary accent — badges, secondary actions, feature highlights, hover states
- **Never** use both gold and teal on the same element
- **Cards** use `--bg-card` with `--border` and subtle hover lift
- **Gradients** are subtle: gold-to-teal used sparingly for hero glow effects only, never on text or buttons
- **Glass-morphism**: light `backdrop-blur` on cards in dark mode only, optional

### Typography scale

| Element | Size | Weight | Line height |
|---------|------|--------|-------------|
| h1 (hero) | 3.5rem (56px) | 700 | 1.1 |
| h1 (page) | 2.5rem (40px) | 700 | 1.2 |
| h2 (section) | 2rem (32px) | 600 | 1.25 |
| h3 (card/sub) | 1.25rem (20px) | 600 | 1.4 |
| body | 1rem (16px) | 400 | 1.6 |
| body large | 1.125rem (18px) | 400 | 1.6 |
| small / caption | 0.875rem (14px) | 400 | 1.5 |
| nav links | 0.875rem (14px) | 500 | 1 |
| button | 0.9375rem (15px) | 500 | 1 |

Mobile: h1 hero drops to 2.25rem, h1 page to 2rem, h2 to 1.5rem.

### Spacing
- Section vertical padding: `py-20` (80px) desktop, `py-12` (48px) mobile
- Section max-width: `max-w-7xl` (1280px) centred
- Card padding: `p-6` to `p-8`
- Component gaps: `gap-4` to `gap-8`
- Header height: 64px fixed

### Border radius
- Buttons: `rounded-lg` (8px)
- Cards: `rounded-xl` (12px)
- Inputs: `rounded-lg` (8px)
- Badges: `rounded-full`

### Shadows
- Cards (dark): `shadow-lg` with very subtle opacity, or border-glow via `box-shadow: 0 0 20px rgba(212,168,67,0.05)`
- Cards (light): standard `shadow-md`
- Never heavy drop shadows

### Buttons

Primary (gold):
```
bg: --accent-gold
text: #0a0a0f (always dark text on gold)
hover: --accent-gold-hover
padding: px-6 py-3
font-weight: 500
rounded-lg
transition: all 150ms
```

Secondary (outline):
```
bg: transparent
border: 1px solid --border
text: --text-primary
hover: border --accent-gold, text --accent-gold
```

Ghost:
```
bg: transparent
text: --text-secondary
hover: text --text-primary
```

---

## File structure

```
innerzero_website/
├── public/
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── og-default.png              # 1200x630 default OG image
│   ├── robots.txt
│   └── images/
│       └── (marketing images, screenshots, icons)
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout: fonts, metadata, ThemeProvider, Header, Footer
│   │   ├── page.tsx                 # Home
│   │   ├── features/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── waitlist/page.tsx
│   │   ├── download/page.tsx
│   │   ├── download/DownloadCards.tsx # Client component — OS detection, platform cards
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── changelog/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── not-found.tsx            # Custom 404
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── account/page.tsx
│   │   ├── account/settings/page.tsx
│   │   ├── account/billing/page.tsx     # Phase 3
│   │   ├── account/usage/page.tsx       # Phase 3b
│   │   └── api/
│   │       ├── waitlist/route.ts           # POST: email capture
│   │       ├── account/delete/route.ts     # POST: GDPR account deletion
│   │       ├── stripe/checkout/route.ts    # Phase 3
│   │       ├── stripe/webhook/route.ts     # Phase 3
│   │       ├── stripe/portal/route.ts      # Phase 3
│   │       ├── cloud/balance/route.ts      # Phase 3b — desktop app balance check
│   │       ├── cloud/deduct/route.ts       # Phase 3b — usage deduction
│   │       ├── cloud/plans/route.ts        # Phase 3b — public plan listing
│   │       ├── cloud/proxy/route.ts        # Phase 3b/4 — cloud AI proxy for desktop
│   │       ├── cloud/usage-history/route.ts # Phase 3b — transaction history
│   │       ├── cron/reset-usage/route.ts   # Phase 3b — monthly usage reset
│   │       ├── cron/expire-packs/route.ts  # Phase 3b — PAYG pack expiry
│   │       ├── licence/validate/route.ts   # Phase 4
│   │       └── licence/status/route.ts     # Phase 4
│   ├── components/
│   │   ├── JsonLd.tsx               # Shared JSON-LD structured data helper
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Fixed header: logo, nav, theme toggle, CTA
│   │   │   ├── Footer.tsx           # Links, branding, legal, social
│   │   │   ├── MobileNav.tsx        # Hamburger menu for mobile
│   │   │   └── ThemeToggle.tsx      # Sun/moon toggle, localStorage
│   │   ├── ui/
│   │   │   ├── Button.tsx           # Primary, secondary, ghost variants
│   │   │   ├── Card.tsx             # Surface card with border + hover
│   │   │   ├── Input.tsx            # Text input with label
│   │   │   ├── Badge.tsx            # Small tag/label
│   │   │   ├── Container.tsx        # max-w-7xl mx-auto px-4
│   │   │   ├── SectionHeader.tsx    # Consistent h2 + subtitle pattern
│   │   │   └── ScrollReveal.tsx     # IntersectionObserver fade-up wrapper (client component)
│   │   ├── sections/
│   │   │   ├── Hero.tsx             # Home hero with background effect
│   │   │   ├── FeatureCards.tsx      # 3-4 feature highlight cards
│   │   │   ├── HowItWorks.tsx       # 3-step flow
│   │   │   ├── PrivacyStatement.tsx  # Bold trust section
│   │   │   ├── PricingSection.tsx    # Free local + cloud plans + supporter (replaces PricingCard.tsx)
│   │   │   ├── FAQ.tsx              # Expandable FAQ items
│   │   │   ├── WaitlistForm.tsx     # Email capture form
│   │   │   └── CTABanner.tsx        # Reusable bottom CTA section
│   │   └── icons/
│   │       └── Logo.tsx             # InnerZero text logo component
│   ├── lib/
│   │   ├── auth-desktop.ts         # Phase 3b — bearer token auth for desktop app
│   │   ├── blog.ts                 # Blog system — post loading, tags, related posts
│   │   ├── cloud-plans.ts          # Phase 3b — plan lookup helpers
│   │   ├── cloud-providers.ts      # Phase 3b — DeepSeek/Gemini/Claude routing
│   │   ├── constants.ts            # Brand copy, nav links, feature lists, pricing data
│   │   ├── metadata.ts             # SEO helpers: generateMetadata defaults
│   │   ├── rate-limit.ts           # Phase 6 — shared rate limiter
│   │   ├── stripe.ts               # Stripe client helper
│   │   ├── utils.ts                # cn() classname merger, etc.
│   │   └── supabase/               # Supabase client + middleware
│   ├── content/
│   │   └── blog/                   # MDX blog posts (25 articles)
│   └── styles/
│       └── globals.css             # @tailwind directives + CSS custom properties + base styles
├── next.config.ts
├── tailwind.config.ts              # Custom theme extending CSS variables
├── tsconfig.json
├── package.json
├── next-sitemap.config.js
├── .gitignore
├── vercel.json                     # Cron schedule config
├── .env.local                      # Environment variables (not committed)
├── innerzero_web_spec.md           # Full product + infrastructure spec
├── WEBCLAUDE.md                    # This file (website project guide)
└── README.md
```

---

## Route map

| Route | Page | SEO title | Status |
|-------|------|-----------|--------|
| `/` | Home | InnerZero: Private AI Assistant That Runs on Your PC | COMPLETE |
| `/features` | Features | Features \| InnerZero: Private AI Assistant | COMPLETE |
| `/pricing` | Pricing | Pricing \| InnerZero: Free AI, Optional Cloud | COMPLETE |
| `/privacy` | Privacy | Privacy \| InnerZero: Private AI Assistant | COMPLETE |
| `/about` | About | About \| InnerZero: Private AI Assistant | COMPLETE |
| `/contact` | Contact | Contact \| InnerZero: Private AI Assistant | COMPLETE |
| `/waitlist` | Waitlist | Join the Waitlist \| InnerZero | COMPLETE |
| `/download` | Download | Download Free \| InnerZero | COMPLETE |
| `/blog` | Learn | Learn \| InnerZero: Private AI Guides & Updates | COMPLETE |
| `/changelog` | Changelog | Changelog \| InnerZero | COMPLETE |
| `/terms` | Terms | Terms of Service \| InnerZero | COMPLETE |
| `/login` | Login | Log In \| InnerZero | COMPLETE |
| `/register` | Register | Sign Up \| InnerZero | COMPLETE |
| `/forgot-password` | Password Reset | Reset Password \| InnerZero | COMPLETE |
| `/reset-password` | New Password | Set New Password \| InnerZero | COMPLETE |
| `/account` | Dashboard | Account \| InnerZero | COMPLETE |
| `/account/settings` | Settings | Settings \| InnerZero | COMPLETE |

Billing and usage are integrated into the main `/account` page (CloudUsageCard, Manage Billing portal link, usage history). No separate `/account/billing` or `/account/usage` pages.

---

## Page-by-page build spec

### Home (`/`)
Sections in order:
1. **Hero**: Large headline "Your AI. Your machine. Your data." + tagline "inner peace. inner joy. innerzero." + 1-2 line description + primary CTA "Download Free" + secondary "Learn more" link. Background: subtle radial gradient glow (gold centre fading to dark, positioned top-centre, slow CSS pulse animation). Staggered text entrance: headline → tagline → description → CTA with 150ms delays. See "Animations and motion" section for full spec.
2. **Feature cards**: 4 cards in 2x2 grid (stacks to 1 col on mobile). Each: icon + title + 2-line description. Features: Runs locally, Learns & remembers, Voice + text, Hardware-aware.
3. **How it works**: 3-step horizontal flow (stacks vertical on mobile). Each step: number badge + title + description. Steps: Download free → Zero configures itself → Start talking.
4. **Privacy statement**: Full-width dark section with bold headline "Zero data leaves your machine." + 3-4 trust points.
5. **CTA banner**: "Download Free" button + secondary "View pricing" link for cloud/supporter options.

### Features (`/features`)
Full feature breakdown — each feature gets a section with heading + paragraph + optional icon/illustration placeholder. Alternate alignment (left/right) for visual rhythm. Include "Coming Soon" section at bottom for future features (cloud AI boost, multi-device, team, email, mobile). Mention BYO API keys as a feature.

### Pricing (`/pricing`)
Three sections, vertically stacked:

1. **Free Local** — prominent card, highlighted as primary. "Free forever. No account required." Full feature list. "Download Free" CTA.

2. **Cloud AI** — live. Three subscription cards (Starter/Plus/Pro) rendered from /api/cloud/plans (not hardcoded). Dynamic price, usage amounts, tier access badges. Gold CTA on best-value plan. Current Plan/Upgrade/Downgrade badges for logged-in users. PAYG credit pack cards with per-unit pricing. Collapsible usage multiplier info box from model_tiers. Business Licence card (£50/year per seat) with gold border.

3. **Support InnerZero** — Supporter card (£4.99/month via Ko-fi) + Donation option. Perks listed.

Below all cards: FAQ section with expandable items including cloud usage questions.

### Privacy (`/privacy`)
Two distinct sections: (1) plain-language privacy explainer (how InnerZero works, what stays local, what cloud mode sends, what BYO key mode does, that InnerZero never stores prompts), (2) formal privacy policy text.

### Download (`/download`)
**Free download page — no login, no paywall.** System requirements (minimum and recommended specs). Download button (links to GitHub Releases or hosted installer). Brief "what you get" summary. "Need cloud AI? See pricing" secondary link.

### About (`/about`)
What InnerZero is. Why it exists. The mission (AI should be personal and private). About Summers Solutions. Team (just Louie for now — keep it authentic).

### Contact (`/contact`)
Simple form: name, email, subject, message. Submits to Formspree (or similar). Success/error states. Also show email address for direct contact.

### Waitlist (`/waitlist`)
Hero-style page with email capture form. Submits to `/api/waitlist` (POST). Stores to Supabase. Shows success message. Validates email format client-side and server-side.

### Blog (`/blog`)
Full MDX blog system with 25 articles. Nav shows "Learn". Featured card, tag filter bar, 2-column grid. Post pages with related posts, CTA, BlogPosting JSON-LD, SSG. Each post is an MDX file in `src/content/blog/` with gray-matter frontmatter.

### Changelog (`/changelog`)
Timeline layout with version badges, grouped changes with colour-coded category badges (New/Improved/Fixed). Currently showing v0.1.0, v0.1.1, and v0.1.2 releases.

### Terms (`/terms`)
Production Terms of Service with 23 sections. Covers free local software, optional paid cloud services, supporter/founder terms, AI output disclaimer, unrestricted mode liability, screen automation, BYO API keys, absolute prohibitions, hardware/data damage exclusion, scheduled actions. Solicitor review banner. Company address.

### Account (`/account`)
Dashboard with CloudUsageCard (usage progress bar with green/amber/red thresholds, plan badge, reset date, PAYG balance), Manage Billing portal link, Change Plan link, Quick Top Up PAYG buttons, collapsible Usage History (last 20 transactions). No-plan state with CTA to pricing. Profile section, Business Licence status, Community links. Settings page at `/account/settings` with account deletion.

### 404 (`not-found.tsx`)
Branded 404 page. "Looks like you've gone off the grid." Link back to home.

---

## Component conventions

### Naming
- Components: PascalCase (`FeatureCards.tsx`)
- Files: PascalCase for components, camelCase for utils/lib
- CSS classes: Tailwind utilities only — no custom CSS classes unless absolutely necessary
- Props: TypeScript interfaces, named `{Component}Props`

### Component pattern
```tsx
interface FeatureCardsProps {
  className?: string;
}

export function FeatureCards({ className }: FeatureCardsProps) {
  return (
    <section className={cn("py-20", className)}>
      <Container>
        {/* content */}
      </Container>
    </section>
  );
}
```

### Rules
- Every component is a named export (no default exports except page.tsx)
- Every page.tsx exports metadata via `generateMetadata` or static `metadata` object
- No `"use client"` unless the component genuinely needs interactivity (theme toggle, mobile nav, forms, FAQ accordion)
- Server components by default
- No prop drilling beyond 2 levels — if data is needed deeper, restructure
- No global state management — page-level state only where needed
- Tailwind `cn()` utility for conditional classes (use `clsx` + `tailwind-merge`)

### Image handling
- Use Next.js `<Image>` for all images
- Always provide `width`, `height`, and `alt`
- Lazy load by default (Next.js does this)
- No external image URLs in Phase 1 — all images in `/public/images/`
- Placeholder images are fine — real screenshots/graphics added later

---

## SEO checklist (every page)

- [ ] Unique `<title>` via metadata export
- [ ] Unique `<meta name="description">` under 160 chars
- [ ] Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- [ ] Twitter Card: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`
- [ ] One `<h1>` per page
- [ ] Proper heading hierarchy (no skipping levels)
- [ ] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- [ ] All images have descriptive `alt` text
- [ ] Internal links use Next.js `<Link>`
- [ ] Canonical URL set
- [ ] Page is in sitemap

### Structured data (JSON-LD)
- Home page: `Organization` + `SoftwareApplication` (with `offers: { price: "0" }`)
- Pricing page: `SoftwareApplication` with free offer + `Product` for cloud plans
- FAQ sections: `FAQPage`
- Blog posts: `Article`

---

## Theme toggle implementation

```tsx
// ThemeToggle.tsx — client component
"use client";

// On mount: read localStorage or prefers-color-scheme
// On toggle: set data-theme attribute on <html>, save to localStorage
// Icon: Sun for light mode, Moon for dark mode
// Transition: add 'transition-colors duration-200' to <html> in layout
```

In `layout.tsx`, add inline script in `<head>` to prevent flash of wrong theme:
```tsx
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      var theme = localStorage.getItem('theme');
      if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      document.documentElement.setAttribute('data-theme', theme);
    })();
  `
}} />
```

---

## Tailwind config pattern

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          "card-hover": "var(--bg-card-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          gold: "var(--accent-gold)",
          "gold-hover": "var(--accent-gold-hover)",
          "gold-muted": "var(--accent-gold-muted)",
          teal: "var(--accent-teal)",
          "teal-hover": "var(--accent-teal-hover)",
          "teal-muted": "var(--accent-teal-muted)",
        },
        border: {
          DEFAULT: "var(--border)",
          hover: "var(--border-hover)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## API route: waitlist (Phase 1 — COMPLETE, migrated to Supabase in Phase 2)

```
POST /api/waitlist
Body: { "email": "user@example.com" }

Validation:
- email is present
- email matches basic regex
- email is not already in the list

Storage: Supabase waitlist table

Response:
- 200: { "success": true, "message": "You're on the list!" }
- 400: { "success": false, "message": "Please enter a valid email." }
- 409: { "success": false, "message": "This email is already on the waitlist." }
```

---

## Environment variables

### Phase 1-2 (.env.local) — CURRENT
```
NEXT_PUBLIC_SITE_URL=https://innerzero.com
NEXT_PUBLIC_ICO_REGISTRATION_NUMBER=  # ICO registration number (shown in footer + privacy page)
FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxx
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=      # Cloudflare Turnstile site key (CAPTCHA on auth forms)
```

### Phase 3 (added when Stripe is wired)
```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_SUPPORTER=          # £4.99/month supporter subscription
STRIPE_PRICE_FOUNDER=            # £79 one-time founder purchase
STRIPE_PRICE_CLOUD_STARTER=      # £9.99/month (Phase 3b)
STRIPE_PRICE_CLOUD_PLUS=         # £19.99/month (Phase 3b)
STRIPE_PRICE_CLOUD_PRO=          # £39.99/month (Phase 3b)
STRIPE_PRICE_PAYG_100=           # £5 one-time (Phase 3b)
STRIPE_PRICE_PAYG_500=           # £22 one-time (Phase 3b)
RESEND_API_KEY=
```

### Phase 3b (cloud AI proxy)
```
AZURE_DEEPSEEK_API_KEY=          # Azure OpenAI key for DeepSeek deployment
GOOGLE_AI_API_KEY=               # Google AI Studio API key
ANTHROPIC_API_KEY=               # Anthropic API key
CRON_SECRET=                     # Vercel Cron auth secret (must match Vercel env)
```

---

## Responsive breakpoints

Follow Tailwind defaults:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Design targets:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1280px+

Rules:
- Mobile-first: base styles are mobile, add `md:` and `lg:` for larger
- Navigation collapses to hamburger at `md` breakpoint
- Hero headline resizes at `md` and `lg`
- Feature grids: 1 col → 2 col (`md`) → 4 col (`lg`) on home, 1 → 2 on features page
- Pricing section: cards stack to 1 col on mobile, side-by-side on `lg`

---

## Accessibility

- All interactive elements are keyboard accessible
- Focus states visible on all focusable elements (use `focus-visible:ring-2 ring-accent-gold`)
- Colour contrast: WCAG AA minimum (4.5:1 for body text, 3:1 for large text)
- Skip-to-content link at top of page (visually hidden until focused)
- Aria labels on icon-only buttons (theme toggle, hamburger menu)
- Form inputs have associated labels
- Error messages linked to inputs via `aria-describedby`
- Reduced motion: respect `prefers-reduced-motion` — disable all transitions/animations

---

## Animations and motion

The site should feel polished and alive — not static, but never distracting. All animations are CSS-based or use a lightweight IntersectionObserver utility. No animation libraries (no Framer Motion, no GSAP, no AOS).

### Required animations

**Hero section:**
- Subtle radial gradient glow in the background that slowly pulses (CSS `@keyframes`, gold/teal at very low opacity ~0.05-0.1, 8-10s cycle)
- Staggered text entrance on page load: headline fades up first (0ms), tagline (150ms delay), description (300ms), CTA buttons (450ms). Use CSS `@keyframes fadeUp` with `animation-delay` and `animation-fill-mode: backwards`
- Optional: very subtle floating particle dots in the hero background (CSS-only, 5-8 small circles with slow drift animation, `opacity: 0.15`)

**Scroll reveals (all pages):**
- Sections fade up + slight translateY (20px → 0) as they enter the viewport
- Trigger: IntersectionObserver with `threshold: 0.1` and `rootMargin: "0px 0px -50px 0px"`
- Transition: `opacity 0.6s ease, transform 0.6s ease`
- Build a `ScrollReveal` wrapper component (client component, ~20 lines):
  ```tsx
  "use client";
  // Wraps children in a div that starts opacity-0 translate-y-5
  // Uses useRef + useEffect + IntersectionObserver
  // Adds 'revealed' class when in view → opacity-1 translate-y-0
  // Optional stagger prop for child delay
  ```
- Apply to: feature cards, how-it-works steps, pricing cards, privacy points, about sections

**Feature cards:**
- Hover: slight scale (1.02), border colour shifts to `--accent-gold` or `--accent-teal`, subtle glow via `box-shadow`
- Transition: `transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease`

**How It Works steps:**
- Staggered scroll reveal: step 1 appears first, step 2 after 100ms delay, step 3 after 200ms
- Connecting line/dots between steps on desktop (CSS pseudo-elements, decorative only)

**Buttons:**
- Hover: smooth colour transition (150ms), slight translateY(-1px) lift on primary buttons
- Active/pressed: translateY(0) snap back
- Focus: ring animation appears smoothly

**Theme toggle:**
- Icon rotates 180° on toggle (CSS transition on the icon, 300ms)
- Background colours transition smoothly (handled by `transition-colors duration-200` on `<html>`)

**Mobile navigation:**
- Slides in from right (translateX(100%) → 0), with slight backdrop blur fade-in
- Close: reverses the slide
- Duration: 200ms ease-out

**FAQ accordion:**
- Smooth height expand/collapse using CSS `grid-template-rows: 0fr` → `1fr` trick (no JS height calculation needed)
- Chevron icon rotates 180° when open
- Duration: 200ms ease

**Page load:**
- Minimal — just the hero entrance animation. Other content is already visible from SSG, scroll reveals activate as user scrolls.
- No full-page loading screen or skeleton screens needed (pages are static)

**Pricing cards:**
- Free Local card: subtle teal border glow (always-on, not animated — this is the recommended option)
- Supporter/Founder cards: subtle gold border on hover
- Cloud plan cards (when live): standard hover lift

### Not allowed
- No parallax scrolling
- No scroll-jacking or scroll-snapping
- No auto-playing video or audio
- No 3D transforms or WebGL
- No heavy particle systems (the hero dots must be pure CSS, max 8 elements)
- No animations that cause layout shift (CLS)
- No animations on text that delay readability
- No entrance animations above the fold that delay LCP

### Reduced motion
All animations must be wrapped in:
```css
@media (prefers-reduced-motion: no-preference) {
  /* animations here */
}
```
When reduced motion is preferred: no movement, no fades, instant state changes. The site must be fully usable and visually complete without any animation.

---

## Performance targets

- Lighthouse: 95+ on Performance, Accessibility, Best Practices, SEO
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Total page weight: < 500KB on home page (excluding fonts)
- No layout shift from font loading (use `font-display: swap` + size-adjust)
- No render-blocking scripts
- All pages statically generated where possible

---

## Build log

| Phase | Task | Status |
|-------|------|--------|
| **Phase 1** | Initialise Next.js + TypeScript + Tailwind | COMPLETE 2026-03-29 |
| **Phase 1** | CSS custom properties + theme system | COMPLETE 2026-03-29 |
| **Phase 1** | ThemeToggle component | COMPLETE 2026-03-29 |
| **Phase 1** | Header + Footer + MobileNav | COMPLETE 2026-03-29 |
| **Phase 1** | UI components (Button, Card, Input, Badge, Container, SectionHeader) | COMPLETE 2026-03-29 |
| **Phase 1** | Home page — all sections | COMPLETE 2026-03-29 |
| **Phase 1** | Features page | COMPLETE 2026-03-29 |
| **Phase 1** | Pricing page + FAQ | COMPLETE 2026-03-29 |
| **Phase 1** | Privacy page | COMPLETE 2026-03-29 |
| **Phase 1** | About page | COMPLETE 2026-03-29 |
| **Phase 1** | Contact page (Formspree) | COMPLETE 2026-03-29 |
| **Phase 1** | Waitlist page + API route | COMPLETE 2026-03-29 |
| **Phase 1** | Download page (placeholder) | COMPLETE 2026-03-29 |
| **Phase 1** | Blog index (empty shell) | COMPLETE 2026-03-29 |
| **Phase 1** | Changelog (empty shell) | COMPLETE 2026-03-29 |
| **Phase 1** | Terms page | COMPLETE 2026-03-29 |
| **Phase 1** | 404 page | COMPLETE 2026-03-29 |
| **Phase 1** | SEO: metadata on all pages | COMPLETE 2026-03-29 |
| **Phase 1** | SEO: sitemap + robots.txt | COMPLETE 2026-03-29 |
| **Phase 1** | SEO: structured data (JSON-LD) | COMPLETE 2026-03-29 |
| **Phase 1** | Responsive testing | NOT STARTED |
| **Phase 1** | Accessibility pass | NOT STARTED |
| **Phase 1** | Deploy to Vercel | COMPLETE 2026-03-30 |
| **Phase 2** | Supabase setup + schema | COMPLETE 2026-03-29 |
| **Phase 2** | Auth (login / register / reset) | COMPLETE 2026-03-29 |
| **Phase 2** | Account dashboard | COMPLETE 2026-03-29 |
| **Phase 2** | Migrate waitlist to database | COMPLETE 2026-03-29 |
| **Phase 2** | Logo added to site + favicons | COMPLETE 2026-03-30 |
| **Phase 2** | Branded Supabase email templates | COMPLETE 2026-03-30 |
| **Phase 2** | Transactional emails (Resend/Postmark) | NOT STARTED |
| **Pricing pivot** | Update pricing page (free local + cloud coming soon + supporter) | COMPLETE 2026-04-02 |
| **Pricing pivot** | Update home page CTAs (Download Free) | COMPLETE 2026-04-02 |
| **Pricing pivot** | Update download page (free, no paywall) | COMPLETE 2026-04-02 |
| **Pricing pivot** | Update privacy page (cloud mode explanation) | COMPLETE 2026-04-02 |
| **Pricing pivot** | Update FAQ (new pricing questions) | COMPLETE 2026-04-02 |
| **Pricing pivot** | Update terms page (free software + optional services) | COMPLETE 2026-04-02 |
| **Pricing pivot** | Rename PricingCard.tsx → PricingSection.tsx | COMPLETE 2026-04-02 |
| **Pricing pivot** | Update constants.ts pricing copy | COMPLETE 2026-04-02 |
| **Pricing pivot** | Update account dashboard (supporter/founder status) | COMPLETE 2026-04-02 |
| **Terms/Privacy** | Terms and Privacy rewrite — removed placeholder, added unrestricted mode liability/indemnification/18+ gate, AI output disclaimer, acceptable use, third-party software attribution, cloud mode/BYO keys terms, Ko-fi/PayPal as payment processors, Supabase as data processor, GDPR rights, age requirements, Founder tier removed | COMPLETE 2026-04-04 |
| **Fix** | Download link pointed to real installer URL + version/size info line; favicon.ico added to layout.tsx icons metadata (was missing, causing Vercel default to show) | COMPLETE 2026-04-04 |
| **Fix** | favicon.ico converted from renamed PNG to proper ICO container (16x16 + 32x32, 2.5KB) via Pillow; no duplicate terms/privacy page files found — deployment cache issue only | COMPLETE 2026-04-04 |
| **Fix** | Updated Discord invite link to rn9SPXgThT across constants.ts, account page, and PricingSection | COMPLETE 2026-04-04 |
| **Terms** | Strengthened BYO API key liability in Section 7 — added API consumption/billing responsibility paragraph and "entirely at your own risk" clause | COMPLETE 2026-04-04 |
| **Terms** | Added hardware/data damage liability exclusion to Section 13 — covers data loss, file corruption, system instability, GPU damage, driver conflicts, local AI hardware load | COMPLETE 2026-04-04 |
| **Terms** | Added Section 8 Screen Automation liability (disabled by default, unintended actions disclaimer, emergency stop), strengthened AI disclaimer to cover all AI-directed actions, added Screen Automation acceptable use restrictions; renumbered sections 8→18 | COMPLETE 2026-04-04 |
| **Terms** | Strengthened AI accuracy disclaimers — Section 5 now lists specific failure modes (hallucinations, math errors, tool misinterpretation); Section 6 adds unrestricted mode false-confidence warning for medical/legal/financial info | COMPLETE 2026-04-04 |
| **Terms/Privacy** | Added CC BY-SA 4.0 knowledge pack licensing to Section 10; added Sections 17-19 (Severability, Entire Agreement, No Waiver); renumbered to 21 sections. Privacy: added Section 6 Voice and Microphone (local-only audio processing); renumbered to 14 sections | COMPLETE 2026-04-04 |
| **Terms** | Added supported platform/GPU terms to Section 2 — Windows 10/11 64-bit only, NVIDIA CUDA recommended, AMD/Intel unsupported, no macOS/Linux, unsupported usage at own risk | COMPLETE 2026-04-04 |
| **Social** | Added X/Twitter, Instagram, LinkedIn links to footer (via constants.ts Community section) and contact page (icon row with inline SVGs). About page skipped — no natural fit | COMPLETE 2026-04-04 |
| **Business** | Business Licence card on pricing page (£50/year per seat, Stripe payment link), commercial use clause in Terms (Section 5), FAQ item, BUSINESS_LICENCE constant in constants.ts; renumbered Terms to 22 sections | COMPLETE 2026-04-05 |
| **Phase 3** | Stripe integration: checkout API, webhook handler (checkout.session.completed, subscription.updated/deleted, invoice.payment_succeeded/failed), customer portal, account dashboard licence display, dynamic checkout on pricing page, Supabase types updated with licences table + profile columns | COMPLETE 2026-04-05 |
| **Terms** | Complete Terms of Service rewrite — 23 production sections replacing old 22-section draft. Added Section 7 Absolute Prohibitions (CSAM/terrorism/serious crime with NCA/IWF cooperation clause), strengthened all sections, added solicitor review banner, company address, age misrepresentation auto-revocation | COMPLETE 2026-04-06 |
| **Terms** | Section 8 updated: uncensored models not bundled, user-downloaded from Hugging Face via Ollama, Summers Solutions not involved in download. Section 12 bullet updated to note models are optional/user-installed and not distributed by Summers Solutions | COMPLETE 2026-04-06 |
| **Terms** | Section 15: added Consumer Rights Act 2015 statutory rights preservation clause | COMPLETE 2026-04-06 |
| **Terms** | Section 6 (AI Output Disclaimer): added scheduled actions clause — covers AI-interpreted timers, alarms, reminders, countdowns; misinterpretation risk; user verification responsibility; no liability for missed/incorrect/unexpected actions; not sole system for critical matters | COMPLETE 2026-04-06 |
| **Fix** | Mobile nav invisible links — `backdrop-blur-md` on the `<header>` created a containing block that trapped the `fixed inset-0` mobile nav overlay inside the 64px header, clipping all links below the X button. Fix: only apply `backdrop-blur-md` when scrolled AND menu is closed (`scrolled && !mobileMenuOpen`). When menu is open, header uses fully opaque `bg-bg-primary` (no /80 opacity) since the overlay covers everything. Full-screen overlay, opaque bg, increased tap targets, overflow-y-auto from previous fix all retained | COMPLETE 2026-04-06 |
| **Analytics** | Added @vercel/analytics to root layout — privacy-friendly page view + web vital tracking via Vercel, no Google Analytics | COMPLETE 2026-04-06 |
| **Features + Pricing** | Features page fully rewritten with 10 category sections (AI Chat, Voice, Memory, Tools, Knowledge Packs, Screen Automation, Cloud AI, Customisation, Unrestricted Mode, Coming Soon), ~50 feature items in responsive grids, alternating bg sections, SoftwareApplication JSON-LD. Pricing: Business Licence card promoted to Section B with gold border. Free card updated with 11 shipped features. Cloud section updated. New FAQ item. Home page feature cards refreshed. | COMPLETE 2026-04-09 |
| **Phase 6** | Rate limiting, GDPR deletion, security hardening. Shared rate limiter at `src/lib/rate-limit.ts` (token bucket, auto-cleanup, preset configs). Applied to all 7 API routes: waitlist (5/min), checkout (10/min), portal (10/min), webhook (100/min), licence validate/status (30/min), account delete (3/min). Licence routes migrated from inline to shared util. GDPR: account deletion route now cleans up licences, devices, licence_events, profiles, waitlist, then auth user (best-effort). Privacy page updated with deletion link to /account/settings. Stripe checkout: price ID whitelist validation. Waitlist: email length cap (320). Licence: key length cap (100), device_fingerprint cap (200). Webhook: signature verification already present. Security headers in next.config.ts: X-Content-Type-Options, X-Frame-Options, Referrer-Policy. Delete account UI already existed from Phase 2. | COMPLETE 2026-04-09 |
| **Download + Changelog** | Download page: added "What's Included" section with 12-item feature grid (3 col desktop, 2 tablet, 1 mobile) using Lucide icons, teal accent, hover lift. SmartScreen notice for first-install warning. Changelog link below version line. Changelog page: full build with 2 releases (v0.1.1 + v0.1.0), timeline layout, version badges (gold for latest), grouped changes with colour-coded category badges (New=teal, Improved=gold, Fixed=green). Changelog already in footer from Phase 1. | COMPLETE 2026-04-09 |
| **Cleanup** | Removed all 86 em dashes across 27 files site-wide (constants.ts, all page files, blog posts, metadata, privacy, terms, pricing section, comments). Replaced with colons, commas, semicolons, or restructured sentences as appropriate. Blog post titles with em dash separators changed to colons. Legal text in terms/privacy carefully preserved with commas and semicolons. Metadata titles use colons. Favicon: verified proper ICO container (16x16 + 32x32), added cache-busting `?v=2` to favicon.ico reference in layout.tsx. Route map statuses updated: Home, Pricing, Privacy, Download, Terms, Account all marked COMPLETE. Blog renamed to Learn in route map. | COMPLETE 2026-04-09 |
| **Blog/Learn** | Complete blog system. Nav "Blog" renamed to "Learn" (URL stays /blog). MDX blog with gray-matter + next-mdx-remote. `src/lib/blog.ts` (getAllPosts, getPostBySlug, getRelatedPosts, getAllTags). Index: featured card, tag filter bar, 2-col grid. Post page: MDX prose, related posts, CTA, BlogPosting JSON-LD, SSG, canonical URLs. **20 articles total.** Batch 1 (Apr 7): launch announcement (featured), local AI explainer, setup guide, memory benefits, voice mode, ChatGPT comparison. Batch 2 (Apr 8): hardware guide, models explainer, 5 things to do, privacy deep dive, remote Ollama guide, origin story. Batch 3 (Apr 9): offline AI guide, best free AI Windows 2026, AI without subscription, open-source models explained, local vs cloud AI, knowledge packs explained, unrestricted mode explained, customise InnerZero. Prose CSS in globals.css. Sitemap picks up all 21 pages. | COMPLETE 2026-04-09 |
| **v0.1.2 Download + Changelog** | Download page rewritten for all 3 platforms. `DownloadCards.tsx` client component: auto-detects user OS via navigator.userAgent, highlights matching platform card as primary (gold border + "Your OS" badge), shows all three. Each card: download button, version/size/requirements, platform-specific install note (SmartScreen, Gatekeeper, glibc), collapsible CLI section with copyable command. Changelog: v0.1.2 entry with 11 New, 6 Improved, 7 Fixed. v0.1.1 no longer marked latest. "macOS and Linux planned" note removed. | COMPLETE 2026-04-08 |
| **Phase 4** | Licence validation API (`/api/licence/validate` POST, `/api/licence/status` POST), types in `src/types/licence.ts`, in-memory rate limiter (30/min/IP), device registration + revalidation, seat enforcement, licence event logging | COMPLETE 2026-04-06 |
| **Phase 3** | Founder slot tracking (100 cap) | NOT STARTED |
| **Phase 3** | Account dashboard: plan + supporter + founder display | NOT STARTED |
| **Phase 3b** | Cloud subscription + PAYG webhook handling: cloud_plans table lookup, checkout.session.completed (subscription + payg), subscription.updated (upgrade/downgrade mid-cycle), subscription.deleted (cancel with balance retention), invoice.payment_succeeded (renewal reset), invoice.payment_failed (past_due). Helper module `src/lib/cloud-plans.ts` (getCloudPlanByPriceId, getCloudPlanByProductId, grantUsage, deductUsage). Supabase types updated with cloud_plans, model_tiers, usage_transactions, usage_packs tables + new profile columns (plan, usage_balance, usage_monthly_allowance, founder, billing_cycle_end, overage_enabled, spending_cap_pence). All plan resolution via DB lookup, no hardcoded IDs. Existing business licence webhook handling preserved | COMPLETE 2026-04-13 |
| **Phase 3b** | Checkout API updated for cloud plans: accepts `plan_id`, looks up `cloud_plans` table for stripe_price_id and plan_type, creates Stripe Checkout in subscription or payment mode with metadata. Get-or-create Stripe customer. Business licence checkout preserved. `getCloudPlanById` helper added to `cloud-plans.ts`. Portal route already correct (no changes needed) | COMPLETE 2026-04-13 |
| **Phase 3b** | Cloud API endpoints for desktop app: `/api/cloud/balance` GET (returns plan, usage_balance, allowance, billing_cycle_end, overage, spending_cap, tier_access from cloud_plans join, active PAYG packs, all model_tiers), `/api/cloud/deduct` POST (looks up model_tiers.usage_multiplier, deducts from subscription balance first then oldest PAYG pack, rate limited 10/min), `/api/cloud/plans` GET (public, returns all active cloud_plans + model_tiers ordered by sort_order). Shared `src/lib/auth-desktop.ts` helper for bearer token auth. Supabase types updated: model_tiers +sort_order/active/usage_multiplier/models, cloud_plans +sort_order, usage_packs +expires_at. Rate limit preset `cloudDeduct` added | COMPLETE 2026-04-13 |
| **Phase 3b** | Pricing page: cloud plans rendered from `/api/cloud/plans` (not hardcoded). Subscription cards (Starter/Plus/Pro) with dynamic price, usage amount, tier access from DB. Gold CTA on best-value (middle) plan. Current Plan/Upgrade/Downgrade badges for logged-in users. PAYG credit pack cards with per-unit pricing. Collapsible usage multiplier info box pulling from model_tiers. 2 new FAQ items (What is usage?, What happens when usage runs out?). Existing Free, Business Licence, Supporter, Donation sections preserved. `CLOUD_PLANS` constant no longer imported in PricingSection | COMPLETE 2026-04-13 |
| **Phase 3b** | Account page cloud usage: `CloudUsageCard` client component with usage progress bar (green/amber/red thresholds), plan name badge, reset date, PAYG top-up balance, Manage Billing (opens portal in new tab), Change Plan link. No-plan state with CTA to pricing. Quick Top Up buttons for PAYG packs from API. Collapsible Usage History (last 20 transactions via new `/api/cloud/usage-history` GET endpoint). Replaced old InnerZero status + Quick Links sections. Profile, Business Licence, Community links preserved | COMPLETE 2026-04-13 |
| **Phase 4** | Licence validation API (validate + status endpoints) | COMPLETE 2026-04-06 |
| **Phase 4** | Cloud API proxy endpoint (`/api/cloud/proxy` POST): bearer auth, accepts messages + model_tier + system_prompt. Checks plan/PAYG access, tier permission via cloud_plans.tier_access, usage balance. Selects model from model_tiers.models array (provider/model_id format). Routes to DeepSeek (Azure), Google Gemini, or Anthropic Claude via `src/lib/cloud-providers.ts` (format transformation per provider). 30s timeout, no usage deduction on failure (502). Privacy-preserving console logs (no content/IPs). Returns X-Usage-Remaining header. Rate limited 10/min. Input limits: system_prompt 2000 chars, messages last 10. Env vars: AZURE_DEEPSEEK_API_KEY, GOOGLE_AI_API_KEY, ANTHROPIC_API_KEY | COMPLETE 2026-04-13 |
| **Phase 3b** | Cron safety nets: `/api/cron/reset-usage` GET (daily 03:00 UTC, resets usage_balance for profiles with billing_cycle_end < now, advances cycle by 1 month, inserts monthly_grant transaction). `/api/cron/expire-packs` GET (daily 03:00 UTC, zeros expired usage_packs, subtracts from profiles.usage_balance, inserts expiry transaction). Both protected by CRON_SECRET bearer auth. `vercel.json` created with cron schedule. Primary reset via Stripe webhook, crons are safety net | COMPLETE 2026-04-13 |
| **Fix** | Favicon: resolved dual-file conflict (public/favicon.ico + src/app/favicon.ico). Deleted public/ copy, kept src/app/favicon.ico (Next.js 14 App Router convention, auto-generates link tag). Removed icons.icon from layout.tsx metadata (was conflicting with file-based route, causing flicker). Removed ?v=2 cache busting. Added Cache-Control header for /favicon.ico (max-age=0, must-revalidate) in next.config.ts. File confirmed as proper ICO container (16x16 + 32x32, 2.5KB) | COMPLETE 2026-04-13 |
| **Privacy/Legal** | ICO registration number added to Privacy Policy Section 1 (Who We Are) and Footer, pulled from env `NEXT_PUBLIC_ICO_REGISTRATION_NUMBER`. New Section 4 "Cloud AI Service (Managed Subscription)" covering: data sent (messages + last 4 exchanges + model pref), data NOT sent (memory, profile, files, IP), proxy log retention (30 days, billing only), AI provider DPAs (Microsoft Azure EU, Google, Anthropic), BYO key direct-to-provider. Data Processors updated: Stripe added (cloud AI payments), removed "will add Stripe" placeholder. Sections renumbered 1-15 (was 1-14). Footer: ICO registration in small text below "Built by Summers Solutions" | COMPLETE 2026-04-13 |
| **Fix** | `/api/cloud/plans` model_tiers query returned empty array: select included non-existent columns `display_name` and `cost_per_request`. Fixed to select only actual columns: `id, name, usage_multiplier, models, sort_order`. Added `console.error` logging for both Supabase query errors | COMPLETE 2026-04-13 |
| **Fix** | Pricing page: subscription card CTA buttons misaligned when cards had different tier_access counts. Added `flex flex-col` to card container, changed button div from `mt-6` to `mt-auto pt-6` to push buttons to bottom | COMPLETE 2026-04-13 |
| **Fix** | Pricing page: added `id="cloud-ai"` and `id="pay-as-you-go"` anchor IDs to section elements for desktop app deep-linking (`innerzero.com/pricing#cloud-ai`, `innerzero.com/pricing#pay-as-you-go`) | COMPLETE 2026-04-13 |
| **SEO** | JSON-LD structured data added across all key pages. Home: Organization (foundingDate 2025, Birmingham GB, logo, sameAs: X/Instagram/LinkedIn/Discord/GitHub, parentOrg Summers Solutions) + SoftwareApplication (v0.1.2, Windows/macOS/Linux, featureList, downloadUrl) + WebSite (SearchAction). Pricing: FAQPage now includes CLOUD_FAQ items (moved to constants.ts, imported in both PricingSection and pricing/page.tsx). Download: SoftwareApplication with 3 per-platform Offers (Windows EXE, macOS DMG, Linux AppImage, each with direct download URL + OS). About: full Organization schema. Blog [slug]: BlogPosting fixed: author changed to Organization (@id reference), publisher with logo ImageObject, mainEntityOfPage typed as WebPage. Shared JsonLd.tsx helper component created. | COMPLETE 2026-04-13 |
| **SEO** | Blog post metadata updated for search intent. 4 existing posts updated (frontmatter title + description only, slugs and body unchanged): innerzero-is-live (now targets "Free Private AI Assistant for Windows Mac Linux"), customise-innerzero (now targets "How to Customise Your Local AI Assistant"), knowledge-packs-explained (now targets "How to Give Your AI Offline Access to Wikipedia"), unrestricted-mode-explained (now targets "Uncensored Local AI"). 5 new comparison/search-intent posts added: innerzero-vs-gpt4all (honest GPT4All comparison with table), innerzero-vs-lm-studio (model playground vs full assistant, notes LM Studio backend compatibility), innerzero-vs-jan (Jan comparison with table), ollama-desktop-app (Ollama GUI comparison: Open WebUI, Chatbox, Msty, Jan, InnerZero), ai-that-remembers (local memory vs cloud memory, sleep pipeline, privacy). All posts: no em dashes, casual tone, 600-800 words, internal links to /download and other posts, fair to competitors. | COMPLETE 2026-04-13 |
| **Phase 4** | Credit metering + overage: spending caps enforced (spending-cap.ts, /api/cloud/spending-cap), usage threshold alerts (usage-alerts.ts via Resend), server-side cost logging (proxy_cost_log, PROVIDER_COSTS). Overage billing deferred by design (overage_enabled defaults to false) | COMPLETE 2026-04-14 |
| **Phase 4** | Spending caps + usage alerts (see above) | COMPLETE 2026-04-14 |
| **Features** | Features page: removed "for Windows" from metadata title (now cross-platform after v0.1.2). Coming Soon: replaced shipped "Linux support" with "Mac code signing" and "Windows code signing" (in progress). Swapped icon assignments accordingly | COMPLETE 2026-04-09 |
| **SEO** | Set `public/banner.png` (1536x1024) as site-wide Open Graph and Twitter Card image. Updated `metadata.ts` defaults, blog post fallback in `[slug]/page.tsx`, and middleware matcher to exclude `banner.png` from auth. Replaces previous `og-default.png` references | COMPLETE 2026-04-09 |
| **Fix** | OG image URLs changed from relative (`/banner.png`) to absolute (`https://innerzero.com/banner.png`) in `metadata.ts` and blog `[slug]/page.tsx`. Facebook debugger requires explicit absolute URLs. Blog fallback dimensions corrected to 1536x1024 | COMPLETE 2026-04-09 |
| **Phase 5** | Desktop app account.py module | COMPLETE (built in desktop app codebase, Phase 5/3b) |
| **Phase 5** | Desktop app cloud routing integration | COMPLETE (built in desktop app codebase, Phase 5) |
| **Phase 5** | Desktop app BYO API key UI | COMPLETE (built in desktop app codebase, Phase 5) |
| **Phase 5** | Update check API | NOT STARTED |
| **Phase 6** | Rate limiting: shared rate limiter applied to all API routes (see Phase 6 entry above) | COMPLETE 2026-04-09 |
| **Phase 6** | Error monitoring | NOT STARTED |
| **Phase 6** | GDPR: account deletion route with full cleanup (see Phase 6 entry above) | COMPLETE 2026-04-09 |
| **Phase 6** | Analytics (Plausible/Fathom) | NOT STARTED |
| **Phase 6** | Security audit (partial): CORS headers + Origin check on cloud API routes, RLS on proxy_cost_log, idempotency protection, provider fallback, output token caps, spending caps, security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) | COMPLETE 2026-04-14 |
| **Housekeeping** | WEBCLAUDE.md sync: updated current state, brand identity, file structure (added cloud/cron API routes, lib modules, JsonLd, DownloadCards, blog content dir, vercel.json), route map (removed non-existent billing/usage subpages), pricing/blog/changelog/terms/account page specs to reflect what was built, cloud AI copy block, dependencies to match package.json, Phase 5 desktop items to COMPLETE, fixed filename reference | COMPLETE 2026-04-14 |
| **Phase 6** | CORS protection for cloud API routes: `next.config.ts` CORS headers on `/api/cloud/:path*` (Access-Control-Allow-Origin: https://innerzero.com, Allow-Methods: POST/GET/OPTIONS, Allow-Headers: Authorization/Content-Type). Defence-in-depth Origin check in `src/lib/auth-desktop.ts` — rejects requests with non-innerzero.com Origin header (403), passes desktop requests (no Origin header) and same-origin browser requests. CloudUsageCard verified: fetches `/api/cloud/plans` and `/api/cloud/usage-history` same-origin, unaffected by CORS config | COMPLETE 2026-04-14 |
| **Phase 6** | Idempotent cloud usage deduction: optional `request_id` field (1-64 alphanumeric/hyphens) in `/api/cloud/proxy` and `/api/cloud/deduct` request bodies. Before deducting, checks `usage_transactions` for existing `request_id` — if found, returns cached result without double-deducting. `deductUsage` in `cloud-plans.ts` passes `request_id` through to insert. Supabase types updated with `request_id` column. **Requires DB migration**: `ALTER TABLE usage_transactions ADD COLUMN request_id TEXT; CREATE UNIQUE INDEX idx_usage_transactions_request_id ON usage_transactions (request_id) WHERE request_id IS NOT NULL;` Backwards-compatible: old clients without `request_id` work unchanged | COMPLETE 2026-04-14 |
| **Phase 6** | Server-side cost tracking for cloud proxy calls. `PROVIDER_COSTS` table and `estimateCostPence()` helper in `src/lib/cloud-providers.ts` — pence-per-1K-token rates for DeepSeek V3.2 (Azure), Gemini 2.5 Flash, Claude Sonnet 4.6. `/api/cloud/proxy` inserts fire-and-forget row into `proxy_cost_log` after each successful call (user_id, request_id, provider, model_id, input/output tokens, estimated_cost_pence, usage_deducted). Token counts already returned by all three provider functions. Supabase types updated with `proxy_cost_log` table. **Requires DB migration**: `CREATE TABLE proxy_cost_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users NOT NULL, request_id text, provider text NOT NULL, model_id text NOT NULL, input_tokens integer NOT NULL, output_tokens integer NOT NULL, estimated_cost_pence numeric(10,4) NOT NULL, usage_deducted integer NOT NULL, created_at timestamptz DEFAULT now()); ALTER TABLE proxy_cost_log ENABLE ROW LEVEL SECURITY;` (no RLS policies — service role only) | COMPLETE 2026-04-14 |
| **Phase 6** | Provider fallback for cloud proxy. `ProviderUnavailableError` class in `cloud-providers.ts` — thrown on 5xx, timeout, or connection errors (distinct from config/4xx errors). Each provider function accepts `timeoutMs` parameter. `/api/cloud/proxy` iterates up to 2 models from the tier's models array: if first provider throws `ProviderUnavailableError`, logs fallback event and tries next. Non-provider errors (missing API key, 4xx) break immediately. Timeout: 15s per provider when fallback available, 30s when single model. `X-Provider` response header identifies which provider served the request. Cost log and deduction use the actual successful provider/modelId. Single-model tiers behave exactly as before | COMPLETE 2026-04-14 |
| **Phase 5** | Desktop login token flow includes refresh_token. `LoginForm.tsx` detects `?desktop=true` query param (via `useSearchParams`). After successful Supabase login, instead of redirecting to /account, shows a "Connect InnerZero" screen with a base64-encoded token containing both `access_token` and `refresh_token` (format: `btoa(JSON.stringify({at, rt}))`). User copies one string, pastes into desktop app. Login page wrapped in `<Suspense>` for Next.js `useSearchParams` requirement. Normal (non-desktop) login flow unchanged. Desktop app `login_to_account()` will decode this format to extract both tokens | COMPLETE 2026-04-14 |
| **Phase 4** | Usage threshold email alerts. New `src/lib/usage-alerts.ts` — `checkAndSendUsageAlert()` checks if balance crossed 50%/20%/5%/0% thresholds, sends email via Resend API, updates `usage_alerts_sent` in profiles. `sendUsageEmail()` builds threshold-specific HTML (friendly tone, balance info, top-up links). Fire-and-forget from both `/api/cloud/proxy` and `/api/cloud/deduct` after subscription deductions. PAYG-only users skipped (no monthly allowance). `usage_alerts_sent` (jsonb, default []) reset to [] in webhook `handleInvoicePaymentSucceeded` and cron `reset-usage`. Env: `RESEND_API_KEY` (silently skips if not set). **Requires DB migration**: `ALTER TABLE profiles ADD COLUMN usage_alerts_sent jsonb DEFAULT '[]';` | COMPLETE 2026-04-14 |
| **Pricing** | Managed cloud provider clarity on pricing page. `PricingSection.tsx` — added info text below subscription cards: lists managed providers (DeepSeek, Google Gemini, Anthropic Claude) and BYO key providers (OpenAI, xAI Grok, Qwen, Kimi). Added note below PAYG cards: "PAYG credits use the same managed providers as subscription plans." text-secondary/text-muted styling, compact, no card wrappers | COMPLETE 2026-04-14 |
| **Fix** | Privacy/marketing wording. Privacy page: split IP claim into separate bullet — "Your IP address is not included in the data sent to AI providers and is not stored in InnerZero application logs" (replaces overly absolute "IP stripped at proxy" wording). PricingSection: "Your data stays private" changed to "with built-in privacy controls" (avoids implying cloud mode is fully private when data leaves the machine) | COMPLETE 2026-04-14 |
| **Phase 4** | Spending cap enforcement. New `src/lib/spending-cap.ts` — `checkSpendingCap()` calculates estimated spend this billing cycle (SUM of usage_transactions * 0.5p/unit), rejects with 402 if cap exceeded. `getSpendingThisCyclePence()` shared by cap check and balance endpoint. New `/api/cloud/spending-cap` POST route (bearer auth, validates 0-100000 range, updates profiles.spending_cap_pence). Cap check added before deduction in both `/api/cloud/proxy` and `/api/cloud/deduct` — subscription users only, skipped when cap=0 or PAYG-only. `/api/cloud/balance` now returns `spending_this_cycle_pence`. No DB migration needed (spending_cap_pence and overage_enabled columns already exist) | COMPLETE 2026-04-14 |
| **Phase 4** | Output token cap + PROVIDER_COSTS correction. `cloud-providers.ts` — Google Gemini now has `generationConfig: { maxOutputTokens: 2048 }` (DeepSeek and Anthropic already had max_tokens: 2048). PROVIDER_COSTS rewritten with verified April 2026 rates: DeepSeek V3.2 via Azure ($0.58/$1.68 per 1M), Gemini 2.5 Flash ($0.30/$2.50), Gemini 2.5 Flash-Lite ($0.10/$0.40), Claude Haiku 4.5 ($1.00/$5.00), Claude Sonnet 4.6 ($3.00/$15.00), Claude Opus 4.6 ($5.00/$25.00). All converted to GBP pence/1K at $1=£0.79, rounded up. `estimateCostPence()` now falls back to most expensive rate (Claude Opus) for unknown models instead of returning 0 | COMPLETE 2026-04-14 |
| **Webhook idempotency** | Stripe webhook replay protection. (1) Event ID deduplication: POST handler checks `usage_transactions.request_id = event.id` before processing; returns 200 with `duplicate: true` if already seen. (2) `grantUsage()` in `cloud-plans.ts` gains optional `request_id` param; checks for existing transaction before insert, handles unique constraint violation as no-op. `handleCheckoutCompleted` and `handleInvoicePaymentSucceeded` pass `event.id` as request_id. (3) Subscription lifecycle idempotency: `handleSubscriptionUpdated` skips if plan+status+allowance already match; `handleSubscriptionDeleted` skips if already free+cancelled; `handleInvoicePaymentFailed` skips if already past_due. Prevents replayed events from granting duplicate credits or corrupting resubscribed state. | COMPLETE 2026-04-15 |
| **Turnstile CAPTCHA** | Cloudflare Turnstile CAPTCHA added to login, register, and forgot-password forms. New reusable `src/components/ui/Turnstile.tsx` client component: loads script once, renders widget, exposes token via onVerify callback, cleans up on unmount. Each form captures captchaToken in state, passes to Supabase auth call via options.captchaToken (server-side validation by Supabase GoTrue). Submit button disabled until token received. Graceful degradation: component returns null if NEXT_PUBLIC_TURNSTILE_SITE_KEY not set. Password change form (/account/settings) and desktop login flow (?desktop=true) unchanged. NEXT_PUBLIC_TURNSTILE_SITE_KEY added to env vars in WEBCLAUDE.md. | COMPLETE 2026-04-15 |
| **Security fixes** | (1) Password change now requires current password verification. ChangePasswordForm verifies via supabase.auth.signInWithPassword() before calling updateUser(). Prevents session hijack password changes. Email passed from SettingsForms props. (2) Supabase migration 002: revoked INSERT/UPDATE/DELETE on theme_codes and theme_redemptions from authenticated and anon roles. Defence in depth alongside existing RLS default-deny. | COMPLETE 2026-04-15 |
| **Features page** | Added v0.1.3 features: privacy blacklist, connection log, My Privacy page, cloud voice Standard mode, xAI Grok + Kimi providers (7 total). Themes updated to 6 (added Neon Tokyo). Removed shipped items from Coming Soon (LM Studio, Windows code signing). Updated BYO key count to 7. JSON-LD operatingSystem updated for cross-platform. | COMPLETE 2026-04-15 |
| **Security audit** | Auth forms audited for GET credential leaks. All 4 forms (RegisterForm, LoginForm, ForgotPasswordForm, ResetPasswordForm) confirmed: e.preventDefault() present, no form action or method="GET", passwords only sent via Supabase SDK (POST internally), no credentials in URLs or query params. No code changes needed. | COMPLETE 2026-04-15 |
| **Privacy page** | Privacy page: added ICO registration (ZC122497), FAQPage JSON-LD schema, AEO-optimised content structure, trust and compliance section, improved heading hierarchy and meta description. | COMPLETE 2026-04-15 |
| **v0.1.3 release** | Download page updated to v0.1.3 links, changelog entry added, innerzero-releases README updated. | COMPLETE 2026-04-15 |
| **Phase 5** | Theme unlock API. New `/api/theme/redeem` POST route — validates code (SHA256 hash lookup in `theme_codes` table), checks expiry + max_uses + per-device uniqueness, inserts into `theme_redemptions`, increments uses. Optional bearer auth attaches user_id. Rate limited 5/min. Supabase types updated with `theme_codes` and `theme_redemptions` tables. **Requires DB migration**: `CREATE TABLE theme_codes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code_hash text NOT NULL UNIQUE, theme_id text NOT NULL, label text NOT NULL, max_uses integer NOT NULL DEFAULT 100, uses integer NOT NULL DEFAULT 0, expires_at timestamptz NULL, created_at timestamptz DEFAULT now()); ALTER TABLE theme_codes ENABLE ROW LEVEL SECURITY; CREATE TABLE theme_redemptions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code_id uuid REFERENCES theme_codes(id) NOT NULL, user_id uuid REFERENCES auth.users NULL, device_fingerprint text NOT NULL, redeemed_at timestamptz DEFAULT now(), UNIQUE(code_id, device_fingerprint)); ALTER TABLE theme_redemptions ENABLE ROW LEVEL SECURITY;` | COMPLETE 2026-04-14 |

---

## Rules for Claude Code

### General
- Read this entire file AND `innerzero_web_spec.md` before starting any work
- Match the design system exactly — colours, spacing, typography as specified above
- Do not install packages not listed in the tech stack without explicit approval
- Do not add "use client" to components that don't need interactivity
- Do not add animations beyond what is specified in the "Animations and motion" section — follow that spec exactly
- Do not add placeholder Lorem Ipsum text — use real copy based on the brand and spec
- Do not import from external CDNs — bundle everything locally
- Keep components small and focused — one responsibility per component
- Update the build log in this file after completing each task

### Styling
- Use Tailwind utility classes exclusively — no custom CSS classes unless impossible to avoid
- All colour values via CSS variables mapped through Tailwind config — never hardcode hex values in components
- Dark theme is default — light theme is the override via `[data-theme="light"]`
- Test both themes after every visual change

### TypeScript
- Strict mode enabled
- No `any` types
- All component props defined as interfaces
- All API request/response types defined

### SEO
- Every page.tsx must have metadata
- Every image must have alt text
- One h1 per page, never skip heading levels
- Use semantic HTML elements

### Copy and branding
- Product name is always "InnerZero" (one word, capital I and Z)
- Casual reference is "Zero"
- Never "Inner Zero" (two words)
- Tagline: "inner peace. inner joy. innerzero." (all lowercase, periods)
- Currency is GBP (£)
- Local app is always described as "free" — never "freemium", never "free tier", never "free plan"
- Cloud plans are "optional" — never imply they are required

### File management
- All new files go in the correct directory per the file structure above
- No files outside of the defined structure without explicit reason
- Keep the `/data/` directory in `.gitignore` (legacy waitlist data)

### Testing changes
- Run `npm run build` after significant changes to catch build errors
- Check all pages render without errors
- Verify responsive layout at 375px, 768px, and 1280px widths

### Progress updates
- After completing a group of tasks, update the build log table above
- Change status from `NOT STARTED` to `COMPLETE` with date
- If something is partially done, use `IN PROGRESS`
- If a task is blocked, use `BLOCKED — reason`

---

## Quick reference: key copy blocks

### Hero
**Headline:** Your AI. Your machine. Your data.
**Tagline:** inner peace. inner joy. innerzero.
**Description:** InnerZero is a private AI assistant that runs entirely on your PC. Free forever. No cloud required. Just you and your AI.
**Primary CTA:** Download Free
**Secondary CTA:** Learn more

### Feature card titles + descriptions
1. **Runs 100% Locally** — Your conversations never leave your machine. No cloud servers. No data uploads. Ever.
2. **Learns & Remembers** — InnerZero builds personal memory from every conversation. It knows you better over time.
3. **Voice + Text** — Talk to Zero or type — your choice. Full voice interaction with speech recognition and natural responses.
4. **Hardware-Aware** — InnerZero detects your PC's capabilities and automatically configures the best AI model for your system.

### How it works steps
1. **Download Free** — One click. InnerZero handles everything — dependencies, models, configuration.
2. **Zero Configures Itself** — Detects your hardware, downloads the right AI model, and optimises for your system.
3. **Start Talking** — Text or voice. Zero remembers everything locally. Your private AI assistant is ready.

### Privacy statement
**Headline:** Zero data leaves your machine.
**Points:**
- All AI processing happens on your hardware
- Memory stored in a local database — never uploaded
- No account required — no sign-up, no login, no tracking
- Optional cloud mode is your choice — off by default, transparent when on

### Pricing section copy

**Free Local card:**
**Title:** InnerZero
**Price:** Free forever
**Description:** Full AI assistant on your PC. No account. No limits. No catch.
**Features:** Local AI chat, voice, memory, 30+ tools, document knowledge, sleep/reflection, all themes
**CTA:** Download Free

**Cloud AI section:**
**Title:** Cloud AI
**Subtitle:** Optional. Faster reasoning, premium models, zero hassle.
**Note:** From £9.99/month. Or add your own API keys, free, zero markup.

**Supporter card:**
**Title:** Support InnerZero
**Price:** £4.99/month
**Description:** Help fund development. Get supporter badge, extra themes, early access, and Discord perks.
**CTA:** Become a Supporter

**Founder card:**
**Title:** Founder
**Price:** £79 one-time
**Description:** Limited to 100. Permanent supporter perks + future hosted access. X remaining.
**CTA:** Claim Founder Spot

### FAQ (pricing page)

**Is InnerZero really free?**
Yes. The desktop app is completely free. No trial. No subscription. No account required. It runs on your hardware using open-source AI models.

**What are cloud plans?**
Optional. If you want faster reasoning or access to premium AI models (Claude, GPT, DeepSeek), you can subscribe to a cloud plan. Your local AI always works without one.

**Can I use my own API keys?**
Yes. Add your own API keys from any supported provider — DeepSeek, OpenAI, Anthropic, and more. Zero markup. We never touch your keys.

**What does the Supporter tier include?**
Supporter is a monthly donation to fund InnerZero development. You get a supporter badge, extra themes, early access to new features, and a Discord role. It does not include cloud AI credits.

**What is the Founder tier?**
A one-time £79 purchase, limited to the first 100 buyers. You get permanent supporter perks plus access to the future hosted version when it launches. Once 100 are claimed, it's gone.

**Is my data private?**
Yes. All AI processing, memory, and conversations stay on your machine. If you enable cloud mode, your prompts are forwarded to the AI provider and returned — InnerZero never stores or reads them.

**Do I need an account?**
No. The local app works without any account. You only need an account if you want cloud AI plans, supporter perks, or future hosted features.

### 404
**Headline:** Looks like you've gone off the grid.
**Description:** The page you're looking for doesn't exist. But don't worry — your data is still safe on your machine.
**CTA:** Back to Home

---

## Dependencies

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.9.0",
    "@supabase/supabase-js": "^2.100.1",
    "@vercel/analytics": "^2.0.1",
    "clsx": "^2.1.1",
    "gray-matter": "^4.0.3",
    "lucide-react": "^1.7.0",
    "next": "16.2.1",
    "next-mdx-remote": "^6.0.0",
    "next-sitemap": "^4.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "stripe": "^22.0.0",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

Stripe, gray-matter, and next-mdx-remote are already installed. Do not add any other packages without explicit instruction.
