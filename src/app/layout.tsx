import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Preloader } from "@/components/ui/Preloader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crumbify.co.uk"),
  title: "Crumbify - Your Food Delivery Stats",
  description:
    "Screenshot your delivery orders and Crumbify reads them into your food stats, top restaurants, food personality, soulmate matches, groups, and a global feed. Get early access.",
  keywords: [
    "food delivery stats",
    "food stats app",
    "crumbify",
    "crumbify app",
    "restaurant tracker",
    "food personality",
    "food journal",
    "food map",
    "food friends",
    "global feed",
    "food groups",
  ],
  openGraph: {
    title: "Crumbify - Your Food Delivery Stats",
    description: "Read the crumbs.",
    url: "https://crumbify.co.uk",
    siteName: "Crumbify",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crumbify - Your Food Delivery Stats",
    description: "Read the crumbs.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Preloader />
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <SpeedInsights />
      </body>
    </html>
  );
}
