"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const isBrowser = typeof window !== "undefined";

export type WaitlistStatus = "idle" | "submitting" | "success" | "alreadyExists" | "error";

// The type is the guard for "error always carries a message": tsc enforces it, so no
// runtime fallback exists by design.
type WaitlistState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "alreadyExists" }
  | { status: "error"; errorMessage: string };

interface UseWaitlistOptions {
  turnstileToken?: string | null;
  turnstileRequired?: boolean;
  turnstileError?: string | null;
  resetTurnstile?: () => void;
  honeypotId?: string;
}

const GENERIC_ERROR = "Something went wrong, please try again.";
const TURNSTILE_WAIT_TIMEOUT_MS = 5_000;
const TURNSTILE_WAITING_MESSAGE = "One moment...";
const TURNSTILE_WAIT_TIMEOUT_MESSAGE = "The bot check is taking too long. Please try again.";

export function useWaitlist({
  turnstileToken = null,
  turnstileRequired = false,
  turnstileError = null,
  resetTurnstile,
  honeypotId = "crumb-hp",
}: UseWaitlistOptions = {}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<WaitlistState>({ status: "idle" });
  const [waitingForTurnstile, setWaitingForTurnstile] = useState(false);
  const waitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const status: WaitlistStatus = state.status;

  const clearTurnstileWait = useCallback(() => {
    if (waitTimeoutRef.current) {
      clearTimeout(waitTimeoutRef.current);
      waitTimeoutRef.current = null;
    }
  }, []);

  const submitRequest = useCallback(async () => {
    clearTurnstileWait();
    setWaitingForTurnstile(false);
    setState({ status: "submitting" });

    try {
      const honeypotValue = isBrowser
        ? ((document.getElementById(honeypotId) as HTMLInputElement | null)?.value ?? "")
        : "";

      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website: honeypotValue,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      const parsed = contentType.includes("application/json")
        ? ((await res.json()) as { success?: boolean; alreadyExists?: boolean; error?: string })
        : {};

      if (res.ok && parsed.success) {
        setState({ status: parsed.alreadyExists ? "alreadyExists" : "success" });
        return;
      }

      resetTurnstile?.();
      setState({ status: "error", errorMessage: parsed.error ?? GENERIC_ERROR });
    } catch {
      resetTurnstile?.();
      setState({ status: "error", errorMessage: GENERIC_ERROR });
    }
  }, [email, turnstileToken, resetTurnstile, honeypotId, clearTurnstileWait]);

  useEffect(() => {
    if (waitingForTurnstile && turnstileToken) {
      const submitTimeout = setTimeout(() => {
        void submitRequest();
      }, 0);
      return () => clearTimeout(submitTimeout);
    }
    return undefined;
  }, [waitingForTurnstile, turnstileToken, submitRequest]);

  useEffect(() => {
    if (waitingForTurnstile && turnstileError) {
      clearTurnstileWait();
    }
  }, [waitingForTurnstile, turnstileError, clearTurnstileWait]);

  useEffect(() => clearTurnstileWait, [clearTurnstileWait]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (status === "submitting") return;
      if (!email.includes("@")) return;
      if (turnstileError) {
        setState({ status: "error", errorMessage: turnstileError });
        return;
      }
      if (turnstileRequired && !turnstileToken) {
        clearTurnstileWait();
        setState({ status: "submitting" });
        setWaitingForTurnstile(true);
        waitTimeoutRef.current = setTimeout(() => {
          waitTimeoutRef.current = null;
          setWaitingForTurnstile(false);
          setState({ status: "error", errorMessage: TURNSTILE_WAIT_TIMEOUT_MESSAGE });
        }, TURNSTILE_WAIT_TIMEOUT_MS);
        return;
      }

      void submitRequest();
    },
    [
      status,
      email,
      turnstileError,
      turnstileRequired,
      turnstileToken,
      clearTurnstileWait,
      submitRequest,
    ],
  );

  return {
    email,
    setEmail,
    status,
    errorMessage: state.status === "error" ? state.errorMessage : "",
    submit,
    honeypotId,
    waitingForTurnstile,
    turnstileWaitingMessage: TURNSTILE_WAITING_MESSAGE,
  };
}
