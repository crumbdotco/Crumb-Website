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
