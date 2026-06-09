# Crumbify.co.uk — Vibe Redesign (design spec)

**Date:** 2026-06-09
**Goal:** Rebuild the marketing landing so it matches the **app's actual identity** — warm cream, chocolate-cookie, playful/Duolingo-soft — and is fully user-facing-ready. The current "v2" landing is dark-first / editorial / cold and misses the brand. Replace it.

## Why

The Crumbify app is light cream-first (`#E8DDD3` bg, ink text, gold accents), playful and gamified (button ledges, badges, springy motion). The brand mark is a **bitten chocolate-cookie "C" with crumbs flying off** on cream. The live site is dark (`#0E0805`), moody, and breaks the app's own design rules (spaced caps, em dashes, `·` ornaments, uppercase tracking). User wants a 10/10 site that feels like the app.

## Non-negotiable rules (apply to every section + all copy)

- **No money / spend / £ figures anywhere.** Stats are counts and percentages only.
- **No letter-spacing > 0** (no spaced caps, no `uppercase tracking-[Npx]`). Negative `tracking-tight` is fine.
- **No em (—) or en (–) dashes.** Use commas, colons, or plain hyphens.
- **No decorative `·` separator dots as pill ornaments.**
- **No spotlight / radial-sweep / torch effects, no glow rings on static elements.** Allowed motion: fade, scale, translate, opacity, spring, color, particle float, crossfade.
- **Import is OCR/screenshot + manual entry, NEVER platform API/OAuth.** Copy must say "screenshot your order history, Crumbify reads it". OAuth is sign-in only.
- Card edges flat. Only permitted ledge/notch: a pressable button's hard shadow ledge (Duolingo sink).

## Design tokens (from app `utils/theme.ts` + `brand-tokens.ts`)

Add to `globals.css` as CSS variables + Tailwind theme:

| Token | Hex | Use |
|-------|-----|-----|
| `cream` | `#E8DDD3` | page background |
| `paper` | `#F4ECDF` | cards / raised surfaces |
| `paper-deep` | `#D8CBBC` | secondary surface / borders |
| `ink` | `#1A1208` | primary text, primary buttons |
| `ink-soft` | `#6B5744` | secondary text |
| `muted` | `#A09080` | muted text / captions |
| `gold` | `#E6C39B` | accent, highlights |
| `gold-deep` | `#C9A678` | accent hover / strokes |
| `brown` | `#8B7355` | warm brown (avatars, deep accents) |
| `cocoa` | `#3E2723` | cookie brown (logo, dark text accents) |
| `success` | `#6B8E4E` | positive states |
| `error` | `#C84B4B` | error states |

Optional single dark moment (Wrapped section) may use `cocoa`/`ink` background with cream text — kept contained, not the global theme.

## Typography

- **Display / headlines:** rounded playful face — **Fredoka** (variable), self-hosted via `next/font/google` (no external CDN → no CSP/connect-src changes, no layout shift). Weight 500-600.
- **Body / UI:** keep the existing system stack (`-apple-system, "SF Pro", Helvetica Neue, ...`) — matches the app.
- Type scale: 12 / 14 / 16 (body base) / 20 / 28 / 40 / 64 / clamp hero to ~`clamp(48px, 9vw, 112px)`.
- Line-height 1.5-1.65 body, ~0.95 display. Tabular figures for stat numbers.
- Replace `font-headline` utility to point at the Fredoka variable.

## Motion language

- Entrance: spring / ease-out, 150-400ms, staggered 30-50ms for lists/grids.
- **Crumb particles:** small cocoa dots drifting/falling near hero + section transitions (CSS/transform only, reduced-motion disables).
- **Count-up** on stat numbers when in view.
- **Button ledge press:** pill sits on a hard `gold-deep`/`ink` shadow ledge; on press it translates down into the ledge.
- Scroll-reveal via `useInView`. Feature showcase uses scroll-pinned phone (reuse Lenis + framer scroll).
- All motion gated on `prefers-reduced-motion`.

## Assets & screenshot strategy

- No real screenshot PNGs exist yet. Build **pixel-faithful HTML/CSS recreations** of app screens inside the device frame, styled with the real palette/components. Each lives in its own component with a clean prop-driven "slot" so a real screenshot `<Image>` can replace it later with one swap.
- Logo: copy `Promotional Content/Crumbify Logo.png` (+ `crumb-wordmark.png`, app `icon.png`/`splash-icon.png`) into `public/images/`. Recreate the cookie-C as an inline SVG where it must scale crisply (nav, favicon-scale uses) — raster logo only where large.
- Regenerate `public/images/og-image.png` (1200x630) — cream bg, cookie-C, "Read the crumbs." (deleted in git; needed for SEO/social). If image generation isn't available, leave a tracked TODO + placeholder and flag to user.
- iPhone frame: may reuse `iPhone17ProMax_FRAME4.png`, or build a CSS device frame (preferred for crispness/responsiveness).

## Structure (UPDATED 2026-06-09 after preview review)

