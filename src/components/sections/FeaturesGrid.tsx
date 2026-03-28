"use client";
import { motion } from "framer-motion";
import { BarChart3, Map, Star, Gift, Heart, MessageCircle, Check, Crown } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Deep Stats",
    desc: "Total orders, top restaurants, cuisine breakdown, ordering patterns, and time period comparisons.",
    accent: "bg-crumb-dark",
  },
  {
    icon: Map,
    title: "Restaurant Map",
    desc: "See every restaurant you've ordered from on a map. Filter by been-to or want-to-try.",
    accent: "bg-crumb-brown",
  },
  {
    icon: Star,
    title: "Reviews & Ratings",
    desc: "Rate restaurants, tag occasions, pick favourite dishes, and keep notes. Your personal food journal.",
    accent: "bg-crumb-dark",
  },
  {
    icon: Gift,
    title: "Crumb Wrapped",
    desc: "Your year in food delivery. Stats, personality, top restaurants — beautifully packaged and shareable.",
    accent: "bg-crumb-brown",
  },
  {
    icon: Heart,
    title: "Food Soulmate",
    desc: "Match with friends by taste compatibility. See your percentage and shared favourites.",
    accent: "bg-crumb-dark",
  },
  {
    icon: MessageCircle,
    title: "Friends & Chat",
    desc: "Add friends, compare stats, get recommendations, and chat about food in real-time.",
    accent: "bg-crumb-brown",
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

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-20">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-crumb-card rounded-2xl p-7 flex flex-col gap-4"
              >
                <div className={`w-10 h-10 rounded-xl ${f.accent} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-crumb-card rounded-2xl p-8 flex flex-col"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-crumb-muted mb-3">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-crumb-dark">&pound;0</span>
              <span className="text-crumb-muted text-sm"> / month</span>
            </div>
            <ul className="space-y-3 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-crumb-dark/80">
                  <Check size={15} className="text-crumb-brown shrink-0" />
                  {f}
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

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-crumb-dark rounded-2xl p-8 flex flex-col"
          >
            <div className="absolute -top-3 right-6 px-3 py-1 bg-crumb-card text-crumb-dark text-xs font-bold rounded-full flex items-center gap-1.5">
              <Crown size={11} />
              Premium
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-crumb-cream/50 mb-3">Premium</h3>
            <div className="mb-1">
              <span className="text-4xl font-extrabold text-crumb-cream">&pound;4.99</span>
              <span className="text-crumb-cream/50 text-sm"> / month</span>
            </div>
            <p className="text-xs text-crumb-cream/40 mb-6">or &pound;49.99/year</p>
            <ul className="space-y-3 flex-1">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-crumb-cream/80">
                  <Check size={15} className="text-crumb-card shrink-0" />
                  {f}
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
          </motion.div>
        </div>

      </div>
    </section>
  );
}
