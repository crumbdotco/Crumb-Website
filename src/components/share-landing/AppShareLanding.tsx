"use client";

/**
 * src/components/share-landing/AppShareLanding.tsx
 *
 * Pixel-fix F-53b (owner directive 2026-08-06, EXECUTION.md wave-3 item 7b
 * "website-first share links EVERYWHERE, not just profile"): generic
 * landing target for a share-link recipient who does NOT have the app
 * installed (or whose OS declined to auto-open it), for every surface
 * BESIDES profile - review (/review/[id]), post (/post/[id]), place
 * (/place/[id]). A recipient who DOES have the app never reaches this page
 * at all; the OS opens the app directly via the matching app-side route (or,
 * for place, the app-side manual Linking listener - see the app repo's
 * services/deeplinks/link-builder.ts header for why place has no dedicated
 * expo-router file route).
 *
 * This is components/profile-share/ProfileShareLanding.tsx's shape made
 * generic (kicker/heading/description copy + the crumbify:// path segment +
 * id are all props) rather than three more hand-rolled near-copies of the
 * same SSR/hydration trade - see src/components/share-landing/
 * use-hydrated-platform.ts's file header for the full writeup of that trade
 * (F53-N2 vs F53-R3-3) and why every consumer of this component inherits it
 * unchanged. ProfileShareLanding.tsx itself is INTENTIONALLY NOT rebuilt on
 * top of this component - it already shipped, was reviewed across four
 * rounds, and carries its own established regression tests; only its
 * isAndroid/isHydrated plumbing was extracted to the shared hook (see that
 * component's own file header).
 *
 * Custom-scheme second-chance attempt (`crumbify://<pathSegment>/<id>`),
 * mirrors ProfileShareLanding's F53-R5 platform gate: ANDROID ONLY attempts
 * this automatically on mount (Android's intent-based handoff for an
 * unregistered scheme degrades gracefully); iOS Safari/desktop get an
 * explicit tap-gated "Open in the Crumbify app" button instead (a blocking
 * "cannot open the page" alert on those platforms would hit exactly the
 * audience this page exists to convert).
 *
 * Brand rules (house, ~/.claude/rules/common/frontend-design.md + this
 * repo's CLAUDE.md): no money/£ figures, no letter-spacing > 0, no em/en
 * dashes (plain hyphens only), no decorative separator dots, no
 * spotlight/glow effects.
 */

import { useEffect, useState } from "react";
import { StoreBadges } from "../landing/StoreBadges";
import { attemptCrumbifyDeepLink } from "./attempt-app-deep-link";
import { useHydratedPlatform } from "./use-hydrated-platform";

export interface AppShareLandingProps {
  /** The crumbify:// path segment - "review" | "post" | "place". */
  readonly pathSegment: string;
  /** The id/handle to build `crumbify://<pathSegment>/<id>` from. */
  readonly id: string;
  /** Small label above the heading, e.g. "Crumbify review". */
  readonly kicker: string;
  /** Main heading text, e.g. "A review on Crumbify". */
  readonly heading: string;
  /** Fallback-CTA description copy. */
  readonly description: string;
}

/** How long to wait for the OS to hand off to the app before showing the fallback CTA. */
const APP_OPEN_TIMEOUT_MS = 1500;

export function AppShareLanding({
  pathSegment,
  id,
  kicker,
  heading,
  description,
}: AppShareLandingProps) {
  const [showFallback, setShowFallback] = useState(false);
  const { isAndroid, isHydrated } = useHydratedPlatform();

  useEffect(() => {
    // If the tab is still visible after the timeout, the OS did not hand
    // off to the app (not installed, or App-Link verification declined) -
    // show the store-link fallback instead of leaving the visitor on a
    // blank "opening..." screen forever.
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        setShowFallback(true);
      }
    }, APP_OPEN_TIMEOUT_MS);

    if (isAndroid) {
      attemptCrumbifyDeepLink(pathSegment, id);
    }

    return () => window.clearTimeout(timer);
  }, [pathSegment, id, isAndroid]);

  const showOpeningMessage = isHydrated && isAndroid && !showFallback;
  // Deliberately NOT gated on isHydrated - see use-hydrated-platform.ts's
  // file header for why (F53-N2 vs F53-R3-3 accepted trade, inherited here
  // unchanged from ProfileShareLanding.tsx).
  const showFallbackCta = !showOpeningMessage;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4ECE1] px-6 py-16 text-center text-[#1A1208]">
      <p className="mb-2 text-sm text-[#8a7a68]">{kicker}</p>
      <h1 className="mb-6 max-w-md text-2xl font-semibold sm:text-3xl">{heading}</h1>

      {showOpeningMessage && (
        <p className="text-base text-[#4a3f33]" data-testid="opening-message">
          Opening in the Crumbify app...
        </p>
      )}

      {showFallbackCta && (
        <div className="flex flex-col items-center gap-6" data-testid="fallback-cta">
          <p className="max-w-sm text-base text-[#4a3f33]">{description}</p>
          <button
            type="button"
            className="rounded-[14px] bg-[#E6C39B] px-[22px] py-[13px] text-[15px] font-bold text-[#1A1208] shadow-[0_5px_0_#C9A077] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_#C9A077]"
            onClick={() => attemptCrumbifyDeepLink(pathSegment, id)}
            data-testid="open-in-app-button"
          >
            Open in the Crumbify app
          </button>
          <StoreBadges />
        </div>
      )}
    </div>
  );
}
