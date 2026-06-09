import type { CSSProperties } from "react";

// ─── Design tokens — shared across all /preview components ──────────────────

// Hero palette: "Black and Tan" — deep cocoa dominant, warm cream type, single saturated accent
export const C = {
  // ── Hero / dark surfaces ──────────────────────────────────────────────────
  heroDeep:   "#1A1208",  // dominant hero bg: rich espresso-cocoa
  heroDark:   "#241712",  // slightly lighter for card overlays on dark
  heroPanel:  "#2E1E14",  // elevated panels on dark bg

  // ── Light surfaces (non-hero sections) ───────────────────────────────────
  cream:      "#F4ECDF",  // warm cream (kept lighter for non-hero sections)
  paper:      "#EFE6D8",
  paperDeep:  "#D8CBBC",

  // ── Typography ────────────────────────────────────────────────────────────
  ink:        "#1A1208",  // main text on light
  inkSoft:    "#5C4232",  // secondary on light
  muted:      "#9B8272",  // tertiary on light
  onHero:     "#F4ECDF",  // primary text on dark hero
  onHeroSoft: "#C4B09A",  // secondary text on dark hero

  // ── Single locked accent ─────────────────────────────────────────────────
  // Original Crumbify brand gold. Used for ONE thing at a time.
  accent:     "#E6C39B",  // primary accent — CTA ledge, headline period, icon tint
  accentDeep: "#C9A077",  // ledge/shadow of accent button

  // ── Legacy aliases (used by sections below hero, kept stable) ─────────────
  gold:       "#E6C39B",
  goldDeep:   "#C9A678",
  brown:      "#8B7355",
  cocoa:      "#3E2723",
  mutedOnDark:"#CDBFAE",
} as const;

// Warm cocoa-tinted multi-layer shadow system
export const warmShadow =
  "0 1px 2px rgba(26,18,8,0.08), 0 4px 12px rgba(26,18,8,0.10), 0 12px 28px rgba(26,18,8,0.07)";

export const warmShadowDeep =
  "0 2px 4px rgba(26,18,8,0.14), 0 12px 32px rgba(26,18,8,0.22), 0 40px 80px rgba(26,18,8,0.18)";

// Hero-specific shadow (slightly lighter tint for dark bg)
export const heroPhoneShadow =
  "0 4px 8px rgba(0,0,0,0.30), 0 16px 40px rgba(0,0,0,0.35), 0 48px 80px rgba(0,0,0,0.25)";

// Paper grain texture (inline SVG feTurbulence, very subtle)
export const PAPER_GRAIN_STYLE: CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "200px 200px",
};
