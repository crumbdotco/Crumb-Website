"use client";
import { motion } from "framer-motion";

/* SVG icons kept inline to avoid external deps */
const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const UserCheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

const trustSignals = [
  {
    icon: ShieldIcon,
    stat: "Data stored on your device",
    sub: "Your order history never leaves your phone",
  },
  {
    icon: LockIcon,
    stat: "Read-only access",
    sub: "We never see your delivery app passwords",
  },
  {
    icon: UserCheckIcon,
    stat: "No passwords needed",
    sub: "Sign in with Apple, Google, or email OTP",
  },
];


export function SocialProof() {
  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #DDD0C0 0%, #D4C5B2 100%)" }}
    >
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
            {trustSignals.map((item, i) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{
                    y: -3,
                    boxShadow: "0 10px 32px rgba(61,43,31,0.12)",
                    transition: { type: "spring", stiffness: 320, damping: 22 },
                  }}
                  className="bg-crumb-cream rounded-2xl p-6 flex flex-col items-center gap-3 text-center card-warm-border"
                  style={{ boxShadow: "0 1px 4px rgba(61,43,31,0.07)" }}
                >
                  {/* Animated icon circle */}
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.12 + 0.15, type: "spring", stiffness: 280 }}
                    className="w-11 h-11 rounded-full flex items-center justify-center mb-1"
                    style={{
                      background: "linear-gradient(135deg, rgba(139,115,85,0.12) 0%, rgba(196,149,106,0.18) 100%)",
                      boxShadow: "0 0 0 1px rgba(139,115,85,0.18)",
                      color: "#8B7355",
                    }}
                  >
                    <IconComp />
                  </motion.div>

                  <span className="text-base font-bold text-crumb-dark leading-snug">
                    {item.stat}
                  </span>
                  <span className="text-xs text-crumb-muted leading-relaxed">
                    {item.sub}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <motion.a
              href="#waitlist"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex items-center justify-center px-8 bg-crumb-dark text-white text-base font-semibold rounded-full shadow-lg hover:shadow-2xl transition-shadow"
              style={{ height: "3.75rem", boxShadow: "0 4px 24px rgba(61,43,31,0.22)" }}
            >
              Join the waitlist - it&apos;s free
            </motion.a>
            <p className="text-xs text-crumb-muted/70">
              No spam. We&apos;ll email you on launch day and nothing else.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

