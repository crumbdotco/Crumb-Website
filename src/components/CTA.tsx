"use client";

import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-surface p-12 text-center md:p-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/15 rounded-full blur-[100px]" />

          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Ready to discover your
              <br />
              <span className="gradient-text">food story?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-muted md:text-lg">
              Join thousands of food lovers who are already tracking their
              delivery habits with Crumb.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#download"
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
                href="#download"
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
