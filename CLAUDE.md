# Crumbify Website — CLAUDE.md

Marketing + legal site for the **Crumbify** app. Live at **https://crumbify.co.uk**, deployed on Vercel, branch `main`.

## What Crumbify (the app) is

Cross-platform **feed-first social food app**: a social feed of friends' restaurant posts, personal food history (been-to + want-to-try), taste-matched discovery, and light stats. The "food delivery stats" origin is HISTORY - never describe it that way. Target: UK 18-25 (students, young professionals). React Native + Expo, v1.0 pre-release track. Lives at `../app`. (Corrected 2026-08-28 against app code by two audit workflows; see `legal/launch-readiness` PR.)

**How adding places actually works (CRITICAL - get this right in copy):**
- Share a **TikTok/Instagram post into Crumbify** via the share sheet, paste a **Google Maps list/place link**, or **search manually** (Google Places).
- Screenshot-OCR import is **RETIRED** (migration 155). Delivery-platform APIs/OAuth were never used for orders and never will be. OAuth (Google/Apple) is **sign-in only**.
- Never write copy claiming it "connects to Uber Eats / Just Eat" or "reads screenshots". Both are false.

**Core features (for marketing copy - verified against code 2026-08-28):**
- Home feed: friends' posts with photos, reactions, comments; optional per-post sharing to the public **Trending** feed (visible to any signed-in user). There are **NO direct messages** and **NO Food Soulmate** (both removed; regression tests enforce it).
- **Discover**: GPS map + scroll discovery (Google Places), taste-matched.
- Reviews: been-to log, scores x.x/10, private notes, want-to-try, **Food Map**.
- Social: friends, groups (shared lists, votes, photos, comments), leaderboards, monthly Challenge, profile wall + collections.
- Premium ("Crumbify Premium", RC products `crumbify_premium_monthly/annual`, 3-day trial): Monthly Wrapped, no Google ads (labelled Sponsored restaurant cards still show at half frequency), unlimited collections + premium covers, premium badge. Source of truth: app `components/premium/premium-perks.ts`. NO money/spend language.
- Founding member: first 100 paying members via Stripe on the site, lifetime premium, closes at 100.

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
- `src/app/referral/route.ts` — `GET /referral?code=X`: upserts `{code, platform, ip_hash}` into Supabase `referral_clicks` (unique on `code,ip_hash`, `ignoreDuplicates: true`, so one row per unique visitor per code) then 302s to the store by user agent (envs `NEXT_PUBLIC_APP_STORE_URL` / `NEXT_PUBLIC_PLAY_STORE_URL`, fallback `/`). The client IP is read from `x-forwarded-for` / `x-real-ip`, hashed with sha256 + `REFERRAL_IP_SALT` (falls back to `SUPABASE_SERVICE_ROLE_KEY` if unset), and never stored or logged in raw form; logging is skipped entirely if no salt is configured. UGC-influencer tracking links.
- `src/app/admin/referrals/` — unique-visitor clicks-per-code dashboard (summary totals + per-code table with platform split, last 7 days, first/last click, share URL) behind the existing magic-link admin gate (`requireAdmin`, `ADMIN_EMAILS`). Linked from the main `/admin` header and a `Referrals` summary section there.
- **`ADMIN_EMAILS` is REQUIRED, not optional.** `src/lib/admin/auth.ts` has no hardcoded fallback allowlist (this repo is public - a hardcoded admin email is a phishing target). If `ADMIN_EMAILS` is unset or empty, `requireAdmin()` fails closed and admin sign-in is disabled for everyone. Set it as a comma-separated, case-insensitive list: `ADMIN_EMAILS=admin@crumbify.co.uk,ali@crumbify.co.uk` in Vercel (production) and in `.env.local` (local dev).
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

## Legal pages (launch-ready pass 2026-08-28, branch `legal/launch-readiness`)

`privacy/`, `terms/`, `delete-account/`, `support/` were brought to launch-ready state grounded in
two read-only audit workflows over the app repo (results in the session scratchpad
`verify-results*.json`). Key facts encoded there: contacts matching is hash-only and skippable;
avatars + post photos live in PUBLIC storage buckets; group + private-review photos are private
signed-URL buckets; Sentry + PostHog are EU-hosted; RevenueCat gets the UUID only; sponsored cards
are non-personalised; deletion is immediate and attempts Apple credential revocation. Entity:
Crumbify LTD (no. 17288992), min age 16, no DPO, trademark application UK00004426579 (PENDING -
no (R) symbol until registered). Do not edit these pages from memory - re-verify against app code.

Locked external strings: contact `contact@crumbify.co.uk`, store review `appreview@crumbify.co.uk`, account-delete `admin@crumbify.co.uk`, X `@crumbifyco`, delete URL `https://crumbify.co.uk/delete-account`.

## Security guards (automated, run on every `npm test`)

This repo is PUBLIC on GitHub, so two invariants are enforced by static-analysis jest
tests instead of relying on review alone:

- `src/__tests__/security/no-committed-secrets.test.ts` - walks tracked source
  (`src/**`, `supabase/**`, `tests/**`, `next.config.ts`, `package.json`) and fails if it
  finds a realistic Stripe live/test secret key, Stripe webhook secret, JWT-shaped string,
  Google API key, a literal `service_role` key assignment, or `SUPABASE_SERVICE_ROLE_KEY=`
  / `STRIPE_SECRET_KEY=` assigned a literal instead of a `process.env` reference. It uses a
  minimum realistic key length so it does not fire on this repo's own test placeholders
  (`sk_test_key`, `whsec_test`, `test-service-role-key`). **If it fires:** move the value to
  an environment variable and rotate the key immediately - a public-repo key is scraped
  within minutes.
- `src/__tests__/security/no-raw-ip-persistence.test.ts` - reads `src/app/referral/route.ts`
  and asserts the Supabase `referral_clicks` payload contains `ip_hash` and never a bare
  `ip:` or `user_agent:` key, and that no `console.*` call passes the raw client-IP
  variable. Raw IPs are personal data under UK GDPR. **If it fires:** you (or a refactor)
  reintroduced raw-IP persistence/logging on the referral route - hash the IP with the
  existing `hashIp()`/salt pattern before writing or logging anything derived from a
  visitor's request.

## Conventions

- **FIND YOUR UNKNOWNS FIRST (PARAMOUNT).** Before any non-trivial feature or design change, follow `~/.claude/rules/common/finding-unknowns.md`: blind-spot pass on unfamiliar areas, brainstorm/prototype multiple directions for anything visual or subjective before real implementation, interview the user (AskUserQuestion) on architecture-changing ambiguities, prefer source-code references over descriptions, and lead implementation plans with data models / interfaces / user-facing flows. Discovery is cheap; re-implementation is not.
- Orchestrator does NOT hand-author `.ts/.tsx` (impl or tests) — delegate to `tdd-guide @ sonnet`. Markdown/config/memory the orchestrator edits directly.
- Run `npm run build` + tests before declaring done / deploying.
- Conventional commits. Attribution disabled globally.
