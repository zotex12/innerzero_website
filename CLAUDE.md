# InnerZero Website — Project Guide for Claude Code

## What this project is

Marketing website and account portal for InnerZero (innerzero.com), a local-first private AI desktop assistant. Built with Next.js, TypeScript, and Tailwind CSS.

The full product and infrastructure spec is in `innerzero_web_spec.md` — read it before making any architectural decisions.

## Current phase

**Phase 1: Marketing Frontend**

Status: Phase 2 COMPLETE — Supabase auth, database, accounts. Pending: transactional emails, responsive/accessibility testing, Vercel deploy.

No backend, no database, no auth, no Stripe. Pure static marketing site with email capture.

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
| Hosting | Vercel | Deploy from GitHub, auto HTTPS |
| Analytics | None yet | Plausible or Fathom later (never Google Analytics) |

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
| Pricing | £9.99/month or £79.99/year |
| Trial | 14 days free, full access, no card required |

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
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── changelog/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── not-found.tsx            # Custom 404
│   │   └── api/
│   │       └── waitlist/route.ts    # POST: email capture
│   ├── components/
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
│   │   │   ├── PricingCard.tsx       # Single plan card
│   │   │   ├── FAQ.tsx              # Expandable FAQ items
│   │   │   ├── WaitlistForm.tsx     # Email capture form
│   │   │   └── CTABanner.tsx        # Reusable bottom CTA section
│   │   └── icons/
│   │       └── Logo.tsx             # InnerZero text logo component
│   ├── lib/
│   │   ├── constants.ts            # Brand copy, nav links, feature lists
│   │   ├── metadata.ts             # SEO helpers: generateMetadata defaults
│   │   └── utils.ts                # cn() classname merger, etc.
│   └── styles/
│       └── globals.css             # @tailwind directives + CSS custom properties + base styles
├── next.config.ts
├── tailwind.config.ts              # Custom theme extending CSS variables
├── tsconfig.json
├── package.json
├── next-sitemap.config.js
├── .gitignore
├── .env.local                      # Environment variables (not committed)
├── innerzero_web_spec.md           # Full product + infrastructure spec
├── CLAUDE.md                       # This file
└── README.md
```

---

## Route map

| Route | Page | SEO title | Status |
|-------|------|-----------|--------|
| `/` | Home | InnerZero — Private AI Assistant That Runs on Your PC | COMPLETE |
| `/features` | Features | Features \| InnerZero — Private AI Assistant | COMPLETE |
| `/pricing` | Pricing | Pricing \| InnerZero — Private AI Assistant | COMPLETE |
| `/privacy` | Privacy | Privacy \| InnerZero — Private AI Assistant | COMPLETE |
| `/about` | About | About \| InnerZero — Private AI Assistant | COMPLETE |
| `/contact` | Contact | Contact \| InnerZero — Private AI Assistant | COMPLETE |
| `/waitlist` | Waitlist | Join the Waitlist \| InnerZero | COMPLETE |
| `/download` | Download | Download \| InnerZero | COMPLETE |
| `/blog` | Blog | Blog \| InnerZero | COMPLETE |
| `/changelog` | Changelog | Changelog \| InnerZero | COMPLETE |
| `/terms` | Terms | Terms of Service \| InnerZero | COMPLETE |
| `/login` | Login | Log In \| InnerZero | COMPLETE |
| `/register` | Register | Sign Up \| InnerZero | COMPLETE |
| `/forgot-password` | Password Reset | Reset Password \| InnerZero | COMPLETE |
| `/reset-password` | New Password | Set New Password \| InnerZero | COMPLETE |
| `/account` | Dashboard | Account \| InnerZero | COMPLETE |
| `/account/settings` | Settings | Settings \| InnerZero | COMPLETE |

---

## Page-by-page build spec

### Home (`/`)
Sections in order:
1. **Hero**: Large headline "Your AI. Your machine. Your data." + tagline "inner peace. inner joy. innerzero." + 1-2 line description + primary CTA "Join the Waitlist" + secondary "Learn more" link. Background: subtle radial gradient glow (gold centre fading to dark, positioned top-centre, slow CSS pulse animation). Staggered text entrance: headline → tagline → description → CTA with 150ms delays. See "Animations and motion" section for full spec.
2. **Feature cards**: 4 cards in 2x2 grid (stacks to 1 col on mobile). Each: icon + title + 2-line description. Features: Runs locally, Learns & remembers, Voice + text, Hardware-aware.
3. **How it works**: 3-step horizontal flow (stacks vertical on mobile). Each step: number badge + title + description. Steps: Download & install → Zero configures itself → Start talking.
4. **Privacy statement**: Full-width dark section with bold headline "Zero data leaves your machine." + 3-4 trust points.
5. **CTA banner**: Pricing summary + "Join the Waitlist" button.

### Features (`/features`)
Full feature breakdown — each feature gets a section with heading + paragraph + optional icon/illustration placeholder. Alternate alignment (left/right) for visual rhythm. Include "Coming Soon" section at bottom for future features (multi-device, team, email, mobile).

### Pricing (`/pricing`)
Single centred card showing both price points (monthly toggle / annual toggle or both shown). Feature checklist. Below card: FAQ section with expandable items (click to expand, no JS library — use `<details>` or simple useState toggle).

### Privacy (`/privacy`)
Two distinct sections: (1) plain-language privacy explainer (how InnerZero works, what stays local, what the licence check sends), (2) formal privacy policy text.

### About (`/about`)
What InnerZero is. Why it exists. The mission (AI should be personal and private). About Summers Solutions. Team (just Louie for now — keep it authentic).

### Contact (`/contact`)
Simple form: name, email, subject, message. Submits to Formspree (or similar). Success/error states. Also show email address for direct contact.

### Waitlist (`/waitlist`)
Hero-style page with email capture form. Submits to `/api/waitlist` (POST). Stores to a local JSON file at `data/waitlist.json` (Phase 1 — no database). Shows success message. Validates email format client-side and server-side.

### Download (`/download`)
"Coming Soon" page. Brief description of what InnerZero is. System requirements preview. "Join the Waitlist" CTA. Will become gated download page in Phase 4.

### Blog (`/blog`)
Empty index page with "Coming soon" message. Route exists for SEO. Blog posts will be MDX files added over time. Each post gets `/blog/[slug]`.

### Changelog (`/changelog`)
Empty page with "Check back soon" message. Will show release notes grouped by version.

### Terms (`/terms`)
Standard Terms of Service. Can be placeholder text initially with a note to replace with real legal copy.

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
- Home page: `Organization` + `SoftwareApplication`
- Pricing page: `Product` with `offers`
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

## API route: waitlist (Phase 1)

```
POST /api/waitlist
Body: { "email": "user@example.com" }

