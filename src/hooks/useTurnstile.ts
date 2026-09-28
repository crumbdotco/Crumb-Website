"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ERROR_MESSAGE =
  "The bot check could not load. Please try again or check your connection.";

export function useTurnstile(theme: "light" | "dark" = "light") {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const hasTurnstile = siteKey.length > 0;
  const [token, setToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!hasTurnstile || !containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme,
      size: "flexible",
      appearance: "interaction-only",
      callback: (nextToken: string) => {
        setErrorMessage(null);
        setToken(nextToken);
      },
      "expired-callback": () => setToken(null),
      "error-callback": () => {
        setToken(null);
        setErrorMessage(SCRIPT_ERROR_MESSAGE);
        widgetIdRef.current = null;
      },
    });
  }, [hasTurnstile, siteKey, theme]);

  const handleScriptLoad = useCallback(() => {
    if (!window.turnstile) {
      setErrorMessage(SCRIPT_ERROR_MESSAGE);
      return;
    }
    renderWidget();
  }, [renderWidget]);

  const handleScriptError = useCallback(() => {
    setToken(null);
    setErrorMessage(SCRIPT_ERROR_MESSAGE);
  }, []);

  useEffect(() => {
    if (hasTurnstile && window.turnstile) {
      renderWidget();
    }

    return () => {
      widgetIdRef.current = null;
    };
  }, [hasTurnstile, renderWidget]);

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
    setToken(null);
    setErrorMessage(null);
  }, []);

  return {
    token,
    containerRef,
    hasTurnstile,
    errorMessage,
    handleScriptLoad,
    handleScriptError,
    reset,
  };
}
