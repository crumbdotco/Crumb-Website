"use client";
import { motion } from "framer-motion";
import { Smartphone, BarChart3, Share2 } from "lucide-react";
import { EtherealShadow } from "../ui/ethereal-shadow";

const steps = [
  {
    number: "01",
    icon: Smartphone,
    title: "Sign up in seconds",
    desc: "Use Apple, Google, or email. We connect to Uber Eats and Just Eat with read-only access — we never see your password.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "We build your profile",
    desc: "Your order history becomes stats, a taste profile, and a food personality. All processed and stored on your device.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Discover, rate, and share",
    desc: "Review restaurants, track your Want to Try list, explore the map, match with food soulmates, and share your Wrapped.",
  },
];

/* Gradient top-edge accent colours per card */
const cardAccents = [
  "linear-gradient(90deg, rgba(139,115,85,0.6) 0%, rgba(196,149,106,0.3) 60%, transparent 100%)",
  "linear-gradient(90deg, rgba(196,149,106,0.5) 0%, rgba(139,115,85,0.25) 60%, transparent 100%)",
  "linear-gradient(90deg, rgba(139,115,85,0.4) 0%, rgba(230,195,155,0.3) 60%, transparent 100%)",
];

/* Pulsing ring animation for icons on scroll */
const iconPulse = {
  hidden: { scale: 0.85, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.15, type: "spring" as const, stiffness: 300, damping: 18 },
  }),
};

export function HowItWorks() {
  return (
    <section className="relative bg-crumb-darkest py-20 md:py-28 overflow-hidden">
      {/* Ethereal animated background */}
      <div className="absolute inset-0 z-0">
        <EtherealShadow
          color="rgba(139, 115, 85, 0.4)"
          animation={{ scale: 60, speed: 40 }}
          noise={{ opacity: 0.3, scale: 1 }}
          sizing="fill"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-crumb-muted mb-3"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-crumb-cream"
          >
            Three steps to your stats
          </motion.h2>
        </div>

        {/* Connecting dotted line (desktop only) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-[calc(100%-8rem)] z-10 pointer-events-none"
          style={{ top: "calc(50% + 20px)" }}>
          <svg width="100%" height="2" xmlns="http://www.w3.org/2000/svg">
            <line
              x1="16%" y1="1" x2="84%" y2="1"
              stroke="rgba(139,115,85,0.22)"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Steps — cards with glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.13 }}
                className="relative rounded-2xl p-7 flex flex-col gap-4 overflow-hidden glass"
              >
                {/* Gradient top line accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                  style={{ background: cardAccents[i] }}
                />

                {/* Large semi-transparent step number behind the icon */}
                <span
                  className="absolute top-4 right-5 text-[5rem] font-extrabold leading-none select-none pointer-events-none"
                  style={{ color: "rgba(255,255,255,0.04)" }}
                >
                  {step.number}
                </span>

                {/* Icon circle — pulse on entry */}
                <motion.div
                  custom={i}
                  variants={iconPulse}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="w-12 h-12 rounded-full bg-white/[0.10] flex items-center justify-center mb-1 relative z-10"
                  style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 0 16px rgba(139,115,85,0.18)" }}
                >
                  <Icon size={22} className="text-crumb-cream/80" />
                </motion.div>

                <h3 className="text-xl font-bold text-crumb-cream relative z-10">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-crumb-muted leading-relaxed relative z-10">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-xs text-crumb-muted/50 mt-16"
        >
          Your order data is stored locally on your device and never shared with us.
        </motion.p>
      </div>

    </section>
  );
}
