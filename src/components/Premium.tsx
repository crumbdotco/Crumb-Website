"use client";

import { motion } from "framer-motion";

const freeFeatures = [
  "Order history overview",
  "Top restaurants & items",
  "Cuisine breakdown",
  "Ordering heatmap",
  "Food personality type",
  "Basic social features",
];

const premiumFeatures = [
  "Everything in Free",
  "Spending analytics & breakdown",
  "Drink stats & tracking",
  "Percentile rankings",
  "Advanced friend comparisons",
  "Ad-free experience",
  "Early access to new features",
];

export function Premium() {
  return (
    <section id="premium" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Get more with{" "}
            <span className="gradient-text">Crumb Plus</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted md:text-lg">
            Unlock the full picture of your food delivery life.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Free */}
          <motion.div
            className="rounded-2xl border border-border bg-surface p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Free
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-muted">/ forever</span>
            </div>
            <p className="mt-4 text-sm text-muted">
              All the essentials to explore your food stats.
            </p>
            <ul className="mt-8 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 text-muted"
                  >
                    <path
                      d="M13.3 4.3L6 11.6 2.7 8.3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#download"
              className="mt-8 block rounded-xl border border-border py-3 text-center text-sm font-semibold transition-colors hover:bg-surface-light"
            >
              Get Started
            </a>
          </motion.div>

          {/* Premium */}
          <motion.div
            className="relative rounded-2xl border border-primary/40 bg-surface p-8 glow"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              Popular
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Crumb Plus
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">$2.99</span>
              <span className="text-muted">/ month</span>
            </div>
            <p className="mt-4 text-sm text-muted">
              The complete food delivery analytics experience.
            </p>
            <ul className="mt-8 space-y-3">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 text-primary"
                  >
                    <path
                      d="M13.3 4.3L6 11.6 2.7 8.3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#download"
              className="mt-8 block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Get Crumb Plus
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
