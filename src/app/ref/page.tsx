import { Suspense } from "react";
import type { Metadata } from "next";
import { RefClient } from "./RefClient";

export const metadata: Metadata = {
  title: "Join Crumbify",
  description:
    "Crumbify turns your takeaway history into your food stats: top spots, cuisines, your food personality, and a yearly Wrapped.",
  openGraph: {
    title: "Join Crumbify",
    description: "Your friend invited you to Crumbify.",
    url: "https://crumbify.co.uk/ref",
    siteName: "Crumbify",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
};

export default function RefPage() {
  return (
    <Suspense fallback={null}>
      <RefClient />
    </Suspense>
  );
}
