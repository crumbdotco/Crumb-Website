"use client";
import { useState, useRef, useEffect, useCallback } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const isBrowser = typeof window !== "undefined";

export function useTurnstile(theme: "light" | "dark" = "dark") {
  const [token, setToken] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const hasTurnstile = !!TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!isBrowser || !TURNSTILE_SITE_KEY || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme,
      size: "flexible",
      callback: (t: string) => setToken(t),
      "expired-callback": () => setToken(null),
      "error-callback": () => {
        setToken(null);
        widgetIdRef.current = null;
      },
    });
  }, [theme]);

  useEffect(() => {
    if (!isBrowser || !TURNSTILE_SITE_KEY) return;

    if (window.turnstile) {
      renderWidget();
      return;
    }

    window.onTurnstileLoad = () => renderWidget();

    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit";
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      window.onTurnstileLoad = undefined;
    };
  }, [renderWidget]);

  const reset = useCallback(() => {
    if (isBrowser && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setToken(null);
    }
  }, []);

  return { token, containerRef, hasTurnstile, reset };
}
