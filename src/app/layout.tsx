import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crumbify.co.uk"),
  title: "Crumb - Your Food Delivery Stats & Wrapped",
  description:
    "Connect Uber Eats and Just Eat. See your stats, get your Wrapped, find your food soulmate. Free for iOS and Android.",
  keywords: [
    "food delivery stats",
    "uber eats wrapped",
    "just eat stats",
    "food delivery analytics",
    "crumb app",
  ],
  openGraph: {
    title: "Crumb - Your Food Delivery Stats & Wrapped",
    description: "Your food. Your stats. Your story.",
    url: "https://crumbify.co.uk",
    siteName: "Crumb",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crumb - Your Food Delivery Stats & Wrapped",
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
      <body className="antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
