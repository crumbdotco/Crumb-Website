"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Fredoka, Nunito } from "next/font/google";
import { LedgeButton } from "@/components/landing/LedgeButton";

// ── Store constants ────────────────────────────────────────────────────────────
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.crumbify.app";
// SWAP-SLOT: replace with the live apps.apple.com URL once the App Store listing exists.
// Do NOT hardcode a guessed ID. iOS shows a "coming soon to iPhone" state until then.
const APP_STORE_URL: string | null = null;
const APP_SCHEME = "crumbify://";

// ── Username validation ────────────────────────────────────────────────────────
// Using the stricter app inbound charset: ^[A-Za-z0-9-]{3,32}$
// This matches _layout.tsx:720-736 which validates usernames with this regex.
// Underscores are excluded because the app inbound handler uses this stricter set.
// Comment: if the app ever widens to include underscores, update this regex to ^[A-Za-z0-9_-]{3,32}$
const USERNAME_RE = /^[A-Za-z0-9-]{3,32}$/;

function validateUsername(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!USERNAME_RE.test(trimmed)) return null;
  return trimmed;
}

// ── Platform detection ─────────────────────────────────────────────────────────
type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent ?? "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

// ── Fonts ──────────────────────────────────────────────────────────────────────
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

// ── Component ──────────────────────────────────────────────────────────────────
export function RefClient() {
  const searchParams = useSearchParams();
  const rawU = searchParams?.get("u") ?? null;
  const username = validateUsername(rawU);

  const [platform, setPlatform] = useState<Platform>("desktop");
  const [deepLinkFired, setDeepLinkFired] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  useEffect(() => {
    // Only fire the deep link on mobile with a valid username.
    // Desktop visitors never auto-redirect.
    if (platform === "desktop" || !username || deepLinkFired) return;

    setDeepLinkFired(true);

    // Attempt to open the installed app via the custom scheme.
    const deepLink = `${APP_SCHEME}ref?u=${encodeURIComponent(username)}`;
    try {
      window.location.href = deepLink;
    } catch {
      // Ignore scheme-open failures in private mode or unsupported environments.
    }

    // After ~1200ms, if the app did not intercept, fall back to the store.
    // iOS: no live App Store URL yet - show the coming-soon state (no redirect).
    // Android: redirect to Play Store.
    const fallbackTimer = setTimeout(() => {
      if (platform === "android") {
        window.location.href = PLAY_STORE_URL;
      }
      // iOS: no redirect - page stays visible with the coming-soon state.
    }, 1200);

    return () => clearTimeout(fallbackTimer);
  }, [platform, username, deepLinkFired]);

  const isDesktop = platform === "desktop";
  const isIos = platform === "ios";

  return (
    <main
      style={{ backgroundColor: "#1A1208", minHeight: "100vh" }}
      className={`flex items-center justify-center p-6 ${nunito.className}`}
    >
      {/* Subtle dark grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "440px",
          width: "100%",
          backgroundColor: "#241712",
          borderRadius: "24px",
          padding: "40px 36px",
          textAlign: "center",
          boxShadow:
            "0 4px 8px rgba(0,0,0,0.30), 0 16px 40px rgba(0,0,0,0.35), 0 48px 80px rgba(0,0,0,0.25)",
        }}
      >
        {/* Crumbify wordmark */}
        <div
          className={fredoka.className}
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#E6C39B",
            marginBottom: "28px",
            letterSpacing: "-0.02em",
          }}
        >
          Crumbify
        </div>

        {/* Eyebrow - only when there is a valid referrer */}
        {username && (
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#C4B09A",
              marginBottom: "10px",
            }}
          >
            Your friend invited you
          </p>
        )}

        {/* Main heading */}
        <h1
          className={fredoka.className}
          style={{
            fontSize: "clamp(28px, 7vw, 38px)",
            fontWeight: 700,
            color: "#F4ECDF",
            lineHeight: 1.15,
            marginBottom: "20px",
            letterSpacing: "-0.02em",
          }}
        >
          {username ? `Join ${username} on Crumbify` : "Join Crumbify"}
        </h1>

        {/* Body copy */}
        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.65,
            color: "#C4B09A",
            marginBottom: "24px",
          }}
        >
          Crumbify turns your takeaway history into your food stats: top spots,
          cuisines, your food personality, and a yearly Wrapped.
          {username
            ? ` Install the app to find ${username} and start yours.`
            : " Install the app and start yours."}
        </p>

        {/* Personalised note - only when there is a valid referrer */}
        {username && (
          <p
            style={{
              fontSize: "13px",
              color: "#E6C39B",
              backgroundColor: "#2E1E14",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "28px",
            }}
          >
            We will help you find {username} as soon as you sign in.
          </p>
        )}

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: username ? "0" : "0",
          }}
        >
          {/* Android CTA */}
          <LedgeButton
            variant="accent"
            onClick={() => {
              window.location.href = PLAY_STORE_URL;
            }}
          >
            Get it on Android
          </LedgeButton>

          {/* iOS CTA - coming soon state (SWAP-SLOT: replace with App Store link when live) */}
          {isIos || isDesktop ? (
            <div
              style={{
                padding: "14px 28px",
                borderRadius: "999px",
                border: "1.5px solid #2E1E14",
                color: "#9B8272",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "default",
              }}
            >
              Coming soon to iPhone
            </div>
          ) : null}
        </div>

        {/* Desktop hint */}
        {isDesktop && (
          <p
            style={{
              fontSize: "13px",
              color: "#9B8272",
              marginTop: "20px",
            }}
          >
            Open this link on your phone for the fastest install.
          </p>
        )}
      </div>
    </main>
  );
}
