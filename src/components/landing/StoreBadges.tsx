/**
 * src/components/landing/StoreBadges.tsx
 *
 * Native app-store badges. Rendered in THREE places: the marketing homepage
 * (Hero.tsx, CTA.tsx - inside the `.landing`-scoped page, src/app/page.tsx
 * imports landing.css) AND the profile-share landing
 * (src/components/profile-share/ProfileShareLanding.tsx, mounted at
 * /u/[username] - NOT inside `.landing`, landing.css is never imported on
 * that route).
 *
 * Styled entirely via Tailwind utility classes on the component itself
 * (globals.css/Tailwind is imported once in the root layout and therefore
 * available on every route) rather than landing.css's `.landing .stores` /
 * `.landing .store` descendant-scoped rules - pixel-fix F-53R1 found the
 * badges rendering completely unstyled on /u/[username] (default-size raw
 * SVGs - the icon markup in ./data.ts carries a viewBox but no width/height
 * - and a plain white Apple glyph with no black pill chrome) because those
 * rules only ever applied inside the one page that imports landing.css.
 * Do not reintroduce a dependency on landing.css here; if the visual design
 * changes, change the Tailwind classes below (single source for all three
 * mount points).
 *
 * Both badges ALWAYS resolve to a real, clickable, non-"#" anchor - never a
 * dead link and never a non-interactive disabled element (pixel-fix
 * F-53R2): when `NEXT_PUBLIC_APP_STORE_URL` / `NEXT_PUBLIC_PLAY_STORE_URL`
 * is not yet configured for a platform (pre-launch on that store), the
 * badge instead links to the site's founding-member join section
 * (`/#founding`, FoundingSection.tsx) as the working fallback CTA, so a
 * recipient without the app always has somewhere real to go.
 *
 * Pixel-fix F-53 fix-round r2 (F53-N1): the anchor's text colour uses the
 * `!` (important) Tailwind v4 modifier (`!text-white` / `hover:!text-white`)
 * rather than r1's plain `text-white`. Reason: `.landing` (the homepage's
 * page-scoped stylesheet, src/app/landing.css) is imported UNLAYERED at
 * src/app/page.tsx, while Tailwind's generated utilities live inside
 * `@layer utilities` (src/app/globals.css's `@import "tailwindcss"`).
 * Unlayered CSS always wins over layered CSS regardless of selector
 * specificity, so landing.css's `.landing a{color:var(--gold-2)}` /
 * `.landing a:hover{color:var(--ink)}` silently overrode the plain
 * `text-white` utility on the homepage (Hero.tsx / CTA.tsx) - the label
 * rendered gold, and near-invisible ink-on-black on hover. `/u/[username]`
 * (ProfileShareLanding.tsx) never imports landing.css so was never affected
 * - this was purely a homepage regression. The `!` modifier emits
 * `color:#fff!important`, which beats an unlayered non-`!important` rule
 * too, so this fixes the homepage without landing.css needing to know
 * anything about this component, and without reintroducing the
 * `.landing .store` coupling R1 deliberately removed.
 *
 * `className` (optional) lets a consumer add layout-only utilities to the
 * badges' flex wrapper - e.g. CTA.tsx passes `justify-center` to recentre
 * them inside its centred `.cta-in` band, now that the old
 * `.landing .cta-in .stores{justify-content:center}` rule has no matching
 * class left to attach to (the wrapper below carries no `stores` class by
 * design - see the file-header note above on why).
 *
 * Pixel-fix F-53 fix-round r3 (F53-R3-1, F53-R3-2 - accepted deviation):
 * - F53-R3-1: the homepage-critical `!text-white`/`hover:!text-white`
 *   important modifiers are now asserted by a jsdom test
 *   (StoreBadges.test.tsx) so silently dropping the `!` (a tidy-up edit or a
 *   Tailwind v3->v4 codemod) fails the suite instead of shipping the
 *   gold-on-black/near-invisible-hover homepage regression a second time.
 * - F53-R3-2: the mobile breakpoint is now `max-[560px]:` (an arbitrary
 *   variant) instead of Tailwind's default `max-sm:` (640px), and
 *   `flex-[1_1_auto]` instead of `flex-1` (`flex:1 1 0%`) - both restored to
 *   match the ORIGINAL deleted `.landing .store{flex:1 1 auto; ...}` /
 *   `@media(max-width:560px)` rule exactly. One delta is deliberately NOT
 *   fixed and is an accepted deviation: the old rules were `.landing`-scoped
 *   so they never reached `/u/[username]`, but these are anchor-level
 *   Tailwind utilities that apply everywhere this component is mounted -
 *   ProfileShareLanding's badges now get the same mobile stretch/gap
 *   behaviour the homepage always had, which they never had before. This is
 *   considered a harmless (arguably positive) consistency improvement, not
 *   a regression to chase.
 */

import { appleSvg, gplaySvg } from "./data";

/** Working fallback destination when a platform's store URL env is unset. */
const FALLBACK_CTA_HREF = "/#founding";

export interface StoreBadgesProps {
  /** Extra layout-only classes merged onto the badges' flex wrapper. */
  readonly className?: string;
}

interface StoreBadgeProps {
  readonly href: string;
  readonly iconSvg: string;
  readonly smallLabel: string;
  readonly bigLabel: string;
  readonly ariaLabel: string;
}

function StoreBadge({ href, iconSvg, smallLabel, bigLabel, ariaLabel }: StoreBadgeProps) {
  return (
    <a
      className="inline-flex items-center gap-[11px] rounded-[13px] bg-black py-[9px] pr-[18px] pl-[15px] !text-white no-underline shadow-[0_8px_26px_rgba(0,0,0,0.16)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:!text-white active:translate-y-0 max-[560px]:flex-[1_1_auto] max-[560px]:min-w-0 max-[560px]:justify-center"
      href={href}
      aria-label={ariaLabel}
    >
      <span
        className="flex h-[27px] w-[27px] flex-none items-center justify-center [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />
      <span className="flex flex-col leading-[1.15]">
        <small className="block text-[11px] font-medium opacity-90">{smallLabel}</small>
        <b className="block text-[18px] leading-[1.2] font-semibold">{bigLabel}</b>
      </span>
    </a>
  );
}

export function StoreBadges({ className = "" }: StoreBadgesProps = {}) {
  const appStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL || "";
  const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "";

  return (
    <div
      className={`flex flex-wrap gap-[13px] max-[560px]:gap-[10px]${className ? ` ${className}` : ""}`}
      data-testid="store-badges"
    >
      <StoreBadge
        href={appStoreUrl || FALLBACK_CTA_HREF}
        iconSvg={appleSvg}
        smallLabel={appStoreUrl ? "Download on the" : "Coming soon"}
        bigLabel="App Store"
        ariaLabel={
          appStoreUrl
            ? "Download on the App Store"
            : "App Store link coming soon - join the founding member waitlist instead"
        }
      />
      <StoreBadge
        href={playStoreUrl || FALLBACK_CTA_HREF}
        iconSvg={gplaySvg}
        smallLabel={playStoreUrl ? "Get it on" : "Coming soon"}
        bigLabel="Google Play"
        ariaLabel={
          playStoreUrl
            ? "Get it on Google Play"
            : "Google Play link coming soon - join the founding member waitlist instead"
        }
      />
    </div>
  );
}
