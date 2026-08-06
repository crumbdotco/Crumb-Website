/**
 * src/__tests__/components/share-landing/attempt-app-deep-link.test.ts
 *
 * W3R1-share-f53b-03 (MED, orchestrator adjudication 2026-08-06): direct
 * unit tests for the generic buildCrumbifyDeepLink(pathSegment, id) builder
 * consumed by AppShareLanding's review/post/place mount points - previously
 * only exercised indirectly via a jest.mock() in AppShareLanding.test.tsx,
 * never asserted against directly. Mirrors the profile-share sibling's own
 * test file (src/__tests__/components/profile-share/attempt-app-deep-
 * link.test.ts) shape-for-shape; keeps window.location.href as the single
 * untested-by-design line, exactly as that sibling does (jsdom does not
 * implement navigation to non-http(s) schemes - see this module's own
 * file-header comment).
 */

import {
  buildCrumbifyDeepLink,
  attemptCrumbifyDeepLink,
} from "@/components/share-landing/attempt-app-deep-link";

describe("buildCrumbifyDeepLink", () => {
  it.each([
    ["review", "abc123", "crumbify://review/abc123"],
    ["post", "abc123", "crumbify://post/abc123"],
    ["place", "ChIJabc123", "crumbify://place/ChIJabc123"],
  ])("builds a crumbify://%s/<id> link for pathSegment=%s, id=%s", (pathSegment, id, expected) => {
    expect(buildCrumbifyDeepLink(pathSegment, id)).toBe(expected);
  });

  it("URL-encodes reserved/space characters in the id", () => {
    expect(buildCrumbifyDeepLink("review", "abc 123")).toBe(
      "crumbify://review/abc%20123",
    );
    expect(buildCrumbifyDeepLink("post", "id/with/slash")).toBe(
      "crumbify://post/id%2Fwith%2Fslash",
    );
    expect(buildCrumbifyDeepLink("place", "id?with=query&chars")).toBe(
      "crumbify://place/id%3Fwith%3Dquery%26chars",
    );
  });

  it("round-trips underscore and hyphen characters unencoded (real post/review UUIDs and Google place_ids use both)", () => {
    expect(buildCrumbifyDeepLink("review", "a1b2-c3d4_e5f6")).toBe(
      "crumbify://review/a1b2-c3d4_e5f6",
    );
    // Google Places place_id values are base64url-ish and legitimately
    // contain both characters (see the app repo's
    // services/deeplinks/parse-place-id.ts PLACE_ID_PATTERN for the same
    // charset assumption on the receiving end).
    expect(buildCrumbifyDeepLink("place", "ChIJ_N-de_ID-Value")).toBe(
      "crumbify://place/ChIJ_N-de_ID-Value",
    );
  });

  it("handles an empty id (produces a trailing-slash link, matching the profile-share sibling's empty-input shape)", () => {
    expect(buildCrumbifyDeepLink("review", "")).toBe("crumbify://review/");
  });

  it("does not encode the pathSegment itself (caller-controlled, always a literal review/post/place)", () => {
    expect(buildCrumbifyDeepLink("post", "id")).toMatch(/^crumbify:\/\/post\//);
  });
});

describe("attemptCrumbifyDeepLink", () => {
  it("assigns window.location.href to the built deep link (best-effort - jsdom does not implement non-http navigation)", () => {
    // jsdom logs "not implemented" for non-http(s) navigation and leaves
    // window.location.href unchanged - this test only asserts the call does
    // not throw, matching the production "best-effort attempt" contract and
    // the profile-share sibling's own equivalent test.
    expect(() => attemptCrumbifyDeepLink("review", "abc123")).not.toThrow();
  });
});
