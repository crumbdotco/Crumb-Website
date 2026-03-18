"use client";
import { motion } from "framer-motion";

const discoveries = [
  {
    emoji: "📦",
    stat: "147",
    label: "total orders this year",
    sub: "That's one every 2.5 days",
  },
  {
    emoji: "\uD83C\uDFC6",
    stat: "Nando\u2019s",
    label: "your most ordered restaurant",
    sub: "21 orders and counting",
  },
  {
    emoji: "\uD83D\uDD50",
    stat: "Saturday 7pm",
    label: "your peak ordering time",
    sub: "Every. Single. Week.",
  },
  {
    emoji: "✨",
    stat: "Main Character",
    label: "your food personality",
    sub: "You order like the protagonist",
  },
  {
    emoji: "\uD83D\uDC9B",
    stat: "92%",
    label: "taste match with your best friend",
    sub: "Food soulmates confirmed",
  },
  {
    emoji: "\uD83C\uDF71",
    stat: "Indian",
    label: "your most loved cuisine",
    sub: "Butter chicken every time",
  },
];

export function WhatYoullDiscover() {
  return (
    <section className="relative bg-crumb-cream py-20 md:py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-crumb-muted mb-3"
          >
            What you&apos;ll discover
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-crumb-dark"
          >
            Your food life, finally in numbers
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {discoveries.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-crumb-card rounded-2xl p-7 flex flex-col gap-2 hover:scale-[1.01] transition-transform"
            >
              <span className="text-3xl">{d.emoji}</span>
              <span className="text-3xl md:text-4xl font-extrabold text-crumb-dark leading-tight">
                {d.stat}
              </span>
              <span className="text-sm font-medium text-crumb-brown">
                {d.label}
              </span>
              <span className="text-xs text-crumb-muted mt-auto pt-1">
                {d.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
