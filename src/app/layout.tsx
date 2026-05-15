import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Preloader } from "@/components/ui/Preloader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crumbify.co.uk"),
  title: "Crumbify — Your Food Delivery Stats",
  description:
    "Screenshot your order history from any delivery app. See your stats, top restaurants, food personality, soulmates, and annual Wrapped. Join the waitlist.",
  keywords: [
    "food delivery stats",
    "food stats app",
    "food wrapped",
    "crumbify",
    "crumbify app",
    "restaurant tracker",
    "food personality",
    "food journal",
    "food map",
    "food friends",
  ],
  openGraph: {
    title: "Crumbify — Your Food Delivery Stats",
    description: "Read the crumbs.",
    url: "https://crumbify.co.uk",
    siteName: "Crumbify",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crumbify — Your Food Delivery Stats",
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
          <CustomCursor />
          {children}
        </SmoothScroll>
        <SpeedInsights />
      </body>
    </html>
  );
}
