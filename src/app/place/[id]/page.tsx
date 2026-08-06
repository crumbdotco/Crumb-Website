/**
 * src/app/place/[id]/page.tsx
 *
 * Pixel-fix F-53b (app repo, owner directive 2026-08-06, EXECUTION.md
 * wave-3 item 7b "sweep every outward share emission"): marketing-site
 * landing target for the place-share universal link
 * `https://crumbify.co.uk/place/<id>` (built by the app's
 * services/deeplinks/link-builder.ts's buildPlaceDeepLink, shared from
 * components/restaurant-detail/PlaceShareSheet.tsx's Copy Link and native
 * "More" share actions). This page is what a recipient WITHOUT the app
 * installed sees - the app-side manual `Linking.addEventListener` listener
 * in app/_layout.tsx (NOT an expo-router file route - see the app repo's
 * link-builder.ts header for why) handles the installed case via the iOS
 * `applinks:crumbify.co.uk` associated domain and the Android
 * `pathPrefix: "/place/"` intent filter (trailing slash - scoped exactly to
 * this path segment, mirroring /u/[username]/page.tsx's F53-R3 pattern).
 *
 * Server component: validates the id shape (a Google Places place_id - the
 * app repo's services/deeplinks/parse-place-id.ts's PLACE_ID_PATTERN) and
 * renders the shared AppShareLanding client island, mirroring
 * /u/[username]/page.tsx's shape exactly (this page never queries Supabase
 * or the Google Places API directly - only the installed app resolves
 * places).
 */

import type { Metadata } from "next";
import { AppShareLanding } from "@/components/share-landing/AppShareLanding";

// Mirrors the app repo's services/deeplinks/parse-place-id.ts's
// PLACE_ID_PATTERN exactly (Google Places place_id values are
// base64url-ish: letters, digits, '_', '-', capped generously at 300 chars).
const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{1,300}$/;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const title = PLACE_ID_PATTERN.test(id) ? "A place on Crumbify" : "Crumbify place";
  return {
    title,
    description: "Every bite tells a story. See this place on Crumbify.",
    alternates: { canonical: `https://crumbify.co.uk/place/${encodeURIComponent(id)}` },
  };
}

export default async function PlaceSharePage({ params }: PageProps) {
  const { id } = await params;

  if (!PLACE_ID_PATTERN.test(id)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4ECE1] px-6 py-16 text-center text-[#1A1208]">
        <h1 className="mb-4 text-2xl font-semibold">Place not found</h1>
        <p className="max-w-sm text-base text-[#4a3f33]">
          This Crumbify place link looks broken. Check the link and try again.
        </p>
      </div>
    );
  }

  return (
    <AppShareLanding
      pathSegment="place"
      id={id}
      kicker="Crumbify place"
      heading="A place on Crumbify"
      description="Get the Crumbify app to see this place and explore what your friends are eating."
    />
  );
}
