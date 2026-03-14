"use client";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const freePlan = {
  name: "Free",
  price: "£0",
  period: "/month",
  features: [
    "All core stats",
    "Crumb Wrapped",
    "Friend soulmate matching",
    "Restaurant recommendations",
    "Deep links to delivery apps",
  ],
  cta: "Download Free",
  ctaStyle: "outline" as const,
};

const premiumPlan = {
  name: "Premium",
  price: "£1.99",
  period: "/month",
  sub: "or £14.99/year",
  features: [
    "Everything in Free, plus:",
    "Ad-free experience",
    "Drink statistics",
    "Lifetime history",
    "Percentile rankings",
    "Random soulmate matching",
  ],
  cta: "Start Free, Upgrade Later",
  ctaStyle: "solid" as const,
};

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative bg-crumb-card py-24 md:py-32 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-crumb-dark text-center mb-16">
          Simple pricing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-crumb-cream rounded-2xl p-8 flex flex-col"
          >
            <h3 className="text-lg font-bold text-crumb-dark">{freePlan.name}</h3>
            <div className="mt-3 mb-6">
              <span className="text-4xl font-extrabold text-crumb-dark">
                {freePlan.price}
              </span>
              <span className="text-crumb-muted text-sm">{freePlan.period}</span>
            </div>
            <ul className="space-y-3 flex-1">
              {freePlan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-crumb-dark/80">
                  <Check size={16} className="text-crumb-brown shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#waitlist"
              className="mt-8 inline-flex items-center justify-center h-12 border-2 border-crumb-dark text-crumb-dark text-sm font-semibold rounded-full hover:bg-crumb-dark/5 transition-all"
            >
              {freePlan.cta}
            </a>
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, type: "spring" }}
            className="relative bg-crumb-cream rounded-2xl p-8 flex flex-col shadow-xl ring-2 ring-crumb-dark/10"
          >
            {/* Badge */}
            <div className="absolute -top-3 right-6 px-3 py-1 bg-crumb-dark text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <Sparkles size={12} /> Premium
            </div>
            <h3 className="text-lg font-bold text-crumb-dark">{premiumPlan.name}</h3>
            <div className="mt-3 mb-1">
              <span className="text-4xl font-extrabold text-crumb-dark">
                {premiumPlan.price}
              </span>
              <span className="text-crumb-muted text-sm">{premiumPlan.period}</span>
            </div>
            <p className="text-xs text-crumb-muted mb-6">{premiumPlan.sub}</p>
            <ul className="space-y-3 flex-1">
              {premiumPlan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-crumb-dark/80">
                  <Check size={16} className="text-crumb-brown shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#waitlist"
              className="mt-8 inline-flex items-center justify-center h-12 bg-crumb-dark text-white text-sm font-semibold rounded-full hover:scale-[1.02] hover:shadow-lg transition-all"
            >
              {premiumPlan.cta}
            </a>
            <p className="text-xs text-crumb-muted text-center mt-4">
              Or{" "}
              <a href="#waitlist" className="underline hover:text-crumb-dark transition-colors">
                become a Founding Member
              </a>{" "}
              and get premium for life — £4.99
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
