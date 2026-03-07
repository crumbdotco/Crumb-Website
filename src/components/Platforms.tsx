"use client";

import { motion } from "framer-motion";

export function Platforms() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Connect your favourite platforms
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted md:text-lg">
            We support the biggest food delivery platforms in the UK, with more
            coming soon.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 flex flex-col items-center justify-center gap-8 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Uber Eats */}
          <div className="flex h-32 w-64 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface transition-all hover:border-uber-eats/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-uber-eats">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <span className="text-lg font-bold">Uber Eats</span>
          </div>

          {/* Just Eat */}
          <div className="flex h-32 w-64 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface transition-all hover:border-just-eat/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-just-eat">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18 3H6C4.34 3 3 4.34 3 6v12c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3zm-3 14H9v-2h6v2zm3-4H6V7h12v6z" />
              </svg>
            </div>
            <span className="text-lg font-bold">Just Eat</span>
          </div>

          {/* Coming Soon */}
          <div className="flex h-32 w-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/20">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span className="text-lg font-bold text-muted">More soon</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
