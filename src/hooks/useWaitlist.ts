"use client";
import { useState, useCallback } from "react";

const isBrowser = typeof window !== "undefined";

interface UseWaitlistOptions {
  turnstileToken: string | null;
  honeypotId?: string;
}

export function useWaitlist({ turnstileToken, honeypotId = "crumb-hp" }: UseWaitlistOptions) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.includes("@")) return;

      setStatus("loading");
      try {
        const honeypotValue = isBrowser
          ? (document.getElementById(honeypotId) as HTMLInputElement | null)?.value ?? ""
          : "";

        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            website: honeypotValue,
            turnstileToken: turnstileToken ?? "",
          }),
        });

        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [email, turnstileToken, honeypotId],
  );

  return { email, setEmail, status, submit };
}
