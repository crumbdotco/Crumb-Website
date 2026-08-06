/**
 * src/__tests__/components/profile-share/ProfileShareLanding.test.tsx
 *
 * Pixel-fix F-53 (app repo, docs/v0.9.3/PIXEL-PASS-FINDINGS.md:1414-1442):
 * the marketing-site landing target for a profile-share universal link.
 * Covers the platform-gated app-open attempt (fix-round r1, F53-R5:
 * automatic only on Android; iOS/desktop get a tap-gated button instead),
 * the fallback timeout swap, and cleanup.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { render, screen, act } from "@testing-library/react";
import { ProfileShareLanding } from "@/components/profile-share/ProfileShareLanding";

const mockAttemptCrumbifyDeepLink = jest.fn();
jest.mock("@/components/profile-share/attempt-app-deep-link", () => ({
  attemptCrumbifyDeepLink: (...args: unknown[]) => mockAttemptCrumbifyDeepLink(...args),
}));

jest.useFakeTimers();

const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

describe("ProfileShareLanding", () => {
  const originalUserAgent = window.navigator.userAgent;

  beforeEach(() => {
    mockAttemptCrumbifyDeepLink.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    setUserAgent(originalUserAgent);
  });

  it('renders the "@username" heading regardless of platform', () => {
    render(<ProfileShareLanding username="alibars" />);
    expect(screen.getByRole("heading", { name: "@alibars" })).toBeInTheDocument();
  });

  describe("on Android (F53-R5: safe to auto-attempt - the OS handoff degrades gracefully)", () => {
    beforeEach(() => setUserAgent(ANDROID_UA));

    it("shows the opening-in-app message immediately, not the fallback CTA", () => {
      render(<ProfileShareLanding username="alibars" />);
      expect(screen.getByTestId("opening-message")).toBeInTheDocument();
      expect(screen.queryByTestId("fallback-cta")).not.toBeInTheDocument();
    });

    it("attempts the crumbify:// custom-scheme deep link automatically with the raw username", () => {
      render(<ProfileShareLanding username="ali bars" />);
      expect(mockAttemptCrumbifyDeepLink).toHaveBeenCalledWith("ali bars");
    });

    it("swaps to the fallback CTA (store badges) after the timeout elapses while still visible", () => {
      render(<ProfileShareLanding username="alibars" />);
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByTestId("fallback-cta")).toBeInTheDocument();
      expect(screen.queryByTestId("opening-message")).not.toBeInTheDocument();
    });

    it("does NOT show the fallback CTA before the timeout elapses", () => {
      render(<ProfileShareLanding username="alibars" />);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.queryByTestId("fallback-cta")).not.toBeInTheDocument();
    });

    it("does not show the fallback CTA if the tab is hidden when the timeout fires (app opened, tab backgrounded)", () => {
      const spy = jest.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
      render(<ProfileShareLanding username="alibars" />);
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.queryByTestId("fallback-cta")).not.toBeInTheDocument();
      spy.mockRestore();
    });
  });

  describe("on iOS Safari (F53-R5: never auto-attempt - an unregistered scheme blocks with an alert)", () => {
    beforeEach(() => setUserAgent(IOS_UA));

    it("does NOT attempt the deep link automatically on mount", () => {
      render(<ProfileShareLanding username="alibars" />);
      expect(mockAttemptCrumbifyDeepLink).not.toHaveBeenCalled();
    });

    it("shows the fallback CTA (with the Open-in-app button) immediately, not the opening message", () => {
      render(<ProfileShareLanding username="alibars" />);
      expect(screen.getByTestId("fallback-cta")).toBeInTheDocument();
      expect(screen.queryByTestId("opening-message")).not.toBeInTheDocument();
    });

    it('tapping "Open in the Crumbify app" attempts the deep link with the raw username (gated behind a real user gesture)', () => {
      render(<ProfileShareLanding username="ali bars" />);
      expect(mockAttemptCrumbifyDeepLink).not.toHaveBeenCalled();
      screen.getByTestId("open-in-app-button").click();
      expect(mockAttemptCrumbifyDeepLink).toHaveBeenCalledWith("ali bars");
    });

    it("still shows the store badges alongside the Open-in-app button", () => {
      render(<ProfileShareLanding username="alibars" />);
      expect(screen.getByTestId("store-badges")).toBeInTheDocument();
    });
  });

  describe("on desktop (no mobile UA at all - same non-auto-attempt path as iOS)", () => {
    it("does NOT attempt the deep link automatically on mount", () => {
      render(<ProfileShareLanding username="alibars" />);
      expect(mockAttemptCrumbifyDeepLink).not.toHaveBeenCalled();
    });
  });

  it("clears its timer on unmount (no state update after unmount)", () => {
    const { unmount } = render(<ProfileShareLanding username="alibars" />);
    unmount();
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(2000);
      });
    }).not.toThrow();
  });
});

// jsdom's `render()` is a client-only mount, not a real server-render ->
// hydrate pass, so it cannot reproduce the actual SSR behaviour. Source
// invariant instead, per the static-analysis-test pattern.
describe("F53-N2 regression: the opening-message branch never renders before hydration is known", () => {
  const src = readFileSync(
    join(__dirname, "../../../components/profile-share/ProfileShareLanding.tsx"),
    "utf8",
  );

  it("showOpeningMessage is gated on isHydrated (never shows the Android opening message before hydration confirms the platform)", () => {
    expect(src).toMatch(/const showOpeningMessage = isHydrated && isAndroid && !showFallback;/);
  });

  // F53-R3-3 fix (pixel-fix wave 1 round-3 re-review, LOW): showFallbackCta
  // is DELIBERATELY no longer gated on isHydrated - gating it made the
  // server-rendered HTML content-empty on every platform (a no-JS visitor
  // got no store badges, no explanation - just the "@username" heading).
  // SSR/hydration-render both use the false server snapshots for BOTH
  // isHydrated and isAndroid, so showFallbackCta = !showOpeningMessage is
  // true in server HTML too - no hydration MISMATCH, since the hydration
  // render matches the server render exactly.
  //
  // THIS LOCKS AN INTENTIONAL, ACCEPTED TRADE-OFF (round-4 re-review,
  // R4-WEB-2, wave1-rereview-r4-journal.jsonl), not a bug-free shape: it
  // REOPENS F53-N2 (r2, LOW) - on a genuine Android device the fallback CTA
  // now paints briefly before hydration confirms the platform and swaps to
  // the "Opening in the Crumbify app..." message, exactly the flash F53-N2
  // originally fixed. The orchestrator decision was to keep this ungated
  // shape (a no-JS dead end on iOS/desktop/no-JS is worse than a brief
  // Android-only flash) rather than restore the isHydrated gate. Restoring
  // `isHydrated && !showOpeningMessage` here would silently re-close F53-N2
  // but reopen the no-JS/first-paint regression F53-R3-3 fixed - do not
  // "fix" this assertion without re-reading ProfileShareLanding.tsx's file
  // header and implementation-notes.md's "Round 4 re-review" section first.
  it("showFallbackCta is the plain negation of showOpeningMessage (renders in SSR/no-JS too, not gated on isHydrated - LOCKED SHAPE, see F53-N2-vs-F53-R3-3 trade above)", () => {
    expect(src).toMatch(/const showFallbackCta = !showOpeningMessage;/);
    expect(src).not.toMatch(/const showFallbackCta = isHydrated && !showOpeningMessage;/);
  });

  it("the fallback-CTA JSX branch renders off showFallbackCta, not a raw duplicate of the negation", () => {
    expect(src).toMatch(/\{showFallbackCta && \(/);
  });

  it("isHydrated's server snapshot is false and client snapshot is true (SSR-false/client-true shape)", () => {
    expect(src).toMatch(/function getServerIsHydratedSnapshot\(\): boolean \{\s*return false;/);
    expect(src).toMatch(/function getIsHydratedSnapshot\(\): boolean \{\s*return true;/);
  });

  it("isAndroid's server snapshot is false too, so the hydration-render matches SSR HTML exactly (no mismatch from the ungated fallback branch)", () => {
    expect(src).toMatch(/function getServerIsAndroidSnapshot\(\): boolean \{\s*return false;/);
  });
});
