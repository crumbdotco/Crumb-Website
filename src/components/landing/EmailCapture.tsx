"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { LedgeButton } from "./LedgeButton";
import { C } from "./tokens";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useTurnstile } from "@/hooks/useTurnstile";

interface EmailCaptureProps {
  nunitoClass: string;
  /** "dark" = input on dark hero | "light" = input on cream section */
  surface?: "dark" | "light";
  /** Unique honeypot id — use distinct values for each instance on a page */
  honeypotId?: string;
}

export function EmailCapture({ nunitoClass, surface = "dark", honeypotId = "crumb-hp" }: EmailCaptureProps) {
  const isDark = surface === "dark";

  // Turnstile (invisible if no site key is configured)
  const { token: turnstileToken, containerRef: turnstileRef, hasTurnstile } = useTurnstile(isDark ? "dark" : "light");

  const { email, setEmail, status, alreadyExists, submit } = useWaitlist({
    turnstileToken,
    honeypotId,
  });

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";
  const buttonDisabled = isLoading || (hasTurnstile && !turnstileToken);

  // ── Success states ─────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <p
        className={nunitoClass}
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.accent,
          margin: 0,
        }}
      >
        {alreadyExists
          ? "You're already on the list."
          : "You're in. We'll reach out when Crumbify launches."}
      </p>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <form
        onSubmit={submit}
        style={{
          display: "flex",
          gap: 8,
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        {/* Honeypot — must be present for useWaitlist to read it */}
        <input
          id={honeypotId}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            height: 0,
            width: 0,
            overflow: "hidden",
          }}
        />

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={nunitoClass}
          disabled={isLoading}
          style={{
            flex: "1 1 220px",
            minWidth: 0,
            height: 52,
            borderRadius: 999,
            border: isDark
              ? `1.5px solid rgba(230,195,155,0.35)`
              : `1.5px solid ${C.paperDeep}`,
            backgroundColor: isDark ? "rgba(244,236,223,0.06)" : C.paper,
            color: isDark ? C.onHero : C.ink,
            fontSize: 15,
            fontWeight: 600,
            paddingInline: 20,
            outline: "none",
            boxShadow: isDark
              ? "inset 0 1px 3px rgba(0,0,0,0.20)"
              : "inset 0 1px 3px rgba(26,18,8,0.07)",
            WebkitFontSmoothing: "antialiased",
            opacity: isLoading ? 0.6 : 1,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = C.accent;
            e.target.style.boxShadow = isDark
              ? `inset 0 1px 3px rgba(0,0,0,0.20), 0 0 0 3px rgba(230,195,155,0.20)`
              : `inset 0 1px 3px rgba(26,18,8,0.07), 0 0 0 3px rgba(230,195,155,0.18)`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = isDark
              ? "rgba(230,195,155,0.35)"
              : C.paperDeep;
            e.target.style.boxShadow = isDark
              ? "inset 0 1px 3px rgba(0,0,0,0.20)"
              : "inset 0 1px 3px rgba(26,18,8,0.07)";
          }}
        />
        <LedgeButton
          ledgeOffset={5}
          fontClassName={nunitoClass}
          variant="accent"
          onClick={undefined}
        >
          {isLoading ? (
            <span>Joining...</span>
          ) : (
            <>
              <span>Get early access</span>
              <ArrowRight size={15} weight="bold" />
            </>
          )}
        </LedgeButton>
      </form>

      {/* Turnstile widget (hidden when no site key) */}
      {hasTurnstile && <div ref={turnstileRef} style={{ display: "flex", justifyContent: "flex-start" }} />}

      {isError && (
        <p
          className={nunitoClass}
          style={{
            fontSize: 13,
            color: "#E57373",
            fontWeight: 600,
            margin: 0,
            paddingInline: 4,
          }}
        >
          Something went wrong. Please try again.
        </p>
      )}

      {!isError && (
        <p
          className={nunitoClass}
          style={{
            fontSize: 13,
            color: isDark ? C.onHeroSoft : C.muted,
            fontWeight: 600,
            margin: 0,
            paddingInline: 4,
          }}
        >
          Be first in. No spam, just the launch.
        </p>
      )}
    </div>
  );
}
