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
- Social: add friends, compare tastes, direct messaging, groups, leaderboards. Reviews: rate places + keep private notes. (No public post feed — that feature was removed.)
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

- `src/app/page.tsx` — single-page editorial scroll-story landing (the live design, shipped 2026-06-10). Sections in order:
  `Navbar → Hero → PlatformLine → Restaurants → Reviews → Groups → Discover → Personality → Soulmate → StatsBand → FoundingSection → ClosingCTA → Footer`
- `src/components/landing/` — all landing components + visuals: tokens, LedgeButton, CrumbParticles, PhoneFrame (real app screenshot), FeaturePhoneA, ReviewCard, GroupCard, DiscoverCard, PersonalityChart, SoulmateCard, FoundingSection, EmailCapture.
- `src/components/legal/` — LegalShell, BackLink, ContactLinks (shared dark legal-page chrome).
- `src/components/ui/Preloader.tsx` — site-wide loader (Crumbify wordmark + cookie-C).
- `src/components/providers/SmoothScroll.tsx` — single global Lenis instance.
- `src/hooks/` — useWaitlist, useWaitlistCount, useTurnstile.
- Fonts: **Fredoka** (display) + **Nunito** (body) via `next/font/google`, scoped in `page.tsx`.
- Legal/support pages: `privacy/`, `terms/`, `delete-account/`, `support/`, `founding-member/success/`, `invite/` — all dark-themed.
- `src/app/admin/` — OTP-gated admin dashboard (RevenueCat / ASC / Sentry panels).
- `src/app/api/` — `waitlist/`, `waitlist/count/`, `waitlist/founding/` (first-100 counter), `stripe/webhook/`, `admin/session/`.

## Brand / theme (current — dark cocoa "black and tan")

- Single continuous dark cocoa canvas: bg `#1A1208`, surfaces `#241712` / `#2E1E14`, text `#F4ECDF` / `#C4B09A`, single brand-gold accent `#E6C39B` / `#C9A077`. NO off-brand saturated yellow.
- Tagline: "Every bite tells a story." Sub: "Your food delivery stats".
- Same warm cookie family as the app (the app is dark-themed too).

## Email policy

- User / account / legal / help issues → `support@crumbify.co.uk`.
- Sponsor / partnership / everything else → `contact@crumbify.co.uk`.
- `admin@crumbify.co.uk` is NOT used anywhere on the site.
- Store review (app store only): `appreview@crumbify.co.uk`.

## Known follow-ups

- Wire `NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK` env in Vercel for the founding-member checkout button (falls back to `/founding-member` if unset).
- Feature visuals are real design artifacts with `SWAP-SLOT` comments — drop real app screenshots into `public/images/` and swap when ready.
- Wrapped is intentionally NOT featured (not shipping for a long time).

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

- **FIND YOUR UNKNOWNS FIRST (PARAMOUNT).** Before any non-trivial feature or design change, follow `~/.claude/rules/common/finding-unknowns.md`: blind-spot pass on unfamiliar areas, brainstorm/prototype multiple directions for anything visual or subjective before real implementation, interview the user (AskUserQuestion) on architecture-changing ambiguities, prefer source-code references over descriptions, and lead implementation plans with data models / interfaces / user-facing flows. Discovery is cheap; re-implementation is not.
- Orchestrator does NOT hand-author `.ts/.tsx` (impl or tests) — delegate to `tdd-guide @ sonnet`. Markdown/config/memory the orchestrator edits directly.
- Run `npm run build` + tests before declaring done / deploying.
- Conventional commits. Attribution disabled globally.
