"use client";
import { motion } from "framer-motion";

const discoveries = [
  {
    emoji: "📦",
    stat: "147",
    label: "total orders",
    sub: "That's one every 2.5 days",
  },
  {
    emoji: "🗺️",
    stat: "15",
    label: "restaurants mapped",
    sub: "See everywhere you've been",
  },
  {
    emoji: "⭐",
    stat: "8.5",
    label: "average score",
    sub: "Rate every restaurant your way",
  },
  {
    emoji: "✨",
    stat: "Main Character",
    label: "your food personality",
    sub: "Your food personality revealed",
  },
  {
    emoji: "💛",
    stat: "92%",
    label: "taste match",
    sub: "Find your food soulmate",
  },
  {
    emoji: "🏆",
    stat: "12",
    label: "achievements unlocked",
    sub: "Earn badges as you eat",
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
