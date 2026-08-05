/**
 * src/__tests__/components/profile-share/ProfileShareLanding.test.tsx
 *
 * Pixel-fix F-53 (app repo, docs/v0.9.3/PIXEL-PASS-FINDINGS.md:1414-1442):
 * the marketing-site landing target for a profile-share universal link.
 * Covers the platform-gated app-open attempt (fix-round r1, F53-R5:
 * automatic only on Android; iOS/desktop get a tap-gated button instead),
 * the fallback timeout swap, and cleanup.
 */

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
