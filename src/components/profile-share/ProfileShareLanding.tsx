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
 * Attempts the custom-scheme deep link (`crumbify://u/<username>`) as a
 * second chance for an installed-but-unverified app, then falls back to
 * store links / a waitlist-style CTA after a short timeout. Pure
 * client-side attempt - no Supabase call from the website, no username
 * resolution here; the app resolves the username after it opens (see
 * services/supabase/resolve-username.ts in the app repo).
 *
 * Brand rules (house, ~/.claude/rules/common/frontend-design.md +
 * this repo's CLAUDE.md): no money/£ figures, no letter-spacing > 0, no
 * em/en dashes (plain hyphens only), no decorative separator dots, no
 * spotlight/glow effects.
 */

import { useEffect, useState } from "react";
import { StoreBadges } from "../landing/StoreBadges";
import { attemptCrumbifyDeepLink } from "./attempt-app-deep-link";

export interface ProfileShareLandingProps {
  readonly username: string;
}

/** How long to wait for the OS to hand off to the app before showing the fallback CTA. */
const APP_OPEN_TIMEOUT_MS = 1500;

export function ProfileShareLanding({ username }: ProfileShareLandingProps) {
  const [showFallback, setShowFallback] = useState(false);

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

    // Second-chance attempt: a universal link that reached this page at all
    // means the OS either has no app installed or declined to hand off -
    // trying the custom scheme covers the "installed but unverified" case
    // (some Android OEM browsers, in-app browsers) without any extra cost
    // if it silently no-ops when the app truly isn't there.
    attemptCrumbifyDeepLink(username);

    return () => window.clearTimeout(timer);
  }, [username]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4ECE1] px-6 py-16 text-center text-[#1A1208]">
      <p className="mb-2 text-sm text-[#8a7a68]">Crumbify profile</p>
      <h1 className="mb-6 max-w-md text-2xl font-semibold sm:text-3xl">
        {"@"}
        {username}
      </h1>

      {!showFallback && (
        <p className="text-base text-[#4a3f33]" data-testid="opening-message">
          Opening in the Crumbify app...
        </p>
      )}

      {showFallback && (
        <div className="flex flex-col items-center gap-6" data-testid="fallback-cta">
          <p className="max-w-sm text-base text-[#4a3f33]">
            Get the Crumbify app to see this profile, follow their food finds, and
            find your own favourite spots.
          </p>
          <StoreBadges />
        </div>
      )}
    </div>
  );
}
