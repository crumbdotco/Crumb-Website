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
 * `pathPrefix: "/u/"` intent filter (trailing slash - scoped to exactly this
 * path segment, not a bare-prefix match that would also hijack /updates,
 * /user, /unsubscribe etc - fix-round r1, F53-R3).
 *
 * Server component: validates the username shape (defensive - a malformed
 * or pathological URL segment gets a plain landing rather than being fed
 * straight into a client-side deep-link attempt) and renders the client
 * island that does the actual app-open attempt + fallback.
 */

import type { Metadata } from "next";
import { ProfileShareLanding } from "@/components/profile-share/ProfileShareLanding";

// Mirrors the app repo's real username SHAPES so this page does not reject
// a link that the app itself would happily resolve (fix-round r1, F53-R4):
//   1. Claimed usernames (supabase/migrations/125_claim_username.sql,
//      017_username_search.sql): length 3-30, lowercase letters/digits/
//      underscore only.
//   2. The `handle_new_user` trigger's DEFAULT username for a profile that
//      never completed username claim (supabase/migrations/
//      014_fix_profile_trigger.sql:35, 158_contact_hash_columns.sql:208):
//      `'user-' || REPLACE(id::text, '-', '')` - 5 + 32 lowercase-hex chars,
//      always containing a hyphen, so it fails BOTH the length and charset
//      halves of the claimed-username shape above. A profile-share link
//      built from a real (if unclaimed) profile's default handle must not
//      render "Profile not found" here when the app-side resolver (which
//      has no such filter - see app repo's resolve-username.ts /
//      resolve_referral_code RPC) would resolve it fine.
// When in doubt this pattern accepts broadly and lets resolution 404
// downstream (this page never queries Supabase directly - only the
// installed app resolves usernames - so a broader accept here has no
// enumeration/security cost, just a marginally later "not found").
const USERNAME_PATTERN = /^([a-z0-9_]{3,30}|user-[0-9a-f]{32})$/;

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
