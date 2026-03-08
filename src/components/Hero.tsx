"use client";

import { motion } from "framer-motion";
import { PhoneMockup } from "./PhoneMockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-36">
      {/* Aurora background */}
      <div className="aurora pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px] animate-pulse-ring" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-primary-light/6 rounded-full blur-[120px] animate-pulse-ring" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[160px]" />
      </div>

      {/* Grid background */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:justify-between lg:items-center">
          <motion.div
            className="max-w-xl text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Pill badge */}
            <motion.div
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-surface/60 backdrop-blur-sm px-4 py-2 shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-medium text-muted">
                Now available on iOS & Android
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Your food,
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                your stats,
              </motion.span>
              <motion.span
                className="block gradient-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                your story.
              </motion.span>
            </h1>

            <motion.p
              className="mt-6 text-lg leading-relaxed text-muted md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Enter a new dimension of food delivery by getting unique insights
              into your ordering habits, taste profile, and more.
            </motion.p>

            {/* Download buttons */}
            <motion.div
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
              id="download"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <a
                href="#"
                className="group flex h-14 items-center gap-3 rounded-2xl bg-foreground px-6 text-background shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] leading-none opacity-70">Download on the</div>
                  <div className="text-base font-semibold leading-tight">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="group flex h-14 items-center gap-3 rounded-2xl bg-foreground px-6 text-background shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
              >
                <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor">
                  <path d="M1 1l10.2 10L1 21m13.5-5.3L3.6 21.4l10.9-6.3zm3.4-4.2c.6.4.6 1 0 1.4l-2.7 1.5-3-2.7 3-2.7 2.7 1.5zM3.6.6l10.9 5.7L11.2 11 1 1l2.6-.4z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] leading-none opacity-70">Get it on</div>
                  <div className="text-base font-semibold leading-tight">Google Play</div>
                </div>
              </a>
            </motion.div>

            <motion.p
              className="mt-6 text-xs text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Free to use &middot; Premium features available
            </motion.p>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50, rotateY: -5 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="animate-float">
              <PhoneMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
