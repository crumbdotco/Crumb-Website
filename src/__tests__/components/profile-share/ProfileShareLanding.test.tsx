/**
 * src/__tests__/components/profile-share/ProfileShareLanding.test.tsx
 *
 * Pixel-fix F-53 (app repo, docs/v0.9.3/PIXEL-PASS-FINDINGS.md:1414-1442):
 * the marketing-site landing target for a profile-share universal link.
 * Covers the app-open attempt, the fallback timeout swap, and cleanup.
 */

import { render, screen, act } from "@testing-library/react";
import { ProfileShareLanding } from "@/components/profile-share/ProfileShareLanding";

const mockAttemptCrumbifyDeepLink = jest.fn();
jest.mock("@/components/profile-share/attempt-app-deep-link", () => ({
  attemptCrumbifyDeepLink: (...args: unknown[]) => mockAttemptCrumbifyDeepLink(...args),
}));

jest.useFakeTimers();

describe("ProfileShareLanding", () => {
  beforeEach(() => {
    mockAttemptCrumbifyDeepLink.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders the "@username" heading', () => {
    render(<ProfileShareLanding username="alibars" />);
    expect(screen.getByRole("heading", { name: "@alibars" })).toBeInTheDocument();
  });

  it("shows the opening-in-app message immediately, not the fallback CTA", () => {
    render(<ProfileShareLanding username="alibars" />);
    expect(screen.getByTestId("opening-message")).toBeInTheDocument();
    expect(screen.queryByTestId("fallback-cta")).not.toBeInTheDocument();
  });

  it("attempts the crumbify:// custom-scheme deep link with the raw username", () => {
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
