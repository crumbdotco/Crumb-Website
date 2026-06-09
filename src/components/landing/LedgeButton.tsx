"use client";

import React, { useRef } from "react";
import { C } from "./tokens";

interface LedgeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  /** "accent" = gold pill on dark hero | "dark" = espresso pill on cream | "outline" = outline pill */
  variant?: "accent" | "dark" | "outline";
  ledgeOffset?: number;
  fontClassName?: string;
}

// ── Ledge configs per variant ─────────────────────────────────────────────
const LEDGE_CONFIGS = {
  accent: {
    bg: `linear-gradient(180deg, #EFD2AF 0%, ${C.accent} 50%, ${C.accentDeep} 100%)`,
    color: "#1A1208",
    ledgeColor: C.accentDeep,
    shadowAlpha: "rgba(201,160,119,0.35)",
  },
  dark: {
    bg: `linear-gradient(180deg, #2C1E10 0%, #1A1208 60%, #150E06 100%)`,
    color: C.cream,
    ledgeColor: "#0D0906",
    shadowAlpha: "rgba(26,18,8,0.22)",
  },
  outline: {
    bg: `linear-gradient(180deg, ${C.cream} 0%, ${C.paper} 100%)`,
    color: C.ink,
    ledgeColor: C.paperDeep,
    shadowAlpha: "rgba(26,18,8,0.10)",
  },
} as const;

export function LedgeButton({
  children,
  onClick,
  className = "",
  variant = "accent",
  ledgeOffset = 5,
  fontClassName = "",
}: LedgeButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cfg = LEDGE_CONFIGS[variant];

  const pillStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    paddingInline: "28px",
    paddingBlock: "14px",
    minHeight: "52px",
    borderRadius: "999px",
    fontWeight: 800,
    fontSize: "15px",
    lineHeight: 1,
    cursor: "pointer",
    border: "none",
    outline: "none",
    WebkitFontSmoothing: "antialiased",
    transition: "transform 120ms cubic-bezier(0.16,1,0.3,1), box-shadow 120ms cubic-bezier(0.16,1,0.3,1)",
    boxShadow: `0 ${ledgeOffset}px 0 ${cfg.ledgeColor}, 0 2px 10px ${cfg.shadowAlpha}`,
    backgroundImage: cfg.bg,
    color: cfg.color,
  };

  function getActiveBox() {
    return `0 0px 0 ${cfg.ledgeColor}, 0 1px 3px ${cfg.shadowAlpha}`;
  }

  function getRestBox() {
    return `0 ${ledgeOffset}px 0 ${cfg.ledgeColor}, 0 2px 10px ${cfg.shadowAlpha}`;
  }

  function getHoverBox() {
    return `0 ${Math.max(ledgeOffset - 2, 1)}px 0 ${cfg.ledgeColor}, 0 1px 5px ${cfg.shadowAlpha}`;
  }

  function handleMouseDown() {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = `translateY(${ledgeOffset}px) scale(0.98)`;
    buttonRef.current.style.boxShadow = getActiveBox();
  }

  function handleMouseUp() {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = "translateY(0px) scale(1)";
    buttonRef.current.style.boxShadow = getRestBox();
  }

  function handleMouseLeave() {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = "translateY(0px) scale(1)";
    buttonRef.current.style.boxShadow = getRestBox();
  }

  function handleMouseEnter() {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = "translateY(2px) scale(1)";
    buttonRef.current.style.boxShadow = getHoverBox();
  }

  function handleFocus() {
    if (!buttonRef.current) return;
    buttonRef.current.style.outline = `3px solid ${C.accent}`;
    buttonRef.current.style.outlineOffset = "3px";
  }

  function handleBlur() {
    if (!buttonRef.current) return;
    buttonRef.current.style.outline = "none";
    buttonRef.current.style.outlineOffset = "0px";
  }

  return (
    <button
      ref={buttonRef}
      style={pillStyle}
      className={className || fontClassName}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </button>
  );
}
