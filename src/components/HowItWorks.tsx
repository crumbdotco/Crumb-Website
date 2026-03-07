"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect your accounts",
    description:
      "Link your Uber Eats, Just Eat, or other delivery accounts securely using OAuth. We never see your password.",
  },
  {
    number: "02",
    title: "We crunch the numbers",
    description:
      "Crumb analyses your order history to build your taste profile, top restaurants, cuisine preferences, and more.",
  },
  {
    number: "03",
    title: "Explore your stats",
    description:
      "Dive into beautiful charts, heatmaps, and insights. Compare with friends, get your Wrapped, and discover your food personality.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted md:text-lg">
            Getting started takes less than a minute.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {i < steps.length - 1 && (
                <div className="absolute top-8 left-full hidden w-full md:block">
                  <div className="h-px w-full bg-gradient-to-r from-border to-transparent" />
                </div>
              )}
              <div className="rounded-2xl border border-border bg-surface p-8">
                <span className="text-4xl font-extrabold text-primary/20">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
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
