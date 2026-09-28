import { act, renderHook } from "@testing-library/react";
import { useTurnstile } from "@/hooks/useTurnstile";

describe("useTurnstile", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete (window as Window & { turnstile?: unknown }).turnstile;
  });

  it("reports a visible error when the API is absent", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    const { result } = renderHook(() => useTurnstile());

    act(() => result.current.handleScriptLoad());

    expect(result.current.errorMessage).toBe(
      "The bot check could not load. Please refresh the page and try again.",
    );
    act(() => result.current.handleScriptError());
    expect(result.current.errorMessage).toBe(
      "The bot check could not load. Please refresh the page and try again.",
    );
  });

  it("renders, receives, expires, and resets a token", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    const renderWidget = jest.fn().mockReturnValue("widget-id");
    const resetWidget = jest.fn();
    (window as Window & {
      turnstile?: { render: typeof renderWidget; reset: typeof resetWidget };
    }).turnstile = { render: renderWidget, reset: resetWidget };

    const { result } = renderHook(() => useTurnstile("dark"));
    result.current.containerRef.current = document.createElement("div");

    act(() => result.current.handleScriptLoad());
    expect(renderWidget).toHaveBeenCalledWith(
      result.current.containerRef.current,
      expect.objectContaining({ theme: "dark", size: "flexible", appearance: "interaction-only" }),
    );

    const options = renderWidget.mock.calls[0][1] as Record<string, () => void>;
    act(() => (options.callback as unknown as (token: string) => void)("token"));
    expect(result.current.token).toBe("token");
    act(() => options["expired-callback"]());
    expect(result.current.token).toBeNull();
    act(() => result.current.reset());
    expect(resetWidget).toHaveBeenCalledWith("widget-id");
  });

  it("keeps the widget available after error recovery so a rejected submit can reset it", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    const renderWidget = jest.fn().mockReturnValue("widget-id");
    const resetWidget = jest.fn();
    (window as Window & {
      turnstile?: { render: typeof renderWidget; reset: typeof resetWidget };
    }).turnstile = { render: renderWidget, reset: resetWidget };

    const { result } = renderHook(() => useTurnstile());
    result.current.containerRef.current = document.createElement("div");
    act(() => result.current.handleScriptLoad());

    const options = renderWidget.mock.calls[0][1] as Record<string, () => void>;
    act(() => (options["error-callback"] as () => void)());
    act(() => (options.callback as unknown as (token: string) => void)("recovered-token"));
    expect(result.current.token).toBe("recovered-token");

    act(() => result.current.reset());
    expect(resetWidget).toHaveBeenCalledWith("widget-id");
  });
});
