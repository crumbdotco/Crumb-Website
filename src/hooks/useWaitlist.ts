"use client";
import { useCallback, useState } from "react";

const isBrowser = typeof window !== "undefined";

export type WaitlistStatus = "idle" | "submitting" | "success" | "alreadyExists" | "error";

interface UseWaitlistOptions {
  turnstileToken?: string | null;
  honeypotId?: string;
}

const GENERIC_ERROR = "Something went wrong, please try again.";

export function useWaitlist({ turnstileToken = null, honeypotId = "crumb-hp" }: UseWaitlistOptions = {}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (status === "submitting") return;
      if (!email.includes("@")) return;

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

        setErrorMessage(parsed.error ?? GENERIC_ERROR);
        setStatus("error");
      } catch {
        setErrorMessage(GENERIC_ERROR);
        setStatus("error");
      }
    },
    [email, status, turnstileToken, honeypotId],
  );

  return { email, setEmail, status, errorMessage, submit, honeypotId };
}
