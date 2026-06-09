import { Fredoka, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { BackLink } from "./BackLink";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-fredoka-legal",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Arial", "sans-serif"],
  preload: false,
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-nunito-legal",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Arial", "sans-serif"],
  preload: false,
});

interface LegalShellProps {
  title: string;
  updated?: string;
  children: ReactNode;
}

export function LegalShell({ title, updated, children }: LegalShellProps) {
  return (
    <main
      className={`${fredoka.variable} ${nunito.variable}`}
      style={{
        background: "#1A1208",
        minHeight: "100vh",
        fontFamily: "var(--font-nunito-legal), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 120,
          paddingBottom: 96,
        }}
      >
        <BackLink />

        <h1
          style={{
            marginTop: 24,
            fontSize: 36,
            fontWeight: 600,
            color: "#F4ECDF",
            lineHeight: 1.2,
            fontFamily: "var(--font-fredoka-legal), -apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: 0,
          }}
        >
          {title}
        </h1>

        {updated && (
          <p
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "#9B8272",
              fontFamily: "var(--font-nunito-legal), sans-serif",
            }}
          >
            Last updated: {updated}
          </p>
        )}

        <div
          style={{
            marginTop: 40,
            color: "#C4B09A",
            fontSize: 16,
            lineHeight: 1.65,
            fontFamily: "var(--font-nunito-legal), -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
