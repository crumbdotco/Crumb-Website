import type { Metadata } from "next";
import { Inter, Fraunces, Instrument_Serif } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Preloader } from "@/components/ui/Preloader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-accent",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crumbify.co.uk"),
  title: "Crumb - Your Food Delivery Stats in One Place",
  description:
    "Screenshot your order history from any delivery app. See your stats, top restaurants, food personality, soulmates, and annual Wrapped. Free for iOS and Android.",
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
      <body className={`${inter.variable} ${fraunces.variable} ${instrumentSerif.variable} antialiased`}>
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
