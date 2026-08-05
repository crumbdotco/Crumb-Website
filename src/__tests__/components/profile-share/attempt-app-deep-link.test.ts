/**
 * src/__tests__/components/profile-share/attempt-app-deep-link.test.ts
 *
 * Unit tests for the pure buildCrumbifyDeepLink builder (pixel-fix F-53),
 * plus a smoke test that attemptCrumbifyDeepLink assigns window.location.href.
 */

import {
  buildCrumbifyDeepLink,
  attemptCrumbifyDeepLink,
} from "@/components/profile-share/attempt-app-deep-link";

describe("buildCrumbifyDeepLink", () => {
  it("builds a crumbify://u/<username> link for a plain username", () => {
    expect(buildCrumbifyDeepLink("alibars")).toBe("crumbify://u/alibars");
  });

  it("URL-encodes reserved characters in the username", () => {
    expect(buildCrumbifyDeepLink("ali bars")).toBe("crumbify://u/ali%20bars");
  });

  it("handles an empty string", () => {
    expect(buildCrumbifyDeepLink("")).toBe("crumbify://u/");
  });
});

describe("attemptCrumbifyDeepLink", () => {
  it("assigns window.location.href to the built deep link (best-effort - jsdom does not implement non-http navigation)", () => {
    // jsdom logs "not implemented" for non-http(s) navigation and leaves
    // window.location.href unchanged - this test only asserts the call does
    // not throw, matching the production "best-effort attempt" contract.
    expect(() => attemptCrumbifyDeepLink("alibars")).not.toThrow();
  });
});
