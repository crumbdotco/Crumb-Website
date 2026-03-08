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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 ${className}`}>
      <path d="M13.3 4.3L6 11.6 2.7 8.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Premium() {
  return (
    <section id="premium" className="relative py-28 md:py-36">
      <div className="section-divider mx-auto max-w-md" />

      {/* Background aurora */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary-light/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-28 md:pt-36">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            Pricing
          </motion.span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Get more with{" "}
            <span className="gradient-text">Crumb Plus</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted md:text-lg">
            Unlock the full picture of your food delivery life.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Tier */}
          <motion.div
            className="group rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-8 transition-all duration-300 card-hover"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Free
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold">$0</span>
              <span className="text-muted text-sm">/ forever</span>
            </div>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              All the essentials to explore your food stats.
            </p>

            <div className="my-8 h-px bg-border/50" />

            <ul className="space-y-4">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckIcon className="text-muted" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#download"
              className="mt-8 block rounded-xl border border-border py-3.5 text-center text-sm font-semibold transition-all hover:bg-surface-light hover:border-border active:scale-[0.98]"
            >
              Get Started
            </a>
          </motion.div>

          {/* Premium Tier */}
          <motion.div
            className="relative rounded-2xl p-8 transition-all duration-300 card-hover"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl gradient-border" />
            <div className="absolute inset-px rounded-[15px] bg-surface/90 backdrop-blur-sm" />

            {/* Popular badge */}
            <div className="absolute -top-3 left-8 z-10 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-primary/20">
              Popular
            </div>

            <div className="relative z-10">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                Crumb Plus
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold">$2.99</span>
                <span className="text-muted text-sm">/ month</span>
              </div>
              <p className="mt-4 text-sm text-muted leading-relaxed">
                The complete food delivery analytics experience.
              </p>

              <div className="my-8 h-px bg-border/50" />

              <ul className="space-y-4">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#download"
                className="mt-8 block rounded-xl bg-primary py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Crumb Plus
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
