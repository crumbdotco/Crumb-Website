import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crumbify.co.uk"),
  title: "Crumb - Your Food Delivery Stats in One Place",
  description:
    "Connect Uber Eats and Just Eat. See your stats, review restaurants, explore your food map, find your food soulmate, and get your annual Wrapped. Free for iOS and Android.",
  keywords: [
    "food delivery stats",
    "uber eats wrapped",
    "just eat stats",
    "food delivery analytics",
    "crumb app",
    "restaurant reviews",
    "food map",
    "food personality",
    "food journal",
    "achievement badges",
    "food friends",
    "restaurant ratings",
  ],
  openGraph: {
    title: "Crumb - Your Food Delivery Stats in One Place",
    description: "Your food. Your stats. Your story.",
    url: "https://crumbify.co.uk",
    siteName: "Crumb",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crumb - Your Food Delivery Stats in One Place",
    description: "Your food. Your stats. Your story.",
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
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased grain`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
