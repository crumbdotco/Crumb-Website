/**
 * src/components/share-landing/attempt-app-deep-link.ts
 *
 * Pixel-fix F-53b (owner directive 2026-08-06): generalised version of
 * components/profile-share/attempt-app-deep-link.ts's
 * `crumbify://u/<username>` builder - builds the custom-scheme second-chance
 * deep link for ANY share-landing surface (`crumbify://<pathSegment>/<id>`),
 * used by AppShareLanding.tsx's review/post/place mount points. Split into
 * its own module (rather than inlined in the component) for the same reason
 * as its profile-share sibling: tests can mock the navigation side effect -
 * jsdom does not implement navigation to non-http(s) schemes.
 *
 * Deliberately NOT merged into components/profile-share/attempt-app-deep-
 * link.ts itself (a `pathSegment` param there would work identically) -
 * that module's own `buildCrumbifyDeepLink(username)` is still directly
 * unit-tested and consumed with its ORIGINAL single-argument shape; changing
 * its signature would be a needless breaking edit to already-shipped,
 * reviewed code for no behavioural gain. New surfaces build on this generic
 * sibling instead.
 */

/** Pure builder - no side effects. */
export function buildCrumbifyDeepLink(pathSegment: string, id: string): string {
  return `crumbify://${pathSegment}/${encodeURIComponent(id)}`;
}

/** Side-effecting navigation attempt - the only untested-by-design line here. */
export function attemptCrumbifyDeepLink(pathSegment: string, id: string): void {
  window.location.href = buildCrumbifyDeepLink(pathSegment, id);
}
