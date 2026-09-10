/**
 * src/__tests__/components/landing/FoundingSection.test.tsx
 *
 * Stage 4.5 B7 / Crumb-Website#17 fix round: GET /api/waitlist/founding now
 * omits `closed` (alongside `remaining`) whenever the live cap could not be
 * read, rather than fabricating `closed: false`. This pins that the card
 * treats an absent `closed` as "not closed" and still shows the CTA - a
 * cap-read blip must never hide the buy button, since the real gates
 * (the webhook's payment-link deactivation and the SQL grant check) stay
 * intact regardless of what this display endpoint could read.
 */

import { render, screen, waitFor } from "@testing-library/react";
import { FoundingSection } from "@/components/landing/FoundingSection";

describe("FoundingSection", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("renders the CTA and no closed message when the cap is unreadable (closed key absent, not a fabricated false)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ count: 42, capAvailable: false }),
    }) as unknown as typeof fetch;

    render(<FoundingSection />);

    await waitFor(() => {
      expect(screen.getByText("42 / 100")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Become a founding member/i })).toBeInTheDocument();
    expect(screen.queryByText(/Founding membership is now closed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/remaining/i)).not.toBeInTheDocument();
  });

  it("still renders the closed message and hides the CTA when the live payload genuinely says closed: true", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ count: 100, remaining: 0, closed: true, capAvailable: true }),
    }) as unknown as typeof fetch;

    render(<FoundingSection />);

    await waitFor(() => {
      expect(screen.getByText(/Founding membership is now closed/i)).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /Become a founding member/i })).not.toBeInTheDocument();
  });
});