Validation:
- email is present
- email matches basic regex
- email is not already in the list

Storage (Phase 1):
- Append to data/waitlist.json (create if missing)
- Format: [{ "email": "...", "timestamp": "..." }]
- This is temporary — moves to Supabase in Phase 2

Response:
- 200: { "success": true, "message": "You're on the list!" }
- 400: { "success": false, "message": "Please enter a valid email." }
- 409: { "success": false, "message": "This email is already on the waitlist." }
```

---

## Environment variables

### Phase 1 (.env.local)
```
NEXT_PUBLIC_SITE_URL=https://innerzero.com
FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxx    # Contact form
```

### Phase 2+ (added later)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### Phase 3+ (added later)
```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_ANNUAL=
RESEND_API_KEY=
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
- Pricing card: full width on mobile, max-w-md centred on desktop

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
- Apply to: feature cards, how-it-works steps, pricing card, privacy points, about sections

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
- No full-page loading screen or skeleton screens needed in Phase 1 (pages are static)

**Pricing card:**
- Subtle border glow animation on the plan card (gold, slow pulse, `box-shadow` keyframes, 4s cycle)
- Annual/monthly toggle: smooth colour swap on the active pill

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
- All pages statically generated in Phase 1

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
| **Phase 1** | Deploy to Vercel | NOT STARTED |
| **Phase 2** | Supabase setup + schema | COMPLETE 2026-03-29 |
| **Phase 2** | Auth (login / register / reset) | COMPLETE 2026-03-29 |
| **Phase 2** | Account dashboard | COMPLETE 2026-03-29 |
| **Phase 2** | Migrate waitlist to database | COMPLETE 2026-03-29 |
| **Phase 2** | Transactional emails | NOT STARTED |
| **Phase 3** | Stripe integration | NOT STARTED |
| **Phase 3** | Checkout + webhook handlers | NOT STARTED |
| **Phase 3** | Billing portal | NOT STARTED |
| **Phase 3** | Trial flow | NOT STARTED |
| **Phase 4** | Licence API (activate/validate/deactivate) | NOT STARTED |
| **Phase 4** | Device management | NOT STARTED |
| **Phase 4** | Download gating | NOT STARTED |
| **Phase 4** | Update check API | NOT STARTED |
| **Phase 5** | Desktop app licence.py module | NOT STARTED |
| **Phase 5** | First-run wizard integration | NOT STARTED |
| **Phase 5** | Background validation | NOT STARTED |
| **Phase 5** | Grace period logic | NOT STARTED |
| **Phase 6** | Rate limiting | NOT STARTED |
| **Phase 6** | Error monitoring | NOT STARTED |
| **Phase 6** | GDPR: account deletion | NOT STARTED |
| **Phase 6** | Analytics (Plausible/Fathom) | NOT STARTED |
| **Phase 6** | Security audit | NOT STARTED |

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
- Currency is GBP (£) — prices shown as £9.99/month, £79.99/year

