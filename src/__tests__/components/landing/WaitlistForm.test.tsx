/**
 * src/__tests__/components/landing/WaitlistForm.test.tsx
 *
 * Covers the four visible states of the hero waitlist form: idle,
 * submitting (button disabled), success, already-on-the-list, and error
 * rendering the server's own message verbatim.
 */

import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { useWaitlist } from "@/hooks/useWaitlist";

let mockScriptProps: Record<string, unknown> = {};

jest.mock("next/script", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      mockScriptProps = props;
      return React.createElement("script", props);
    },
  };
});

describe("WaitlistForm", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    mockScriptProps = {};
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete (window as Window & { turnstile?: unknown }).turnstile;
    jest.restoreAllMocks();
  });

  function enableTurnstile() {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    const renderWidget = jest.fn((...args: [HTMLElement, Record<string, unknown>]) => {
      void args;
      return "widget-id";
    });
    const resetWidget = jest.fn();
    (window as Window & {
      turnstile?: {
        render: typeof renderWidget;
        reset: typeof resetWidget;
      };
    }).turnstile = { render: renderWidget, reset: resetWidget };
    return { renderWidget, resetWidget };
  }

  function fillAndSubmit(email = "person@gmail.com") {
    fireEvent.change(screen.getByTestId("waitlist-email-input"), { target: { value: email } });
    fireEvent.click(screen.getByTestId("waitlist-submit"));
  }

  it("renders the idle state with the default status line", () => {
    render(<WaitlistForm />);
    expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
      "Be first to know when Crumbify opens.",
    );
    expect(screen.getByTestId("waitlist-submit")).toBeEnabled();
  });

  it("disables the button while submitting", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    global.fetch = jest.fn(
      () => new Promise((resolve) => { resolveFetch = resolve; }),
    ) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-submit")).toBeDisabled();
    });

    await act(async () => {
      resolveFetch({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => ({ success: true, alreadyExists: false }),
      });
    });
  });

  it("shows the success message for a new signup", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, alreadyExists: false }),
    }) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
        "You're on the list. See you soon.",
      );
    });
  });

  it("shows the already-on-the-list message for a duplicate signup", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, alreadyExists: true }),
    }) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
        "You're already on the list.",
      );
    });
  });

  it("shows the server's exact error message on rejection", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      headers: { get: () => "application/json" },
      json: async () => ({
        error: "Please use a personal email like Gmail, iCloud or Outlook. Student emails work too.",
      }),
    }) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit("person@example.com");

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
        "Please use a personal email like Gmail, iCloud or Outlook. Student emails work too.",
      );
    });
  });

  it("shows a generic error message on a network failure", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
        "Something went wrong, please try again.",
      );
    });
  });

  it("shows a generic error message when a failed response has no JSON error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      headers: { get: () => "text/plain" },
    }) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
        "Something went wrong, please try again.",
      );
    });
  });

  it("mounts the interaction-only light flexible widget and sends its token", async () => {
    const { renderWidget } = enableTurnstile();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, alreadyExists: false }),
    }) as unknown as typeof fetch;

    render(<WaitlistForm />);

    await waitFor(() => expect(renderWidget).toHaveBeenCalled());
    const options = renderWidget.mock.calls[0][1] as Record<string, unknown>;
    expect(options).toMatchObject({
      sitekey: "site-key",
      theme: "light",
      size: "flexible",
      appearance: "interaction-only",
    });
    expect(screen.getByTestId("waitlist-turnstile")).toHaveAttribute("role", "group");
    act(() => (options.callback as (token: string) => void)("turnstile-token"));
    fillAndSubmit();

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toMatchObject({
      turnstileToken: "turnstile-token",
    });
  });

  it("waits for a Turnstile token before submitting", async () => {
    const { renderWidget } = enableTurnstile();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, alreadyExists: false }),
    }) as unknown as typeof fetch;
    render(<WaitlistForm />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalled());

    fillAndSubmit();

    await waitFor(() => expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
      "One moment...",
    ));
    expect(global.fetch).not.toHaveBeenCalled();

    const options = renderWidget.mock.calls[0][1] as Record<string, unknown>;
    act(() => (options.callback as (token: string) => void)("turnstile-token"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
      "You're on the list. See you soon.",
    ));
  });

  it("shows a bounded retry message if the token never arrives", async () => {
    jest.useFakeTimers();
    const { renderWidget } = enableTurnstile();
    render(<WaitlistForm />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalled());

    fillAndSubmit();
    expect(screen.getByTestId("waitlist-status")).toHaveTextContent("One moment...");

    act(() => jest.advanceTimersByTime(5_000));
    expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
      "The bot check is taking too long. Please try again.",
    );
    jest.useRealTimers();
  });

  it("shows a refresh message when the widget script fails to load", async () => {
    const { renderWidget } = enableTurnstile();
    render(<WaitlistForm />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalled());

    act(() => (mockScriptProps.onError as () => void)());

    await waitFor(() => expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
      "The bot check could not load. Please refresh the page and try again.",
    ));
  });

  it("shows the widget error visibly", async () => {
    const { renderWidget } = enableTurnstile();
    render(<WaitlistForm />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalled());

    const options = renderWidget.mock.calls[0][1] as Record<string, unknown>;
    act(() => (options["error-callback"] as () => void)());
    fillAndSubmit();

    await waitFor(() => expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
      "The bot check could not load. Please refresh the page and try again.",
    ));
  });

  it("does not submit when the widget error is already present", () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const { result } = renderHook(() => useWaitlist({
      turnstileRequired: true,
      turnstileError: "The bot check could not load. Please refresh the page and try again.",
    }));

    act(() => result.current.setEmail("person@gmail.com"));
    act(() => result.current.submit({ preventDefault: jest.fn() } as unknown as React.FormEvent));

    expect(result.current.errorMessage).toBe(
      "The bot check could not load. Please refresh the page and try again.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops waiting when the widget errors during a pending submit", async () => {
    const { renderWidget } = enableTurnstile();
    render(<WaitlistForm />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalled());
    fillAndSubmit();
    await waitFor(() => expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
      "One moment...",
    ));

    const options = renderWidget.mock.calls[0][1] as Record<string, unknown>;
    act(() => (options["error-callback"] as () => void)());

    await waitFor(() => expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
      "The bot check could not load. Please refresh the page and try again.",
    ));
  });

  it("resets the widget after a non-success response", async () => {
    const { renderWidget, resetWidget } = enableTurnstile();
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "The bot check could not be verified. Please try again." }),
    }) as unknown as typeof fetch;
    render(<WaitlistForm />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalled());
    const options = renderWidget.mock.calls[0][1] as Record<string, unknown>;
    act(() => (options.callback as (token: string) => void)("turnstile-token"));
    fillAndSubmit();

    await waitFor(() => expect(resetWidget).toHaveBeenCalledWith("widget-id"));
  });
});
