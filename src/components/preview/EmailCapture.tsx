"use client";

import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { LedgeButton } from "./LedgeButton";
import { C } from "./tokens";

interface EmailCaptureProps {
  nunitoClass: string;
  /** "dark" = input on dark hero | "light" = input on cream section */
  surface?: "dark" | "light";
}

export function EmailCapture({ nunitoClass, surface = "dark" }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isDark = surface === "dark";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  }

  if (submitted) {
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
        You're in. We'll reach out when Crumbify launches.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 8,
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={nunitoClass}
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
        <LedgeButton ledgeOffset={5} fontClassName={nunitoClass} variant="accent">
          <span>Get early access</span>
          <ArrowRight size={15} weight="bold" />
        </LedgeButton>
      </form>
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
    </div>
  );
}
