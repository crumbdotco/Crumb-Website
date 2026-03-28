"use client";
import { motion } from "framer-motion";
import { BarChart3, Map, Star, Gift, Heart, MessageCircle, Check, Crown } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Deep Stats",
    desc: "Total orders, top restaurants, cuisine breakdown, ordering patterns, and time period comparisons.",
    accentColor: "#3D2B1F",
    glowColor: "rgba(61,43,31,0.18)",
    topLineColor: "rgba(61,43,31,0.6)",
  },
  {
    icon: Map,
    title: "Restaurant Map",
    desc: "See every restaurant you've ordered from on a map. Filter by been-to or want-to-try.",
    accentColor: "#8B7355",
    glowColor: "rgba(139,115,85,0.2)",
    topLineColor: "rgba(139,115,85,0.7)",
  },
  {
    icon: Star,
    title: "Reviews & Ratings",
    desc: "Rate restaurants, tag occasions, pick favourite dishes, and keep notes. Your personal food journal.",
    accentColor: "#3D2B1F",
    glowColor: "rgba(61,43,31,0.18)",
    topLineColor: "rgba(61,43,31,0.6)",
  },
  {
    icon: Gift,
    title: "Crumb Wrapped",
    desc: "Your year in food delivery. Stats, personality, top restaurants — beautifully packaged and shareable.",
    accentColor: "#8B7355",
    glowColor: "rgba(139,115,85,0.2)",
    topLineColor: "rgba(139,115,85,0.7)",
  },
  {
    icon: Heart,
    title: "Food Soulmate",
    desc: "Match with friends by taste compatibility. See your percentage and shared favourites.",
    accentColor: "#3D2B1F",
    glowColor: "rgba(61,43,31,0.18)",
    topLineColor: "rgba(61,43,31,0.6)",
  },
  {
    icon: MessageCircle,
    title: "Friends & Chat",
    desc: "Add friends, compare stats, get recommendations, and chat about food in real-time.",
    accentColor: "#8B7355",
    glowColor: "rgba(139,115,85,0.2)",
    topLineColor: "rgba(139,115,85,0.7)",
  },
];

const freeFeatures = [
  "All core stats & graphs",
  "Restaurant reviews & map",
  "Crumb Wrapped",
  "Friend soulmate matching",
  "Want to Try list (up to 10)",
  "Achievement badges",
];

const premiumFeatures = [
  "Everything in Free",
  "Ad-free experience",
  "Year & Lifetime stats",
  "Photo reviews",
  "Friend recommendations",
  "Unlimited Want to Try",
  "Random soulmate matching",
];

export function FeaturesGrid() {
  return (
    <section id="features-section" className="relative bg-crumb-cream py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">

        {/* Features header */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-crumb-muted mb-3"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-crumb-dark"
          >
            Everything you need
          </motion.h2>
        </div>

        {/* Feature cards — alternating row offset for stagger effect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-20">
          {features.map((f, i) => {
            const Icon = f.icon;
            // Offset every second item in the middle column on large screens
            const isOffsetRow = i % 2 === 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`relative bg-crumb-card rounded-2xl p-7 flex flex-col gap-4 cursor-default overflow-hidden group
                  border border-crumb-line/60
                  hover:border-crumb-brown/30
                  hover:shadow-[0_12px_40px_rgba(61,43,31,0.14)]
                  transition-[border-color,box-shadow] duration-300
                  ${isOffsetRow ? "lg:translate-y-5" : ""}
                `}
              >
                {/* Top gradient accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{
                    background: `linear-gradient(90deg, ${f.topLineColor}, transparent)`,
                  }}
                />

                {/* Icon with radial glow */}
                <div className="relative w-10 h-10">
                  {/* Glow behind icon */}
                  <div
                    className="absolute -inset-3 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle, ${f.glowColor} 0%, transparent 70%)` }}
                  />
                  <div
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: f.accentColor }}
                  >
                    <Icon
                      size={20}
                      className="text-white transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-crumb-dark">{f.title}</h3>
                <p className="text-sm text-crumb-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing divider */}
        <motion.div
          id="pricing-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-crumb-muted mb-3">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-crumb-dark">
            Simple and fair
          </h2>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Free — clean, minimal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-crumb-card rounded-2xl p-8 flex flex-col border border-crumb-line/60"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-crumb-muted mb-3">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-crumb-dark">&pound;0</span>
              <span className="text-crumb-muted text-sm"> / month</span>
            </div>

            {/* "or" divider with extending lines */}
            <ul className="space-y-3 flex-1">
              {freeFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-sm text-crumb-dark/80">
                  <Check size={15} className="text-crumb-brown shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <a
              href="#waitlist"
              className="mt-8 inline-flex items-center justify-center h-12 border-2 border-crumb-dark text-crumb-dark text-sm font-semibold rounded-full hover:bg-crumb-dark/5 transition-all"
            >
              Join the waitlist
            </a>
          </motion.div>

          {/* Premium — dark with animated border glow */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-2xl"
          >
            {/* Animated border glow wrapper */}
            <div className="absolute inset-0 rounded-2xl animated-border-gradient" style={{ padding: "1.5px" }}>
              <div className="w-full h-full rounded-2xl bg-crumb-darkest" />
            </div>

            {/* Card content sits above the border */}
            <div className="relative bg-crumb-darkest rounded-2xl p-8 flex flex-col"
              style={{
                backgroundImage: "radial-gradient(ellipse at top right, rgba(139,115,85,0.08) 0%, transparent 60%)",
              }}
            >
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-3">
                <div className="px-3 py-1 bg-crumb-card text-crumb-dark text-xs font-bold rounded-full flex items-center gap-1.5">
                  <Crown size={11} />
                  Premium
                </div>
                <div className="px-3 py-1 bg-crumb-brown/20 text-crumb-card text-xs font-bold rounded-full border border-crumb-brown/30">
                  Recommended
                </div>
              </div>

              <h3 className="text-sm font-semibold uppercase tracking-wider text-crumb-cream/50 mb-3">Premium</h3>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-crumb-cream">&pound;4.99</span>
                <span className="text-crumb-cream/50 text-sm"> / month</span>
              </div>
              <p className="text-xs text-crumb-cream/40 mb-6">or &pound;49.99/year</p>

              <ul className="space-y-3 flex-1">
                {premiumFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-crumb-cream/80">
                    <Check size={15} className="text-emerald-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className="mt-8 inline-flex items-center justify-center h-12 bg-crumb-card text-crumb-dark text-sm font-semibold rounded-full hover:scale-[1.02] hover:shadow-lg transition-all"
              >
                Start free, upgrade later
              </a>
              <p className="text-xs text-crumb-cream/30 text-center mt-4">
                Or{" "}
                <a href="#waitlist" className="underline hover:text-crumb-cream/60 transition-colors">
                  become a Founding Member
                </a>{" "}
                - lifetime premium for &pound;4.99
              </p>
            </div>
          </motion.div>
        </div>

        {/* "or" separator between pricing cards — shown on mobile where cards stack */}
        <div className="md:hidden flex items-center gap-3 my-2 px-2">
          <div className="flex-1 h-px bg-crumb-line" />
          <span className="text-xs text-crumb-muted font-medium uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-crumb-line" />
        </div>

      </div>
    </section>
  );
}
