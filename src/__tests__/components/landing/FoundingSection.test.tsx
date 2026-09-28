import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FoundingSection } from "@/components/landing/FoundingSection";

describe("FoundingSection", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("starts without a fabricated count or progress bar while the count is pending", () => {
    global.fetch = jest.fn(() => new Promise<Response>(() => {})) as typeof fetch;

    render(<FoundingSection />);

    expect(screen.queryByText("0 / 100")).not.toBeInTheDocument();
    expect(screen.queryByText("... / 100")).not.toBeInTheDocument();
    expect(document.querySelector(".fbar")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Become a founding member/i })).toBeInTheDocument();
  });

  it("treats non-OK, non-JSON, and missing-count responses as failures", async () => {
    jest.useFakeTimers();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, json: jest.fn() })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.reject(new Error("not JSON")) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ remaining: 100 }) }) as unknown as typeof fetch;

    render(<FoundingSection />);

    await act(async () => {
      await Promise.resolve();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);

    await act(async () => {
      jest.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(screen.getByText("Live count unavailable right now.")).toBeInTheDocument();
    expect(screen.queryByText("0 / 100")).not.toBeInTheDocument();
    expect(screen.queryByText(/100 spots remaining/)).not.toBeInTheDocument();
    expect(document.querySelector(".fbar")).not.toBeInTheDocument();
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    const button = screen.getByRole("button", { name: /Become a founding member/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(openSpy).toHaveBeenCalledWith("/founding-member", "_self");
  });

  it("treats a missing count as failure, retries three times, then shows unavailable", async () => {
    jest.useFakeTimers();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ remaining: 99 }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ remaining: 99 }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ remaining: 99 }) }) as unknown as typeof fetch;

    render(<FoundingSection />);

    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(screen.getByText("Live count unavailable right now.")).toBeInTheDocument();
    expect(screen.queryByText("0 / 100")).not.toBeInTheDocument();
    expect(screen.queryByText(/100 spots remaining/)).not.toBeInTheDocument();
  });

  it("shows the real count when the second attempt succeeds", async () => {
    jest.useFakeTimers();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, json: jest.fn() })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 42, remaining: 58, closed: false }),
      }) as unknown as typeof fetch;

    render(<FoundingSection />);

    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByText("42 / 100")).toBeInTheDocument();
    expect(screen.getByText("58 spots remaining")).toBeInTheDocument();
  });

  it("aborts a pending retry after unmount", async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: jest.fn() }) as unknown as typeof fetch;

    const { unmount } = render(<FoundingSection />);
    await act(async () => {
      await Promise.resolve();
    });

    unmount();
    expect((global.fetch as jest.Mock).mock.calls[0][1].signal.aborted).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("renders the CTA and no closed message when the cap is unreadable (closed key absent, not a fabricated false)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
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
      ok: true,
      json: () => Promise.resolve({ count: 100, remaining: 0, closed: true, capAvailable: true }),
    }) as unknown as typeof fetch;

    render(<FoundingSection />);

    await waitFor(() => {
      expect(screen.getByText(/Founding membership is now closed/i)).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /Become a founding member/i })).not.toBeInTheDocument();
  });
});
