# Crumbify Website — CLAUDE.md

Marketing + legal site for the **Crumbify** app. Live at **https://crumbify.co.uk**, deployed on Vercel, branch `main`.

## What Crumbify (the app) is

Cross-platform **food delivery stats + social app** — "Stats.fm for food delivery". Target: UK 18-25 (students, young professionals). React Native + Expo, currently **v0.8.14 build 2**. Lives at `../app`.

**How import actually works (CRITICAL — get this right in copy):**
- Crumbify reads order history from **screenshots you import** (OCR) + **manual entry**.
- It does **NOT** use delivery-platform APIs or OAuth to pull orders. OAuth (Google/Apple) is **sign-in only**.
- Never write copy claiming it "connects to Uber Eats / Just Eat via their API / OAuth". That is false.
- Supported via OCR parsers: Uber Eats, Just Eat, Deliveroo, + manual "any restaurant".

**Core features (for marketing copy):**
- Top restaurants / cuisines / visit counts (no money/spend figures — see rule below)
- Annual **Wrapped** (Spotify-Wrapped-style yearly recap, shareable)
- **Food personality** type (Creature of Habit / The Explorer, etc.)
- **Food Soulmate** — taste-match % with friends + stranger opener messaging
- **Food Map** — every restaurant plotted
- Social: friend feed, posts (photo + note), reactions, comments, groups, leaderboards
- Premium ("Crumbify Premium", RC products `crumbify_premium_monthly/annual`): extra stats, deeper friend comparisons, ad-free. Mirror real list from app `components/premium/comparison-features.ts`. NO money/spend language.

## Website tech stack

| Tech | Version |
|------|---------|
| Next.js (App Router) | ^16.2.1 |
| React | 19.2.3 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| Framer Motion | ^12.35.1 |
| Lenis (smooth scroll) | ^1.3.23 |
| Supabase | ^2.99.1 |
| Stripe | ^20.4.1 (founding-member checkout) |
| Lucide React | icons |
| Jest + Playwright | tests / e2e |

Scripts: `npm run dev | build | lint | test | test:e2e`.

## Structure

- `src/app/page.tsx` — single-page landing, composes the **v2** sections in order:
  `Navbar → Hero → PlatformMarquee → FeatureScroll → StatsBand → BentoSection → WaitlistSection → Footer`
- `src/components/sections/v2/` — all current landing sections (the live design).
- `src/components/ui/` — primitives: PhoneShell, MagneticButton, SplitText, CustomCursor, Preloader, NoiseOverlay.
- `src/hooks/` — useWaitlist, useWaitlistCount, useMagnetic, useMouseParallax, useCountUp, useLenisScroll, useTurnstile.
- `src/app/globals.css` — global styles + `font-headline` + brand tokens.
- Legal/support pages: `privacy/`, `terms/`, `delete-account/`, `support/`, `founding-member/success/`, `invite/`.
- `src/app/admin/` — OTP-gated admin dashboard (RevenueCat / ASC / Sentry panels).
- `src/app/api/` — `waitlist/`, `waitlist/count/`, `stripe/webhook/`, `admin/session/`.

## Brand / theme (current v2)

- Dark warm palette: bg `#0E0805` / `#1A1208`, card `#2A2118`, text `#E0D5C9`, gold accent `#E6C39B` / `#C9A077`.
- `font-headline` for display type.
- Taglines: "Read the crumbs." / "Your Food Delivery Stats".
- Same warm cream/brown family as the app.

## HARD design rules (from ~/.claude/rules frontend-design + app-wide)

Apply to ALL copy + UI on this site:
- **No money / spend / £ figures anywhere.** Stats are counts/percentages only.
- **No letter-spacing > 0.** No `tracking-[Npx] uppercase`, no spaced caps ("C O M I N G  S O O N"), no spaced pill labels. (`tracking-tight` / negative tracking is fine.)
- **No em (—) or en (–) dashes** in any copy. Use commas, colons, or plain hyphens (-).
- **No decorative separator dots** (`·`) as pill ornaments.
- No decorative notches/tabs on cards (flat edges). Exception: pressable button ledge (Duolingo sink).
- No spotlight / radial-sweep / torch animations. No glow rings on static elements. Allowed: fade, scale, translate, opacity, spring, color, particle float, crossfade.

> NOTE: the current v2 sections currently VIOLATE several of these (spaced-caps badge, `uppercase tracking-[Npx]` labels, em dashes in copy, `·` dots). Fix on touch.

## Pending store-compliance tasks (see HANDOFF.md)

Blockers before app build 2 → Apple/Google submission. Source of truth: app repo `app/docs/v0814-2-compliance-and-deploys.md` + `app/docs/website-handoff-delete-account.md`.
1. `privacy/` — add photos / posts+messages / advertising paragraphs; sweep Crumb→Crumbify.
2. `delete-account/` — add feed posts/photos + soulmate messages to "what gets deleted"; keep URL + `admin@crumbify.co.uk` + founder-email-retained line.
3. `support/` — fix stale "Crumb" branding, the factually-wrong "OAuth/API" FAQ answer (it's OCR), and the "spending analytics" money-rule violation.

Locked external strings: contact `contact@crumbify.co.uk`, store review `appreview@crumbify.co.uk`, account-delete `admin@crumbify.co.uk`, X `@crumbifyco`, delete URL `https://crumbify.co.uk/delete-account`.

## Conventions

- Orchestrator does NOT hand-author `.ts/.tsx` (impl or tests) — delegate to `tdd-guide @ sonnet`. Markdown/config/memory the orchestrator edits directly.
- Run `npm run build` + tests before declaring done / deploying.
- Conventional commits. Attribution disabled globally.
