"use client";

import { motion } from "framer-motion";
import { PhoneMockup } from "./PhoneMockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-16 md:flex-row md:justify-between">
          <motion.div
            className="max-w-xl text-center md:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-muted">
                Now available on iOS & Android
              </span>
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              Your food,
              <br />
              your stats,
              <br />
              <span className="gradient-text">your story.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted md:text-xl">
              Enter a new dimension of food delivery by getting unique insights
              into your ordering habits, taste profile, and more.
            </p>

            <div
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:items-start"
              id="download"
            >
              <a
                href="#"
                className="flex h-14 items-center gap-3 rounded-xl bg-foreground px-6 text-background transition-transform hover:scale-105"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] leading-none">Download on the</div>
                  <div className="text-base font-semibold leading-tight">
                    App Store
                  </div>
                </div>
              </a>
              <a
                href="#"
                className="flex h-14 items-center gap-3 rounded-xl bg-foreground px-6 text-background transition-transform hover:scale-105"
              >
                <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor">
                  <path d="M1 1l10.2 10L1 21m13.5-5.3L3.6 21.4l10.9-6.3zm3.4-4.2c.6.4.6 1 0 1.4l-2.7 1.5-3-2.7 3-2.7 2.7 1.5zM3.6.6l10.9 5.7L11.2 11 1 1l2.6-.4z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] leading-none">Get it on</div>
                  <div className="text-base font-semibold leading-tight">
                    Google Play
                  </div>
                </div>
              </a>
            </div>

            <p className="mt-6 text-xs text-muted">
              Free to use. Premium features available.
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
