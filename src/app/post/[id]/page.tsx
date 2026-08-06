/**
 * src/app/post/[id]/page.tsx
 *
 * Pixel-fix F-53b (app repo, owner directive 2026-08-06, EXECUTION.md
 * wave-3 item 7b): marketing-site landing target for the post-share
 * universal link `https://crumbify.co.uk/post/<id>` (built by the app's
 * utils/post-share-link.ts's buildPostShareLink for a photo-bearing post,
 * shared from app/(tabs)/index.tsx's Home feed overflow Share/Copy Link
 * actions and app/review/[id].tsx's own Share action - buildPostShareLink is
 * photo-aware regardless of which route calls it). This page is what a
 * recipient WITHOUT the app installed sees - the app-side route
 * (app/post/[id].tsx in the app repo) handles the installed case via the
 * iOS `applinks:crumbify.co.uk` associated domain and the Android
 * `pathPrefix: "/post/"` intent filter (trailing slash - scoped exactly to
 * this path segment, mirroring /u/[username]/page.tsx's F53-R3 pattern).
 *
 * Server component: validates the id shape (a post UUID - the app repo's
 * services/social/post-detail.ts's UUID_RE) and renders the shared
 * AppShareLanding client island, mirroring /u/[username]/page.tsx's shape
 * exactly (this page never queries Supabase directly - only the installed
 * app resolves posts).
 */

import type { Metadata } from "next";
import { AppShareLanding } from "@/components/share-landing/AppShareLanding";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const title = UUID_PATTERN.test(id) ? "A post on Crumbify" : "Crumbify post";
  return {
    title,
    description: "Every bite tells a story. See this post on Crumbify.",
    alternates: { canonical: `https://crumbify.co.uk/post/${encodeURIComponent(id)}` },
  };
}

export default async function PostSharePage({ params }: PageProps) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4ECE1] px-6 py-16 text-center text-[#1A1208]">
        <h1 className="mb-4 text-2xl font-semibold">Post not found</h1>
        <p className="max-w-sm text-base text-[#4a3f33]">
          This Crumbify post link looks broken. Check the link and try again.
        </p>
      </div>
    );
  }

  return (
    <AppShareLanding
      pathSegment="post"
      id={id}
      kicker="Crumbify post"
      heading="A post on Crumbify"
      description="Get the Crumbify app to see this post and explore what your friends are eating."
    />
  );
}
