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

## Structure (rebuilt 2026-07-18 from SITE_HANDOFF)

The landing is a 1:1 Next.js port of the approved design in `C:\Users\aliba\Downloads\SITE_HANDOFF` (canonical: `site/Crumbify.html` - when in doubt, that file is the visual source of truth).

- `src/app/page.tsx` — server component composing the landing. Sections in order:
  `Header → Hero (live Leaflet map) → Manifesto → HowItWorks (#how) → FeedMarquee (#feed) → Band → TasteMatch (#discover) → Groups (#groups) → FoundingSection (#founding) → CTA → Footer`, plus the `ScrollFX` client island.
- `src/app/landing.css` — the handoff CSS ported verbatim, scoped under `.landing`. Do NOT rewrite to Tailwind. `--ser` is intentionally the Helvetica stack (Instrument Serif deliberately unused).
- `src/components/landing/` — `data.ts` (posts/spots/scoreColor/store SVGs), atoms (CookieMark, ScorePuck, StoreBadges), client islands: `Header` (solid-on-scroll + two-step burger drawer), `HeroMap` (Leaflet, locked, CARTO Voyager tiles), `ScrollFX` (Lenis lerp .09 + reveals + parallax), `FoundingSection` (Stripe founding flow, first-100 counter).
- `src/app/referral/route.ts` — `GET /referral?code=X`: logs {code, platform, ua} to Supabase `referral_clicks` then 302s to the store by user agent (envs `NEXT_PUBLIC_APP_STORE_URL` / `NEXT_PUBLIC_PLAY_STORE_URL`, fallback `/`). UGC-influencer tracking links.
- `src/app/admin/referrals/` — clicks-per-code dashboard behind the existing magic-link admin gate (`requireAdmin`, `ADMIN_EMAILS`).
- `src/components/legal/` — LegalShell, BackLink, ContactLinks (shared dark legal-page chrome).
- Fonts: **Bricolage Grotesque** (display) + **Hanken Grotesk** (body) via `next/font/google` in `layout.tsx`.
- Legal/support pages: `privacy/`, `terms/`, `delete-account/`, `support/`, `founding-member/success/` — dark-themed.
- `src/app/admin/` — magic-link-gated admin dashboard (RevenueCat / ASC / Sentry panels; mostly stale except `referrals/`).
- `src/app/api/` — `waitlist/founding/` (first-100 counter), `stripe/webhook/`, `admin/session/`. (Waitlist signup, `/ref`, `/invite` were deleted 2026-07-18; `/ref` + `/invite` 301 to `/` via `next.config.ts`.)

## Brand / theme (current — cream editorial, SITE_HANDOFF)

- Cream canvas: bg `#F4ECE1`, alt `#EFE5D8`, card `#FFFDF9`, ink `#1A1208`, gold `#E6C39B`/`#C9A077`, terracotta accent `#D8663F` (eyebrows only). Dark ink surfaces for footer/CTA.
- Tagline: "Every bite tells a story."
- Gold is never standalone body-text colour. Score pucks use the red→yellow→green `scoreColor()` ramp.

## Email policy

- User / account / legal / help issues → `support@crumbify.co.uk`.
- Sponsor / partnership / everything else → `contact@crumbify.co.uk`.
- `admin@crumbify.co.uk` is NOT used anywhere on the site.
- Store review (app store only): `appreview@crumbify.co.uk`.

## Known follow-ups

- Wire `NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK` env in Vercel for the founding-member checkout button (falls back to `/founding-member` if unset).
- Wire `NEXT_PUBLIC_APP_STORE_URL` + `NEXT_PUBLIC_PLAY_STORE_URL` in Vercel once the store listings exist (store badges fall back to `#`, referral redirect to `/`).
- OG share image (1200x630) + favicon set still to be produced (see SITE_HANDOFF/05-ASSETS-SEO.md).
- Self-host fonts as woff2 if Lighthouse flags the Google Fonts request.
- Wrapped is intentionally NOT featured (not shipping for a long time).

## HARD design rules (from ~/.claude/rules frontend-design + app-wide)

Apply to ALL copy + UI on this site:
- **No money / spend / £ figures anywhere.** Stats are counts/percentages only.
- **No letter-spacing > 0.** No `tracking-[Npx] uppercase`, no spaced caps ("C O M I N G  S O O N"), no spaced pill labels. (`tracking-tight` / negative tracking is fine.)
- **No em (—) or en (–) dashes** in any copy. Use commas, colons, or plain hyphens (-).
- **No decorative separator dots** (`·`) as pill ornaments.
- No decorative notches/tabs on cards (flat edges). Exception: pressable button ledge (Duolingo sink).
- No spotlight / radial-sweep / torch animations. No glow rings on static elements. Allowed: fade, scale, translate, opacity, spring, color, particle float, crossfade.

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
