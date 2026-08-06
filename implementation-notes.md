# Implementation notes — site-handoff rebuild (Tasks 1-4)

Scope covered in this pass: Task 1 (layout part - fonts/metadata), Task 2 (landing.css +
static sections), Task 3 (client islands - Header, ScrollFX, HeroMap/Hero), Task 4
(FoundingSection redesign). Tasks 5-7 (referral system, deletions, e2e rewrite) are NOT
part of this pass and remain open.

## Deviations from the plan (conservative choices, logged per finding-unknowns.md)

1. **CSS scoping**: `landing.css` selectors are all scoped under a `.landing` root class
   (`.landing .hero`, `.landing .btn`, etc.) rather than bare global selectors as in the
   source HTML. Reason: `globals.css` (Tailwind) still ships site-wide for the legal/admin
   pages per CLAUDE.md ("Tailwind globals.css stays for legal/admin pages; landing.css is
   additive"). Bare `body`, `a`, `h1` etc. selectors from the handoff source would leak into
   every other route. `page.tsx` wraps all sections in `<div className="landing">`. Values,
   tokens, spacing, and breakpoints are otherwise byte-for-byte identical to the source.

2. **`--disp`/`--body` font wiring**: `landing.css` sets `--disp:var(--font-disp),"Bricolage
   Grotesque",sans-serif` (chaining the next/font CSS var with a literal fallback) rather
   than overwriting the token outright, so the font tokens degrade gracefully if the
   next/font variable is ever unavailable (e.g. a future storybook/isolated render).

3. **Bricolage Grotesque font config**: `next/font/google` requires `weight: "variable"`
   when an `axes` array (opsz) is supplied - a fixed weight array combined with `axes`
   throws a Turbopack resolve error ("Axes can only be defined for variable fonts...").
   Switched to `weight: "variable"` to get the full opsz 12..96 + full weight range in one
   variable-font file, matching the source's Google Fonts URL
   (`Bricolage+Grotesque:opsz,wght@12..96,400..800`) semantics exactly.

4. **`leaflet` `tap` option**: `@types/leaflet`'s `MapOptions` doesn't declare `tap` (a real
   Leaflet.Map runtime option used to work around mobile tap-delay). Passed via an inline
   `...({ tap: false } as object)` spread with a comment, rather than widening the whole
   `L.map()` call to `any`, to keep the rest of the call type-checked.

5. **Commit granularity slip**: the HeroMap island and Hero section assembly landed in a
   single commit (`feat(landing): leaflet hero map island`) instead of two, because the
   second `git commit` in that batch found nothing staged (my `git add -A` covered both
   files in the first commit). Everything after this point in the sequence was committed
   individually as intended. Noted here per the house granularity rule rather than silently
   passing.

6. **Metadata `themeColor`**: kept `themeColor` inside the `Metadata` export (matches the
   plan's phrasing "update metadata... theme-color #F4ECE1"). Next.js 16 emits a
   non-fatal build warning recommending a separate `viewport` export instead; this matches
   the pre-existing pattern already used by every other page in the app (`privacy`,
   `terms`, `support`, etc.), so left as-is for consistency rather than introducing a new
   pattern on this page alone. Flagging as a candidate for a repo-wide `viewport.ts` sweep
   in a later pass.

7. **`FoundingSection` id**: confirmed `id="founding"` on the `<section>` per the
   coordinator's requirement (the parallel Task 5/6 e2e rewrite targets `#founding`).

## Automation-as-infrastructure question

What recurring class did this work expose, and what automation now guards it?

The class: hand-porting a static HTML/CSS/JS reference file into React risks silent
copy/value drift (a wrong hex, a missed keyframe, a renamed class) that's invisible until a
pixel-diff review. The guard shipped in this pass: `data.test.ts` locks `scoreColor`'s exact
output at the boundary values (0, 10, clamping, string coercion) that the whole visual
system (map pucks, feed score badges, taste-match card) depends on — if a future edit
changes the HSL formula, the test fails immediately rather than surfacing as an off-color
puck a human has to spot. The page-composition smoke test (`page.test.tsx`) guards the
second common failure mode for this class of work: a section silently failing to render
(missing import, thrown effect, hook order violation) that a pure visual pixel-diff might
not catch in CI. Neither guard replaces the side-by-side visual QA against
`Crumbify.html` called for in Task 7 (not yet run — that task is out of this pass's scope).

## Gate results (this pass)

- `npx tsc --noEmit`: clean for all files touched in this pass. Remaining errors belong to
  `waitlist-extended.test.ts` and `EtherealShadow*.test.tsx` — both pre-existing, both
  targeted for deletion in the plan's Task 6 (old waitlist capture + old ui component this
  session did not touch).
- `npm run build`: succeeds (Turbopack, all 17 routes compiled/prerendered).
- `npm test`: 334 passed / 60 failed, 18 suites passed / 12 failed. All failing suites are
  pre-existing (`waitlist.test.ts`, `waitlist-extended.test.ts`,
  `EtherealShadow.test.tsx`, `EtherealShadow-extended.test.tsx`, plus duplicate copies of
  the same files jest picked up from `.claude/worktrees/*` scratch checkouts) and are
  unrelated to this pass's changes - not fixed here per the task's explicit "report, don't
  fix" instruction for pre-existing failures. The two new landing test files
  (`data.test.ts`, `page.test.tsx`) pass, 7/7 tests.

## Commits (this pass, chronological)

1. `feat(layout): swap to Bricolage Grotesque + Hanken Grotesk fonts, handoff metadata, remove preloader/smoothscroll`
2. `feat(landing): port handoff css tokens + base styles`
3. `feat(landing): data arrays + scoreColor + store svgs`
4. `feat(landing): atoms (cookie, puck, store badges)`
5. `feat(landing): manifesto + how-it-works`
6. `feat(landing): feed marquee cards`
7. `feat(landing): band + taste match + groups`
8. `feat(landing): cta + footer`
9. `feat(landing): header + mobile drawer island`
10. `feat(landing): scroll fx island (lenis, reveals, parallax)`
11. `feat(landing): leaflet hero map island` (includes Hero.tsx assembly — see deviation 5)
12. `feat(landing): founding section redesigned in handoff language`
13. `feat(landing): compose page sections`
14. `test(landing): scoreColor unit tests + page composition smoke test`

Plus a follow-up fixup commit for the `tap` type error and Bricolage `weight: "variable"`
fix, folded into the layout/HeroMap commits above via amendment-free new commits — see
`git log` on this branch for exact SHAs.

## Not done in this pass (explicitly out of scope per the task brief)

- Task 5: referral redirect route, Supabase migration, admin dashboard.
- Task 6: deletion of old landing components/hooks/api routes, `/ref` + `/invite`
  redirects, stale test cleanup (this is what's causing the pre-existing test failures
  above), e2e rewrite.
- Task 7: side-by-side visual QA against `Crumbify.html`, CLAUDE.md/HANDOFF.md/memory
  updates, PR.

Old `src/components/landing/*` files (ConnectorLine, CrumbParticles, DiscoverCard,
EmailCapture, FeaturePhoneA, GroupCard, LedgeButton, PersonalityChart, PhoneFrame,
ReviewCard, SoulmateCard, tokens.ts) were left in place untouched, per the brief's
instruction not to delete old files (a later cleanup pass does that). They are no longer
imported from `page.tsx` or the new `FoundingSection.tsx`.

## Pixel-fix F-53 fix-round r2 (website repo)

Round-2 re-review (wave1-rereview-r2.json) closed 9/10 round-1 findings and
opened 5 new ones (F53-N1..N5), all in this repo. Fixed all five:

- **F53-N1 (HIGH):** round-1's fix for F53-R1 (self-styling StoreBadges,
  deleting `.landing .store`/`.stores` CSS) silently regressed the
  MARKETING HOMEPAGE - `landing.css` is imported UNLAYERED at
  `src/app/page.tsx` while Tailwind's utilities live inside
  `@layer utilities` (`src/app/globals.css`'s `@import "tailwindcss"`), so
  unlayered `.landing a{color:var(--gold-2)}` / `.landing a:hover{color:
  var(--ink)}` always beat the plain `text-white`/`hover:text-white`
  utilities regardless of specificity - badge labels rendered gold, and
  near-invisible ink-on-black on hover. Fixed by switching to Tailwind v4's
  `!` important modifier (`!text-white hover:!text-white`) on the anchor,
  which emits `!important` and wins over any unlayered non-`!important`
  rule too. Also restored the two orphaned layout rules the class deletion
  broke: `StoreBadges` now takes an optional `className` prop (CTA.tsx
  passes `justify-center` to recentre the badges in its centred `.cta-in`
  band) and carries its own mobile-responsive Tailwind utilities
  (`max-sm:gap-[10px]` on the wrapper, `max-sm:flex-1 max-sm:min-w-0
  max-sm:justify-center` on each anchor) replacing the dead
  `max-width:560px` `.landing .stores`/`.store` rules, which are now
  removed from `landing.css` with a pointer comment. Verified the ONLY
  consumers are `Hero.tsx`, `CTA.tsx`, `ProfileShareLanding.tsx` (all still
  correctly render via the shared component, just with the colour now
  robust to the cascade and the CTA band's centring restored via prop
  rather than a global class hook).
- **F53-N2 (LOW):** `ProfileShareLanding.tsx` rendered the give-up
  fallback CTA in the server-rendered HTML on every platform (`isAndroid`
  is `false` during SSR - no `navigator`), so an Android recipient's FIRST
  PAINT was "get the app" before flipping to "Opening in the Crumbify
  app..." post-hydration. Added a second `useSyncExternalStore`
  (`isHydrated`, same SSR-false/client-true shape as the existing
  `isAndroid` read) gating BOTH the opening-message and fallback-CTA
  branches, so the page shows only the neutral `@username` heading until
  hydration is known to have happened. jsdom's `render()` is a client-only
  mount (not a real SSR->hydrate pass) so it can't reproduce the flash
  behaviourally - added a static-analysis regression test instead,
  asserting the `isHydrated` gate is wired onto both branches by source
  inspection, per the repo's static-analysis-test convention (mirrors the
  app repo's `.claude/rules/testing-and-gates.md` pattern).
- **F53-N3 (LOW):** the App Store badge's visible label read "Download on
  the App Store" even when `NEXT_PUBLIC_APP_STORE_URL` was unset (href
  `/#founding`), disagreeing with its own aria-label and the Play badge's
  already-conditional convention. Mirrored the Play badge: `smallLabel`
  is now `appStoreUrl ? "Download on the" : "Coming soon"`.
- **F53-N4:** app-repo-only, see `../worktrees/pixelfix-share-f53/implementation-notes.md`.
- **F53-N5 (LOW):** removed the non-spec `comment` key from
  `assetlinks.json`'s statement object (restoring the plain two-key
  `relation`/`target` shape a Digital Asset Links verifier expects) and
  moved the owner-action note to a new `public/.well-known/README.md`.

