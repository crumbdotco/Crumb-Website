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
      className="inline-flex items-center gap-[11px] rounded-[13px] bg-black py-[9px] pr-[18px] pl-[15px] !text-white no-underline shadow-[0_8px_26px_rgba(0,0,0,0.16)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:!text-white active:translate-y-0 max-sm:flex-1 max-sm:min-w-0 max-sm:justify-center"
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
      className={`flex flex-wrap gap-[13px] max-sm:gap-[10px]${className ? ` ${className}` : ""}`}
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
