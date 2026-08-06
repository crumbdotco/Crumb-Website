/**
 * src/__tests__/components/share-landing/AppShareLanding.test.tsx
 *
 * Pixel-fix F-53b (owner directive 2026-08-06): the generic share-landing
 * component consumed by /review/[id], /post/[id], /place/[id]. Mirrors
 * ProfileShareLanding.test.tsx's coverage (that component's own tests stay
 * untouched - see this component's file header for why they were not
 * merged), parameterized instead of duplicated per surface.
 */

import { render, screen, act } from "@testing-library/react";
import { AppShareLanding } from "@/components/share-landing/AppShareLanding";

const mockAttemptCrumbifyDeepLink = jest.fn();
jest.mock("@/components/share-landing/attempt-app-deep-link", () => ({
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

const REVIEW_PROPS = {
  pathSegment: "review",
  id: "abc-123",
  kicker: "Crumbify review",
  heading: "A review on Crumbify",
  description: "Get the Crumbify app to see this review.",
};

describe("AppShareLanding", () => {
  const originalUserAgent = window.navigator.userAgent;

  beforeEach(() => {
    mockAttemptCrumbifyDeepLink.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    setUserAgent(originalUserAgent);
  });

  it("renders the supplied kicker and heading copy", () => {
    render(<AppShareLanding {...REVIEW_PROPS} />);
    expect(screen.getByText("Crumbify review")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A review on Crumbify" })).toBeInTheDocument();
  });

  it("renders the supplied description in the fallback CTA", () => {
    setUserAgent(IOS_UA);
    render(<AppShareLanding {...REVIEW_PROPS} />);
    expect(screen.getByText("Get the Crumbify app to see this review.")).toBeInTheDocument();
  });

  describe("on Android (safe to auto-attempt - the OS handoff degrades gracefully)", () => {
    beforeEach(() => setUserAgent(ANDROID_UA));

    it("shows the opening-in-app message immediately, not the fallback CTA", () => {
      render(<AppShareLanding {...REVIEW_PROPS} />);
      expect(screen.getByTestId("opening-message")).toBeInTheDocument();
      expect(screen.queryByTestId("fallback-cta")).not.toBeInTheDocument();
    });

    it("attempts the crumbify:// custom-scheme deep link automatically with the pathSegment and id", () => {
      render(<AppShareLanding {...REVIEW_PROPS} id="review-42" />);
      expect(mockAttemptCrumbifyDeepLink).toHaveBeenCalledWith("review", "review-42");
    });

    it("attempts with a different pathSegment for a post surface", () => {
      render(
        <AppShareLanding
          pathSegment="post"
          id="post-1"
          kicker="Crumbify post"
          heading="A post on Crumbify"
          description="Get the Crumbify app to see this post."
        />,
      );
      expect(mockAttemptCrumbifyDeepLink).toHaveBeenCalledWith("post", "post-1");
    });

    it("attempts with a different pathSegment for a place surface", () => {
      render(
        <AppShareLanding
          pathSegment="place"
          id="ChIJN1t_tDeuEmsRUsoyG83frY4"
          kicker="Crumbify place"
          heading="A place on Crumbify"
          description="Get the Crumbify app to see this place."
        />,
      );
      expect(mockAttemptCrumbifyDeepLink).toHaveBeenCalledWith(
        "place",
        "ChIJN1t_tDeuEmsRUsoyG83frY4",
      );
    });

    it("swaps to the fallback CTA (store badges) after the timeout elapses while still visible", () => {
      render(<AppShareLanding {...REVIEW_PROPS} />);
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByTestId("fallback-cta")).toBeInTheDocument();
      expect(screen.queryByTestId("opening-message")).not.toBeInTheDocument();
    });

    it("does NOT show the fallback CTA before the timeout elapses", () => {
      render(<AppShareLanding {...REVIEW_PROPS} />);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.queryByTestId("fallback-cta")).not.toBeInTheDocument();
    });

    it("does not show the fallback CTA if the tab is hidden when the timeout fires (app opened, tab backgrounded)", () => {
      const spy = jest.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
      render(<AppShareLanding {...REVIEW_PROPS} />);
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.queryByTestId("fallback-cta")).not.toBeInTheDocument();
      spy.mockRestore();
    });
  });

  describe("on iOS Safari (never auto-attempt - an unregistered scheme blocks with an alert)", () => {
    beforeEach(() => setUserAgent(IOS_UA));

    it("does NOT attempt the deep link automatically on mount", () => {
      render(<AppShareLanding {...REVIEW_PROPS} />);
      expect(mockAttemptCrumbifyDeepLink).not.toHaveBeenCalled();
    });

    it("shows the fallback CTA (with the Open-in-app button) immediately, not the opening message", () => {
      render(<AppShareLanding {...REVIEW_PROPS} />);
      expect(screen.getByTestId("fallback-cta")).toBeInTheDocument();
      expect(screen.queryByTestId("opening-message")).not.toBeInTheDocument();
    });

    it('tapping "Open in the Crumbify app" attempts the deep link with the pathSegment and id (gated behind a real user gesture)', () => {
      render(<AppShareLanding {...REVIEW_PROPS} id="review-99" />);
      expect(mockAttemptCrumbifyDeepLink).not.toHaveBeenCalled();
      screen.getByTestId("open-in-app-button").click();
      expect(mockAttemptCrumbifyDeepLink).toHaveBeenCalledWith("review", "review-99");
    });

    it("still shows the store badges alongside the Open-in-app button", () => {
      render(<AppShareLanding {...REVIEW_PROPS} />);
      expect(screen.getByTestId("store-badges")).toBeInTheDocument();
    });
  });

  describe("on desktop (no mobile UA at all - same non-auto-attempt path as iOS)", () => {
    it("does NOT attempt the deep link automatically on mount", () => {
      render(<AppShareLanding {...REVIEW_PROPS} />);
      expect(mockAttemptCrumbifyDeepLink).not.toHaveBeenCalled();
    });
  });

  it("clears its timer on unmount (no state update after unmount)", () => {
    const { unmount } = render(<AppShareLanding {...REVIEW_PROPS} />);
    unmount();
    expect(() => {
      act(() => {
        jest.advanceTimersByTime(2000);
      });
    }).not.toThrow();
  });
});
