"use client";

/**
 * src/components/share-landing/use-hydrated-platform.ts
 *
 * Pixel-fix F-53b (app repo, owner directive 2026-08-06): SSR-safe
 * "is this an Android device, has this component hydrated yet" detection,
 * shared by every "attempt an app open, fall back to store badges" landing
 * page - profile (/u/[username]), review (/review/[id]), post (/post/[id]),
 * place (/place/[id]).
 *
 * Extracted out of components/profile-share/ProfileShareLanding.tsx (F-53,
 * wave 1) so the subtle SSR/hydration trade that component's own file
 * header documents (F53-N2 vs F53-R3-3 - round-4 re-review, R4-WEB-2) has
 * exactly ONE implementation, never N near-identical hand-rolled copies.
 * This is the same class of bug the app repo's utils/photo-display-
 * predicate.ts extraction fixed after utils/post-share-link.ts's `hasPhoto`
 * drifted from its sibling predicate - see that file's header in the app
 * repo for the canonical writeup of why duplicated predicates rot.
 *
 * THE TRADE THIS ENCODES (do not "simplify" without reading this first):
 * `isAndroid` and `isHydrated` both render their SERVER snapshot (false)
 * during BOTH the real server render AND the client's hydration-matching
 * render (React always renders the server snapshot on the client's first
 * pass, never the live one) - so server HTML === hydration HTML regardless
 * of how a consumer branches on these two booleans. Only once mounted does
 * `useSyncExternalStore` re-read the live snapshots and trigger an ordinary
 * post-hydration re-render. A consumer that gates its "give up, show the
 * fallback" branch on `isHydrated` closes a no-JS/first-paint dead end but
 * reopens a same-render "flash" of the fallback CTA on a real Android
 * device (component swaps from fallback -> opening-message once hydration
 * confirms the platform is Android); a consumer that does NOT gate the
 * fallback branch on `isHydrated` gets a real first paint everywhere but
 * accepts that Android-specific flash. ProfileShareLanding.tsx's own header
 * documents the orchestrator's accepted choice (ungated fallback branch,
 * i.e. accept the brief Android flash) for the WHOLE family of pages built
 * on this hook - every new consumer inherits that same choice by using this
 * hook as-is; do not re-derive it per page.
 */

import { useSyncExternalStore } from "react";

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

export interface HydratedPlatform {
  readonly isAndroid: boolean;
  readonly isHydrated: boolean;
}

/**
 * Hydration-safe read of two browser-only values. `useSyncExternalStore` is
 * React's own tool for exactly this: it renders each `getServer*Snapshot`
 * during SSR/hydration and the real live value once mounted on the client,
 * reconciling the two without a manual effect (which would either mismatch
 * the server-rendered HTML or require deriving state inside an effect,
 * banned by react-hooks/set-state-in-effect).
 */
export function useHydratedPlatform(): HydratedPlatform {
  const isAndroid = useSyncExternalStore(
    subscribeToPlatform,
    isAndroidDevice,
    getServerIsAndroidSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getIsHydratedSnapshot,
    getServerIsHydratedSnapshot,
  );
  return { isAndroid, isHydrated };
}
