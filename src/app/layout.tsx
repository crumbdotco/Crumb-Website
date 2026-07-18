import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-disp",
  axes: ["opsz"],
  weight: ["400", "500", "600", "700", "800"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crumbify.co.uk"),
  title: "Crumbify - Every bite tells a story",
  description:
    "Your city, scored by the people you trust. Post the places you eat, see what your friends are actually eating, and discover your next favourite spot on Crumbify.",
  keywords: [
    "crumbify",
    "food app",
    "restaurant recommendations",
    "food social app",
    "friends food app",
    "food discovery",
    "restaurant ratings",
    "food map",
  ],
  alternates: {
    canonical: "https://crumbify.co.uk/",
  },
  openGraph: {
    title: "Crumbify - Every bite tells a story",
    description: "Your city, scored by the people you trust.",
    url: "https://crumbify.co.uk/",
    siteName: "Crumbify",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@crumbifyco",
    title: "Crumbify - Every bite tells a story",
    description: "Your city, scored by the people you trust.",
    images: ["/images/og-image.png"],
  },
  themeColor: "#F4ECE1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable}`}>
      <body className="antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
