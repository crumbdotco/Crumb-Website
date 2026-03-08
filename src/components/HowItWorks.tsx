"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect your accounts",
    description:
      "Link your Uber Eats, Just Eat, or other delivery accounts securely using OAuth. We never see your password.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "We crunch the numbers",
    description:
      "Crumb analyses your order history to build your taste profile, top restaurants, cuisine preferences, and more.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Explore your stats",
    description:
      "Dive into beautiful charts, heatmaps, and insights. Compare with friends, get your Wrapped, and discover your food personality.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 md:py-36">
      <div className="section-divider mx-auto max-w-md" />
      <div className="dot-pattern pointer-events-none absolute inset-0 opacity-40" />

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
            How It Works
          </motion.span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Get started in seconds
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted md:text-lg">
            Getting started takes less than a minute.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {/* Connecting line between steps */}
              {i < steps.length - 1 && (
                <div className="absolute top-10 left-full hidden w-full md:block z-10">
                  <motion.div
                    className="h-px w-full"
                    style={{
                      background: "linear-gradient(90deg, var(--color-primary), transparent)",
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.2 }}
                    />
                </div>
              )}

              <div className="group rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm p-8 transition-all duration-300 hover:bg-surface hover:border-primary/20 card-hover">
                {/* Step number + icon */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
                    {step.icon}
                  </div>
                  <span className="text-5xl font-extrabold text-primary/10 group-hover:text-primary/20 transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
