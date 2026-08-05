/**
 * src/components/profile-share/attempt-app-deep-link.ts
 *
 * Pixel-fix F-53: builds the custom-scheme deep link `crumbify://u/<username>`
 * used as ProfileShareLanding's second-chance app-open attempt, and performs
 * the actual navigation. Split into its own module (rather than inlined in
 * the component) so tests can mock the navigation side effect - jsdom does
 * not implement navigation to non-http(s) schemes (it logs "not implemented"
 * and leaves `window.location.href` unchanged), so asserting on the real
 * `window.location.href` value in a jsdom test is not possible.
 */

/** Pure builder - no side effects. */
export function buildCrumbifyDeepLink(username: string): string {
  return `crumbify://u/${encodeURIComponent(username)}`;
}

/** Side-effecting navigation attempt - the only untested-by-design line here. */
export function attemptCrumbifyDeepLink(username: string): void {
  window.location.href = buildCrumbifyDeepLink(username);
}
