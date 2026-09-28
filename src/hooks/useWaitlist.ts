"use client";
import { useCallback, useState } from "react";

const isBrowser = typeof window !== "undefined";

export type WaitlistStatus = "idle" | "submitting" | "success" | "alreadyExists" | "error";

interface UseWaitlistOptions {
  turnstileToken?: string | null;
  turnstileRequired?: boolean;
  turnstileError?: string | null;
  resetTurnstile?: () => void;
  honeypotId?: string;
}

const GENERIC_ERROR = "Something went wrong, please try again.";
const TURNSTILE_REQUIRED_ERROR = "Please complete the bot check, then try again.";

export function useWaitlist({
  turnstileToken = null,
  turnstileRequired = false,
  turnstileError = null,
  resetTurnstile,
  honeypotId = "crumb-hp",
}: UseWaitlistOptions = {}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (status === "submitting") return;
      if (!email.includes("@")) return;
      if (turnstileError) {
        setErrorMessage(turnstileError);
        setStatus("error");
        return;
      }
      if (turnstileRequired && !turnstileToken) {
        setErrorMessage(TURNSTILE_REQUIRED_ERROR);
        setStatus("error");
        return;
      }

      setStatus("submitting");
      setErrorMessage(null);

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
          setStatus(parsed.alreadyExists ? "alreadyExists" : "success");
          return;
        }

        resetTurnstile?.();
        setErrorMessage(parsed.error ?? GENERIC_ERROR);
        setStatus("error");
      } catch {
        resetTurnstile?.();
        setErrorMessage(GENERIC_ERROR);
        setStatus("error");
      }
    },
    [email, status, turnstileError, turnstileRequired, turnstileToken, resetTurnstile, honeypotId],
  );

  return { email, setEmail, status, errorMessage, submit, honeypotId };
}