### File management
- All new files go in the correct directory per the file structure above
- No files outside of the defined structure without explicit reason
- Keep the `/data/` directory in `.gitignore` (waitlist data)

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
**Description:** InnerZero is a private AI assistant that runs entirely on your PC. No cloud. No tracking. Just you and your AI.

### Feature card titles + descriptions
1. **Runs 100% Locally** — Your conversations never leave your machine. No cloud servers. No data uploads. Ever.
2. **Learns & Remembers** — InnerZero builds personal memory from every conversation. It knows you better over time.
3. **Voice + Text** — Talk to Zero or type — your choice. Full voice interaction with speech recognition and natural responses.
4. **Hardware-Aware** — InnerZero detects your PC's capabilities and automatically configures the best AI model for your system.

### How it works steps
1. **Download & Install** — One click. InnerZero handles everything — dependencies, models, configuration.
2. **Zero Configures Itself** — Detects your hardware, downloads the right AI model, and optimises for your system.
3. **Start Talking** — Text or voice. Zero remembers everything locally. Your private AI assistant is ready.

### Privacy statement
**Headline:** Zero data leaves your machine.
**Points:**
- All AI processing happens on your hardware
- Memory stored in a local database — never uploaded
- The only network call is licence verification — and it sends nothing personal
- No telemetry. No tracking. No analytics on your usage.

### Pricing card
**Plan name:** InnerZero
**Monthly:** £9.99/month
**Annual:** £79.99/year (Save 33%)
**Trial:** 14-day free trial — no card required
**Tagline:** Everything included. No tiers. No limits. Your hardware is the only limit.

### 404
**Headline:** Looks like you've gone off the grid.
**Description:** The page you're looking for doesn't exist. But don't worry — your data is still safe on your machine.
**CTA:** Back to Home

---

## Dependencies (Phase 1 package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.300.0",
    "next-sitemap": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

Do not add any packages beyond these without explicit instruction.
