"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative flex h-8 w-14 items-center rounded-full bg-surface border border-border transition-colors hover:border-primary/30"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Sun icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute left-1.5 text-yellow-400"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>

      {/* Moon icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute right-1.5 text-blue-300"
      >
        <path d="M12 3a6 6 0 009 9 9 9 0 11-9-9z" />
      </svg>

      {/* Toggle dot */}
      <span
        className={`absolute h-5 w-5 rounded-full bg-foreground shadow-sm transition-transform duration-200 ${
          theme === "dark" ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}
