/**
 * src/app/u/[username]/page.tsx
 *
 * Pixel-fix F-53 (app repo, docs/v0.9.3/PIXEL-PASS-FINDINGS.md:1414-1442):
 * marketing-site landing target for the profile-share universal link
 * `https://crumbify.co.uk/u/<username>` (built by the app's
 * utils/profile-share-link.ts, shared from app/profile/[id].tsx's "Share
 * profile" button / dots-sheet Share entry). This page is what a recipient
 * WITHOUT the app installed sees - the app-side route
 * (app/u/[username].tsx in the app repo) handles the installed case via the
 * iOS `applinks:crumbify.co.uk` associated domain and the Android
 * `pathPrefix: "/u"` intent filter.
 *
 * Server component: validates the username shape (defensive - a malformed
 * or pathological URL segment gets a plain landing rather than being fed
 * straight into a client-side deep-link attempt) and renders the client
 * island that does the actual app-open attempt + fallback.
 */

import type { Metadata } from "next";
import { ProfileShareLanding } from "@/components/profile-share/ProfileShareLanding";

// Mirrors the app repo's server-side username format contract
// (supabase/migrations/125_claim_username.sql: length 3-30, lowercase
// letters/digits/underscore only) so this page never attempts a deep link
// with a value that could not possibly be a real Crumbify username.
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const title = USERNAME_PATTERN.test(username)
    ? `@${username} on Crumbify`
    : "Crumbify profile";
  return {
    title,
    description: "Every bite tells a story. See this profile on Crumbify.",
    alternates: { canonical: `https://crumbify.co.uk/u/${encodeURIComponent(username)}` },
  };
}

export default async function ProfileSharePage({ params }: PageProps) {
  const { username } = await params;

  if (!USERNAME_PATTERN.test(username)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4ECE1] px-6 py-16 text-center text-[#1A1208]">
        <h1 className="mb-4 text-2xl font-semibold">Profile not found</h1>
        <p className="max-w-sm text-base text-[#4a3f33]">
          This Crumbify profile link looks broken. Check the link and try
          again.
        </p>
      </div>
    );
  }

  return <ProfileShareLanding username={username} />;
}
