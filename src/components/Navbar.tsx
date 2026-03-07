"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-lg font-bold">Crumb</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="#premium"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Premium
          </Link>
          <Link
            href="/support"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Support
          </Link>
          <ThemeToggle />
          <a
            href="#download"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
          >
            Download
          </a>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {mobileOpen ? (
                <path d="M4 4l12 12M16 4L4 16" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            <Link
              href="#features"
              className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-light hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-light hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#premium"
              className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-light hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Premium
            </Link>
            <Link
              href="/support"
              className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-light hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Support
            </Link>
            <a
              href="#download"
              className="mt-2 rounded-full bg-primary px-5 py-2 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Download
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
