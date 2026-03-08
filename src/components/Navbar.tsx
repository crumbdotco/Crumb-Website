"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl transition-all duration-500 rounded-2xl ${
        scrolled
          ? "bg-background/70 backdrop-blur-2xl shadow-lg shadow-primary/5 border border-border/60"
          : "bg-transparent"
      }`}
    >
      <div className="flex h-14 items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 transition-transform group-hover:scale-110">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-lg font-bold tracking-tight">Crumb</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {[
            { href: "#features", label: "Features" },
            { href: "#how-it-works", label: "How It Works" },
            { href: "#premium", label: "Premium" },
            { href: "/support", label: "Support" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-sm text-muted transition-colors hover:text-foreground rounded-lg hover:bg-surface/80"
            >
              {link.label}
            </Link>
          ))}

          <div className="mx-2 h-5 w-px bg-border" />
          <ThemeToggle />
          <a
            href="#download"
            className="ml-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
          >
            Download
          </a>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-surface transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="transition-transform"
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
        <div className="border-t border-border/30 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How It Works" },
              { href: "#premium", label: "Premium" },
              { href: "/support", label: "Support" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-surface hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="#download"
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-primary/20"
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
