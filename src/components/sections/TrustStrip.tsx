"use client";
import { motion } from "framer-motion";

const badges = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="mx-auto block h-[22px] w-[22px] stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    label: "On device",
    desc: "Data stays local",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="mx-auto block h-[22px] w-[22px] stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    label: "Read-only",
    desc: "We can't order",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="mx-auto block h-[22px] w-[22px] stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    label: "Encrypted",
    desc: "End-to-end",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="mx-auto block h-[22px] w-[22px] stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    label: "No passwords",
    desc: "OAuth only",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="mx-auto block h-[22px] w-[22px] stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    label: "UK built",
    desc: "By students",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="mx-auto block h-[22px] w-[22px] stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    label: "Transparent",
    desc: "Open policies",
  },
];

export function TrustStrip() {
  return (
    <section className="relative z-1 px-5 py-10 md:px-10 md:py-[50px]">
      <div className="relative z-[2] mx-auto max-w-[960px]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center font-display text-[22px] font-bold tracking-[-1px]"
        >
          Built for trust
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 grid grid-cols-3 overflow-hidden rounded-[18px] border border-crumb-dark/[0.06] bg-white/40 backdrop-blur-[4px] md:grid-cols-6"
        >
          {badges.map((b, i) => (
            <div
              key={b.label}
              className="group border-r border-b border-crumb-dark/5 px-3 py-5 text-center transition-colors duration-150 last:border-r-0 hover:bg-white/30 md:border-b-0"
            >
              <div className="mb-1.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.12]">
                {b.icon}
              </div>
              <div className="text-xs font-bold tracking-tight">{b.label}</div>
              <div className="mt-0.5 text-[10px] text-crumb-brown">{b.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
