"use client";
import { motion } from "framer-motion";
import { FlowingBackground } from "../shared/FlowingBackground";
import { AnimatedText } from "../shared/AnimatedText";
import { AnimatedCounter } from "../shared/AnimatedCounter";

const statCards = [
  { type: "counter" as const, value: 147, label: "orders tracked" },
  { type: "counter" as const, value: 15, label: "restaurants explored" },
  { type: "text" as const, text: "Chicken Burger", label: "your signature order" },
  { type: "donut" as const, label: "cuisine breakdown" },
  { type: "text" as const, text: "Saturday 7pm", label: "your prime ordering time" },
  { type: "counter" as const, value: 92, suffix: "%", label: "taste match with your best friend" },
];

function DonutChart() {
  const segments = [
    { pct: 35, color: "#8B7355", label: "British" },
    { pct: 25, color: "#E6C39B", label: "Italian" },
    { pct: 20, color: "#3D2B1F", label: "Indian" },
    { pct: 12, color: "#A09080", label: "Chinese" },
    { pct: 8, color: "#D4C9BC", label: "Other" },
  ];

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
        {segments.map((seg, i) => {
          const dashLength = (seg.pct / 100) * circumference;
          const currentOffset = offset;
          offset += dashLength;
          return (
            <motion.circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
              transform="rotate(-90 50 50)"
            />
          );
        })}
      </svg>
      <div className="flex flex-col gap-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[11px] text-crumb-dark/70">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsShowcase() {
  return (
    <section className="relative bg-crumb-cream py-24 md:py-32 overflow-hidden">
      <FlowingBackground />
      <div className="relative max-w-6xl mx-auto px-6">
        <AnimatedText
          text="Your food journey, visualised"
          className="text-3xl md:text-5xl lg:text-[56px] font-bold text-crumb-dark text-center mb-16"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-crumb-card rounded-2xl p-8 flex flex-col gap-3 min-h-[180px]"
            >
              {card.type === "counter" && (
                <AnimatedCounter
                  target={card.value}
                  suffix={card.suffix}
                  className="text-4xl md:text-5xl font-extrabold text-crumb-dark"
                />
              )}
              {card.type === "text" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-3xl md:text-4xl font-extrabold text-crumb-dark"
                >
                  {card.text}
                </motion.span>
              )}
              {card.type === "donut" && <DonutChart />}
              <span className="text-sm font-medium text-crumb-brown mt-auto">
                {card.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
