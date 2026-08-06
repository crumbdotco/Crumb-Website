"use client";

/**
 * src/components/profile-share/ProfileShareLanding.tsx
 *
 * Pixel-fix F-53 (app repo, docs/v0.9.3/PIXEL-PASS-FINDINGS.md:1414-1442):
 * lands a "Share profile" universal link recipient who does NOT have the
 * app installed (or whose OS declined to auto-open it). A recipient who DOES
 * have the app - and where the OS's universal-link / App-Link verification
 * succeeded - never reaches this page at all; the OS opens the app directly
 * into app/u/[username].tsx (app repo).
 *
 * Custom-scheme second-chance attempt (`crumbify://u/<username>`), fix-round
 * r1 F53-R5: ANDROID ONLY does this automatically on mount - Android's
 * intent-based handoff for an unregistered scheme degrades gracefully
 * (Chrome either silently no-ops or shows a dismissible "open in app?"
 * chooser). iOS Safari and desktop browsers instead surface a BLOCKING
 * "cannot open the page / address is invalid" alert for an unregistered
 * custom scheme, which would hit exactly the audience this page exists to
 * convert - those platforms never attempt automatically; they get an
 * explicit "Open in the Crumbify app" button instead, gated behind a real
 * user gesture (also safe to offer on Android as a manual retry).
 *
 * Fix-round r2 (F53-N2): `isAndroid` is false on the server-rendered HTML
 * (there is no `navigator` during SSR - see getServerIsAndroidSnapshot
 * below), so before r2 an Android recipient's FIRST PAINT was the
 * give-up "get the app" fallback CTA, which then flipped to the "Opening
 * in the Crumbify app..." message once React hydrated and re-read the real
 * user agent - the opposite of the intended experience. r2 fixed this by
 * gating BOTH branches on `isHydrated` (also read via useSyncExternalStore),
 * so nobody sees the give-up state flash before the real handoff attempt
 * fires - but that made the SERVER-RENDERED HTML content-empty on every
 * platform. Fix-round r3 (F53-R3-3) removed the `isHydrated` gate from the
 * fallback-CTA branch only (see `showFallbackCta` below): SSR/no-JS now
 * renders the fallback CTA (the correct final state on iOS/desktop) as
 * first paint, and a genuine Android device still swaps to the opening
 * message once hydration confirms the platform - no flash of the give-up
 * state on Android, and no more content-empty first paint everywhere else.
 *
 * Brand rules (house, ~/.claude/rules/common/frontend-design.md +
 * this repo's CLAUDE.md): no money/£ figures, no letter-spacing > 0, no
 * em/en dashes (plain hyphens only), no decorative separator dots, no
 * spotlight/glow effects.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import { StoreBadges } from "../landing/StoreBadges";
import { attemptCrumbifyDeepLink } from "./attempt-app-deep-link";

export interface ProfileShareLandingProps {
  readonly username: string;
}

/** How long to wait for the OS to hand off to the app before showing the fallback CTA. */
const APP_OPEN_TIMEOUT_MS = 1500;

/** True only on a genuine Android user agent (undefined `navigator` -> false). */
function isAndroidDevice(): boolean {
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

/** The platform "store" never changes after mount, so subscribing is a permanent no-op. */
function subscribeToPlatform(): () => void {
  return () => {};
}

/** No `navigator` exists during server rendering. */
function getServerIsAndroidSnapshot(): boolean {
  return false;
}

/** True once mounted on the client; false during SSR/hydration (F53-N2). */
function getIsHydratedSnapshot(): boolean {
  return true;
}

/** The hydration state never changes after mount, so subscribing is a permanent no-op. */
function subscribeToHydration(): () => void {
  return () => {};
}

/** Not yet hydrated during server rendering. */
function getServerIsHydratedSnapshot(): boolean {
  return false;
}

export function ProfileShareLanding({ username }: ProfileShareLandingProps) {
  const [showFallback, setShowFallback] = useState(false);
  // Hydration-safe read of a browser-only value (react-hooks/set-state-in-
  // effect forbids deriving this via a setState call inside a mount effect,
  // and computing it inline during render would mismatch the server-
  // rendered HTML, which has no `navigator`). `useSyncExternalStore` is
  // React's own tool for exactly this: it renders `getServerIsAndroidSnapshot`
  // (false) during SSR/hydration and `isAndroidDevice()` (the real value)
  // once mounted on the client, reconciling the two without a manual effect.
  const isAndroid = useSyncExternalStore(
    subscribeToPlatform,
    isAndroidDevice,
    getServerIsAndroidSnapshot,
  );
  // Gates BOTH the opening-message and fallback-CTA branches below (F53-N2)
  // so the give-up fallback never paints before hydration knows whether
  // this is Android (see file header).
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getIsHydratedSnapshot,
    getServerIsHydratedSnapshot,
  );

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
      // Android's intent-based handoff for an unregistered custom scheme
      // degrades gracefully (silent no-op, or a dismissible chooser) -
      // safe to attempt automatically. iOS Safari / desktop never reach
      // this branch (isAndroid is false there); they get the tap-gated
      // "Open in the Crumbify app" button in the fallback CTA instead
      // (fix-round r1, F53-R5).
      attemptCrumbifyDeepLink(username);
    }

    return () => window.clearTimeout(timer);
  }, [username, isAndroid]);

  const showOpeningMessage = isHydrated && isAndroid && !showFallback;
  // F53-R3-3 fix (pixel-fix wave 1 round-3 re-review, LOW): dropped the
  // `isHydrated &&` conjunct here. Gating the fallback CTA on hydration
  // made the SERVER-RENDERED HTML content-empty on every platform (just the
  // "@username" heading, no store badges, no explanation) - a no-JS visitor
  // hit a dead end, and on iOS/desktop (where the fallback CTA IS the
  // correct final state) the useful content painted only after hydration
  // instead of in the first paint. This does NOT reintroduce the F53-N2
  // hydration mismatch: `getServerIsHydratedSnapshot`/`getServerIsAndroidSnapshot`
  // both still return false during the hydration render (React renders the
  // server snapshot on the client's first/hydration pass, not the real one),
  // so server HTML === hydration HTML regardless of this branch - the
  // subsequent client-only re-render (once useSyncExternalStore re-reads the
  // live snapshots) is a normal post-hydration update, not a mismatch. Net
  // effect: SSR/no-JS visitors now get the fallback CTA (copy + button +
  // store badges) as first paint; on a real Android device that gets
  // swapped for the "Opening in the Crumbify app..." message once hydration
  // confirms the platform.
  const showFallbackCta = !showOpeningMessage;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4ECE1] px-6 py-16 text-center text-[#1A1208]">
      <p className="mb-2 text-sm text-[#8a7a68]">Crumbify profile</p>
      <h1 className="mb-6 max-w-md text-2xl font-semibold sm:text-3xl">
        {"@"}
        {username}
      </h1>

      {showOpeningMessage && (
        <p className="text-base text-[#4a3f33]" data-testid="opening-message">
          Opening in the Crumbify app...
        </p>
      )}

      {showFallbackCta && (
        <div className="flex flex-col items-center gap-6" data-testid="fallback-cta">
          <p className="max-w-sm text-base text-[#4a3f33]">
            Get the Crumbify app to see this profile, follow their food finds, and
            find your own favourite spots.
          </p>
          <button
            type="button"
            className="rounded-[14px] bg-[#E6C39B] px-[22px] py-[13px] text-[15px] font-bold text-[#1A1208] shadow-[0_5px_0_#C9A077] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_#C9A077]"
            onClick={() => attemptCrumbifyDeepLink(username)}
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