**Goal/CTA pivot:** NOT a waitlist/coming-soon site. No "coming soon" pill, no countdown, no scarcity. Primary action is a **soft email capture** framed as "get early access" / "be first in" — confident and product-first, not a gimmick. Reuse the existing `useWaitlist` + `/api/waitlist` + Turnstile infra under the hood, just reframe all copy. No founding-member scarcity push on the landing (Stripe path can stay reachable but is not the hero).

**Format: editorial scroll-story.** Full-bleed, cinematic, scroll-driven. Each major feature gets its own near-full-screen "moment" with giant Fredoka type + a large app screen that animates with scroll progress (pin / parallax / scrub). Premium, immersive, magazine-like — not a stack of generic SaaS cards. Built on the existing Lenis smooth-scroll + framer `useScroll`/`useTransform`.

All sections live under `src/components/sections/v3/` (new), composed by `src/app/page.tsx`. Old `v2/` removed once `v3` lands. Shared primitives in `src/components/ui/` reused/restyled (device frame, LedgeButton, SplitText, Preloader). CustomCursor removed site-wide. Fredoka display + Nunito body (self-hosted via next/font).

Scroll-story beats (top → bottom):

1. **Navbar** — cream, solid on scroll. Cookie-C logo + "Crumbify" wordmark. Minimal links (Features, About). Primary `LedgeButton` "Get early access" (scrolls to email).
2. **Hero moment** — full-bleed cream. Giant "Read the crumbs." Fredoka headline (gold full stop), confident sub-copy, soft email field + `LedgeButton` ("Get early access"), subtle crumb specks. Large app screen anchored, animating in. No status/coming-soon pill. Quiet social proof line only if it reads confident (e.g. "Be first in" not "X on the waitlist").
3. **Transition / platform line** — full-width statement: "Screenshot your orders from Uber Eats, Just Eat, Deliveroo, or log any restaurant by hand." Accurate OCR framing, no `·` ornaments.
4. **Feature moment — See where you really eat** — full-screen; big type left/over, app "Top restaurants / cuisines" screen scrubbing with scroll.
5. **Feature moment — Your year, Wrapped** — full-screen; the one permitted dark/cocoa contrast moment; Wrapped card reveal on scroll.
6. **Feature moment — Your food personality** — full-screen; personality donut + type label animating on scroll.
7. **Feature moment — Find your food soulmate** — full-screen; match % + shared favourites reveal.
8. **Feature moment — Your food map** — full-screen; pins dropping on a warm map as you scroll.
9. **Stats band** — count-up numbers (counts/percent only, no money) as a rhythmic breather between moments or before the close.
10. **Closing CTA** — full-bleed warm panel: restate value, soft email capture (Turnstile), `LedgeButton`. Calm and confident.
11. **Footer** — cookie-C, "Read the crumbs." tagline, columns (Product / Legal / Contact), socials (`@crumbifyco`), legal links `/privacy` `/terms` `/support` `/delete-account`.

Each feature moment is its own component with a prop-driven app-screen slot (faithful recreation now, real screenshot swap later).

## Existing infra to preserve (do not break)

- `useWaitlist`, `useWaitlistCount`, `/api/waitlist`, `/api/waitlist/count`, Turnstile (`useTurnstile`), middleware rate-limit.
- Stripe webhook + founding-member success page.
- Admin dashboard (`/admin/*`) — untouched.
- SmoothScroll (Lenis), Preloader, SpeedInsights in `layout.tsx`.
- Security headers / CSP in `next.config.ts` — verify Fredoka self-host needs no new connect-src.

## Accessibility & performance

- Contrast: ink/ink-soft on cream all >= 4.5:1 (verify ink-soft `#6B5744` on cream — large text only if borderline).
- Focus rings visible; CTAs are real `<button>`/`<a>`; touch targets >= 44px.
- `prefers-reduced-motion` disables particles/parallax/count-up auto-run.
- Self-hosted font (`font-display: swap`), lazy-load below-fold sections, `next/image` with width/height (no CLS), transform/opacity-only animation.

## Out of scope this section (separate track, SAME session after landing)

- Compliance pages: `privacy` (add photos/posts+messages/advertising paragraphs), `delete-account` (posts/photos/soulmate-messages), `support` (fix Crumb→Crumbify, OCR-not-OAuth FAQ, remove "spending analytics"). Source of truth: app repo `docs/v0814-2-compliance-and-deploys.md` + `docs/website-handoff-delete-account.md`. Sweep Crumb→Crumbify on terms too.

## Testing / done criteria

- `npm run build` clean, `npm run lint` clean, existing Jest suites pass (waitlist/middleware/rate-limit/stripe).
- Manual check at 375 / 768 / 1024 / 1440 + reduced-motion.
- Grep guard: zero `—`/`–`, zero `uppercase tracking-`, zero ` · ` pill ornaments, zero money/£/spend in landing copy.
- Source authored by `tdd-guide`/build subagents @ sonnet; orchestrator runs gates/reviews/integration only.
</content>
