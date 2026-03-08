"use client";

import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="aurora noise relative overflow-hidden rounded-3xl border border-primary/20 p-12 text-center md:p-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Multi-layered glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/12 rounded-full blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 w-[300px] h-[200px] bg-primary-light/8 rounded-full blur-[80px]" />

          {/* Grid overlay */}
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
            </motion.div>

            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Ready to discover your
              <br />
              <span className="gradient-text">food story?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-muted md:text-lg">
              Join thousands of food lovers who are already tracking their
              delivery habits with Crumb.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#download"
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
                href="#download"
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
            </div>

            <p className="mt-8 text-xs text-muted">
              No credit card required &middot; Free forever &middot; Premium optional
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
