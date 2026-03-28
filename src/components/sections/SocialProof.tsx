"use client";
import { motion } from "framer-motion";

const trustSignals = [
  {
    stat: "Data stored on your device",
    sub: "Your order history never leaves your phone",
  },
  {
    stat: "Read-only access",
    sub: "We never see your delivery app passwords",
  },
  {
    stat: "No passwords needed",
    sub: "Sign in with Apple, Google, or email OTP",
  },
];

export function SocialProof() {
  return (
    <section className="bg-crumb-card py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-10"
        >
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-crumb-muted mb-3">
              Trust
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-crumb-dark">
              Built for food lovers
            </h2>
          </div>

          {/* Trust signal cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {trustSignals.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-crumb-cream rounded-2xl p-6 flex flex-col gap-2 text-center"
              >
                <span className="text-base font-bold text-crumb-dark leading-snug">
                  {item.stat}
                </span>
                <span className="text-xs text-crumb-muted leading-relaxed">
                  {item.sub}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center px-8 h-14 bg-crumb-dark text-white text-base font-semibold rounded-full hover:scale-[1.02] hover:shadow-xl transition-all"
            >
              Join the waitlist - it&apos;s free
            </a>
            <p className="text-xs text-crumb-muted/70">
              No spam. We&apos;ll email you on launch day and nothing else.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
