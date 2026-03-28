"use client";
import { motion } from "framer-motion";

const discoveries = [
  {
    emoji: "📦",
    stat: "147",
    label: "total orders",
    sub: "That's one every 2.5 days",
    featured: true,
  },
  {
    emoji: "🗺️",
    stat: "15",
    label: "restaurants mapped",
    sub: "See everywhere you've been",
    featured: false,
  },
  {
    emoji: "⭐",
    stat: "8.5",
    label: "average score",
    sub: "Rate every restaurant your way",
    featured: false,
  },
  {
    emoji: "✨",
    stat: "Main Character",
    label: "your food personality",
    sub: "Your food personality revealed",
    featured: false,
  },
  {
    emoji: "💛",
    stat: "92%",
    label: "taste match",
    sub: "Find your food soulmate",
    featured: false,
  },
  {
    emoji: "🏆",
    stat: "12",
    label: "achievements unlocked",
    sub: "Earn badges as you eat",
    featured: false,
  },
];

const hoverShadow = "0 16px 48px rgba(61,43,31,0.14), 0 2px 8px rgba(61,43,31,0.08)";
const defaultShadow = "0 1px 3px rgba(61,43,31,0.06)";

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

        {/* Bento grid — featured first card spans 2 cols on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {discoveries.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{
                y: -4,
                boxShadow: hoverShadow,
                transition: { type: "spring", stiffness: 320, damping: 22 },
              }}
              className={[
                "bg-crumb-card rounded-2xl flex flex-col gap-2 card-warm-border cursor-default",
                d.featured ? "lg:col-span-1 lg:row-span-2 p-8 md:p-10" : "p-7",
              ].join(" ")}
              style={{ boxShadow: defaultShadow }}
            >
              <span className={d.featured ? "text-4xl mb-1" : "text-3xl"}>
                {d.emoji}
              </span>

              {/* Stat value — shimmer effect on scroll entry */}
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 + 0.2 }}
                className={[
                  "font-extrabold text-crumb-dark leading-tight",
                  d.featured ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl",
                ].join(" ")}
              >
                {d.stat}
              </motion.span>

              <span className={[
                "font-medium text-crumb-brown",
                d.featured ? "text-base" : "text-sm",
              ].join(" ")}>
                {d.label}
              </span>

              <span className={[
                "text-crumb-muted mt-auto pt-1",
                d.featured ? "text-sm" : "text-xs",
              ].join(" ")}>
                {d.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
