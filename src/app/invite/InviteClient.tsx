"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Placeholder — swap for the real apps.apple.com/app/... URL once Crumb ships.
// Until then, the App Store button falls back to the TestFlight public link.
const APP_STORE_URL = "https://testflight.apple.com/join/crumb";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.crumb.app";
const REF_STORAGE_KEY = "crumb_referral_code";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function InviteClient() {
  const searchParams = useSearchParams();
  const ref = searchParams?.get("ref") ?? null;
  const [stored, setStored] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    if (ref && /^[A-Z0-9]{4,12}$/i.test(ref)) {
      try {
        localStorage.setItem(REF_STORAGE_KEY, ref.toUpperCase());
        setStored(true);
      } catch {
        // localStorage unavailable (private mode, SSR) — the app will still
        // work without the referral credit.
      }
    }
    setPlatform(detectPlatform());
  }, [ref]);

  useEffect(() => {
    // Auto-redirect mobile visitors to their store after a short delay so the
    // page has time to persist the ref code.
    if (platform === "ios" || platform === "android") {
      const target = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
      const timer = setTimeout(() => {
        window.location.href = target;
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [platform]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#E0D5C9] p-6">
      <div className="max-w-md w-full bg-white/40 backdrop-blur rounded-2xl p-8 text-center space-y-6 shadow-lg">
        <div className="inline-block px-4 py-1 rounded-full bg-[#E6C39B]/30 text-[#4A3728] text-xs font-bold tracking-wider uppercase">
          You&apos;ve been invited
        </div>

        <h1 className="text-3xl font-bold text-[#2D1810]">
          Join Crumb
        </h1>

        <p className="text-[#4A3728]/80 leading-relaxed">
          Your friend invited you to Crumb — your food delivery stats in one
          place. Install the app to claim{" "}
          <span className="font-bold">7 days of Premium</span> on them.
        </p>

        {ref && stored && (
          <div className="text-xs text-[#4A3728]/60">
            Referral <span className="font-mono font-bold">{ref.toUpperCase()}</span>{" "}
            saved — it will apply automatically when you sign up.
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <a
            href={APP_STORE_URL}
            className="w-full py-3 px-6 rounded-xl bg-[#2D1810] text-white font-bold hover:bg-[#4A3728] transition-colors"
          >
            Install on iPhone
          </a>
          <a
            href={PLAY_STORE_URL}
            className="w-full py-3 px-6 rounded-xl bg-transparent border-2 border-[#2D1810] text-[#2D1810] font-bold hover:bg-[#2D1810]/5 transition-colors"
          >
            Install on Android
          </a>
        </div>

        {platform === "other" && (
          <p className="text-xs text-[#4A3728]/50 pt-2">
            Tip: open this link on your phone for the fastest install.
          </p>
        )}
      </div>
    </main>
  );
}
