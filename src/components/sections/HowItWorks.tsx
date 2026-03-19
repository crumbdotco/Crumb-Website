"use client";
import { motion } from "framer-motion";
import { Smartphone, BarChart3, Share2 } from "lucide-react";
import { EtherealShadow } from "../ui/ethereal-shadow";

const steps = [
  {
    number: "01",
    icon: Smartphone,
    title: "Connect your accounts",
    desc: "Link your Uber Eats and Just Eat accounts in seconds. Read-only access — we never see your password.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "We crunch the numbers",
    desc: "Crumb pulls your full order history and builds your taste profile. Your data stays on your device.",
  },
  {
    number: "03",
    icon: Share2,
    title: "See your stats and share them",
    desc: "Get your personalised stats, Wrapped, food personality, and Food Soulmate match. Share with friends.",
  },
];

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

        {/* Steps — cards with icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-7 flex flex-col gap-4"
              >
                {/* Icon circle */}
                <div className="w-11 h-11 rounded-full bg-white/[0.08] flex items-center justify-center mb-1">
                  <Icon size={20} className="text-crumb-cream/70" />
                </div>
                <span className="text-5xl font-extrabold text-white/[0.06] leading-none select-none">
                  {step.number}
                </span>
                <h3 className="text-xl font-bold text-crumb-cream -mt-2">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-crumb-muted leading-relaxed">
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
