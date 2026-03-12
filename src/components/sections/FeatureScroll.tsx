"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, BarChart3, Sparkles, Gift, Heart } from "lucide-react";
import { FlowingBackground } from "../shared/FlowingBackground";

const features = [
  {
    num: "01",
    icon: Link,
    title: "Connect Your Accounts",
    desc: "Link your Uber Eats and Just Eat accounts in seconds. Crumb pulls your entire order history automatically.",
  },
  {
    num: "02",
    icon: BarChart3,
    title: "See Your Stats",
    desc: "Total orders, top restaurants, favourite items, cuisine breakdown, all visualised beautifully.",
  },
  {
    num: "03",
    icon: Sparkles,
    title: "Discover New Food",
    desc: "Personalised restaurant recommendations based on your taste profile. Like Discover Weekly, but for food.",
  },
  {
    num: "04",
    icon: Gift,
    title: "Crumb Wrapped",
    desc: "Your year in food delivery. Share your stats, your personality type, and your food story.",
  },
  {
    num: "05",
    icon: Heart,
    title: "Find Your Food Soulmate",
    desc: "Match with friends based on food taste. See who you're most compatible with.",
  },
];

export function FeatureScroll() {
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  // Scroll further so card 05 ends at the right edge, not centered
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);

  return (
    <section
      id="features"
      ref={targetRef}
      className="relative h-[400vh] bg-crumb-darkest"
    >
      <FlowingBackground dark />
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="px-6 md:px-16 mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-crumb-muted mb-3">
            What Crumb Does
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-crumb-cream">
            Everything you need
          </h2>
        </div>

        {/* Desktop: horizontal scroll */}
        <motion.div
          style={{ x }}
          className="hidden md:flex gap-8 pl-16 will-change-transform"
        >
          {features.map((f, i) => (
            <FeatureCard key={f.num} feature={f} index={i} />
          ))}
        </motion.div>

        {/* Mobile: vertical stack */}
        <div className="md:hidden flex flex-col gap-4 px-6 overflow-y-auto max-h-[60vh] pb-8">
          {features.map((f, i) => (
            <FeatureCard key={f.num} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative min-w-[340px] md:min-w-[400px] bg-crumb-dark/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 flex flex-col gap-4"
    >
      {/* Large number */}
      <span className="absolute top-4 right-6 text-[80px] md:text-[120px] font-extrabold text-white/[0.04] leading-none select-none pointer-events-none">
        {feature.num}
      </span>

      <div className="w-12 h-12 rounded-xl bg-crumb-cream/10 flex items-center justify-center">
        <Icon size={24} className="text-crumb-cream" />
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-crumb-cream">
        {feature.title}
      </h3>
      <p className="text-sm md:text-base text-crumb-muted leading-relaxed max-w-[320px]">
        {feature.desc}
      </p>
    </motion.div>
  );
}
