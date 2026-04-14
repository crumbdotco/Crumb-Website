"use client";
import { motion } from "framer-motion";

const steps = [
  {
    num: 1,
    title: "Sign up",
    desc: "Apple, Google, or email. No passwords to remember.",
    detail: { bold: "10 seconds", rest: " · one tap" },
  },
  {
    num: 2,
    title: "Connect",
    desc: "Link Uber Eats and Just Eat. Read-only — we never place orders.",
    detail: { bold: "Read-only", rest: " · OAuth secure" },
  },
  {
    num: 3,
    title: "Discover",
    desc: "Stats, map, personality, soulmate match, and your annual Wrapped.",
    detail: { bold: "Instant", rest: " · processed on device" },
  },
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.7, ease: EASE },
  }),
};

export function HowItWorks() {
  return (
    <section className="relative z-1 overflow-hidden bg-crumb-dark px-10 py-[60px] pb-[70px] text-crumb-cream">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_400px_at_50%_80%,rgba(230,195,155,0.06),transparent_70%)]" />

      <div className="relative z-[2] mx-auto max-w-[960px]">
        <motion.p
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          custom={0}
          className="text-center text-[11px] font-bold uppercase tracking-[3px] text-crumb-brown"
        >
          How it works
        </motion.p>

        <motion.h2
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          custom={1}
          className="mt-2.5 text-center font-display text-[clamp(26px,3.8vw,40px)] font-bold leading-tight tracking-[-2px]"
        >
          Three steps.<br />Thirty seconds.
        </motion.h2>

        <div className="mt-14 flex gap-0">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              custom={i + 2}
              className="group flex flex-1 flex-col items-center"
            >
              <div className="relative z-[2] flex h-14 w-14 items-center justify-center rounded-[14px] border border-crumb-gold/15 bg-crumb-gold/[0.08] font-display text-[22px] font-bold text-crumb-gold transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08] group-hover:-rotate-3 group-hover:bg-crumb-gold/15">
                {s.num}
              </div>
              <h3 className="mt-5 text-base font-extrabold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 max-w-[200px] text-center text-xs leading-relaxed text-crumb-brown">
                {s.desc}
              </p>
              <div className="mt-3 max-w-[180px] rounded-[10px] border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 text-center text-[11px] text-crumb-muted">
                <strong className="text-crumb-gold">{s.detail.bold}</strong>
                {s.detail.rest}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