Automation-as-infrastructure check: the recurring class here is exactly
the one this repo's `.claude/rules/ultracode-workflows.md` and the app
repo's `implementation-playbook.md` already name - "a fix round introduces
its own regression" (specifically: deleting CSS coupled to a component
without checking what ELSE that CSS's selectors were carrying, and without
checking the unlayered-vs-layered cascade interaction with Tailwind v4).
No new automated guard added for the cascade-order class specifically
(a genuine Playwright/computed-style check was flagged as the ideal fix by
the r2 reviewer but is out of scope for a targeted fix round - jsdom
cannot compute real CSS cascade); logged explicitly per the Standing Test
rather than silently skipped. The `!important` fix itself is a structural
guard against a repeat of this exact regression (an `!important` utility
cannot lose to an unlayered non-`!important` rule, so a future landing.css
edit can't silently re-break this again the same way).

Gates run this round: `npx tsc --noEmit` -> 0 errors. `npx eslint` on all
touched source + test files -> 0 errors (1 pre-existing unrelated warning
on CTA.tsx's `<img>` usage, not touched by this fix). Targeted jest
(`--testPathPattern "(StoreBadges|ProfileShareLanding)"`, `--maxWorkers=2`)
-> 2 suites / 25 tests passed (7 new tests added: App Store fallback
label, className merge x2, 4 F53-N2 static-invariant assertions). Full
`npm test`, `npm run build`, `next build` NOT re-run in this fix-round
session (targeted-only per this session's scope, and this repo's known
pre-existing failing suites - `waitlist-extended.test.ts`,
`EtherealShadow*.test.tsx` - are unrelated and out of scope, see the
earlier "Gate results" section above).

## Round 3 re-review fixes (F53-R3-1, F53-R3-2, F53-R3-3) - 2026-08-06

**F53-R3-1 (MED):** the r2 fix for F53-N1 (homepage gold-on-black labels / near-invisible
ink-on-black hover) added no test asserting the anchor's colour utility - only the `!`
(important) modifier stands between the homepage and the regression recurring, and jsdom
cannot see the compiled cascade outcome directly. Added a test in `StoreBadges.test.tsx`
asserting both badge anchors carry `!text-white`/`hover:!text-white` (or the v4 trailing-`!`
spelling). Verified fail-capable: manually stripped the `!` locally and confirmed the new
test goes red (then restored it) before committing.

**F53-R3-2 (LOW):** the mobile CSS the r2 fix ported used Tailwind's default `max-sm:`
(640px) and `flex-1` (`flex:1 1 0%`), not the ORIGINAL deleted rule's `@media(max-width:560px)`
and `flex:1 1 auto`. Changed both anchor and wrapper to the arbitrary-variant
`max-[560px]:` breakpoint and `flex-[1_1_auto]`, matching the deleted CSS exactly on two of
its three axes. The THIRD axis is an accepted deviation, documented in the component header:
the old rules were `.landing`-scoped and never reached `/u/[username]`, but these Tailwind
utilities live on the anchor itself and apply everywhere `StoreBadges` mounts - so
`ProfileShareLanding`'s badges now also get the mobile stretch/gap behaviour the homepage
always had. Judged harmless/positive rather than worth chasing (would require a second,
`.landing`-scoped copy of the utility, reintroducing exactly the coupling R1 removed).

**F53-R3-3 (LOW):** `showFallbackCta` was gated on `isHydrated`, which made the
SERVER-RENDERED HTML content-empty on every platform (a no-JS visitor got only the
"@username" heading - no store badges, no explanation), and delayed the correct first paint
on iOS/desktop until after hydration. Dropped the `isHydrated &&` conjunct from
`showFallbackCta` (now the plain `!showOpeningMessage`) - `showOpeningMessage` keeps its
`isHydrated` gate untouched. Verified this does NOT reintroduce the F53-N2 hydration
mismatch: React renders the false server snapshots (`getServerIsHydratedSnapshot`,
`getServerIsAndroidSnapshot`) during BOTH the actual server render and the client's
hydration-matching render, so server HTML === hydration HTML regardless of this branch; the
subsequent re-render (once `useSyncExternalStore` re-reads the live snapshots) is an ordinary
post-hydration update, not a mismatch. No `<noscript>`/`suppressHydrationWarning` needed.
Updated the four F53-N2 static-invariant tests in `ProfileShareLanding.test.tsx` to the new
`showFallbackCta = !showOpeningMessage;` shape (was asserting the now-removed
`isHydrated && !showOpeningMessage`), and added an assertion that
`getServerIsAndroidSnapshot` still returns false (the fact that makes the no-mismatch
argument hold).

**Automation-as-infrastructure answer:** F53-R3-1's new test IS the automation this class was
missing - a `!`-drop or Tailwind-version codemod now fails the suite instead of shipping
silently. F53-R3-2/F53-R3-3 are behavioural corrections with their existing static-invariant/
render-test coverage updated to the new intended shape; no new guard class was needed beyond
that.

Gates run in this worktree: `npx jest` (full suite) = 16 suites / 154 tests PASS (was 152
before this round; +2 net: F53-R3-1's new colour test, +1 net across the F53-N2 rename/
additions in ProfileShareLanding.test.tsx). `npx tsc --noEmit` = 0 errors. `next build` /
Playwright e2e NOT re-run in this scoped fix pass.
