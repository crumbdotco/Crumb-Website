"use client";
import { motion } from "framer-motion";
import { FlowingBackground } from "../shared/FlowingBackground";
import { PhoneMockup } from "./PhoneMockup";

const floatingEmojis = [
  { emoji: "🍕", top: "18%", left: "6%",  delay: 0.8,  duration: 3.2, amplitude: 10 },
  { emoji: "🍜", top: "60%", left: "2%",  delay: 1.2,  duration: 4.0, amplitude: 8  },
  { emoji: "🌮", top: "80%", left: "10%", delay: 0.4,  duration: 3.6, amplitude: 12 },
  { emoji: "🍣", top: "12%", right: "5%", delay: 1.0,  duration: 3.8, amplitude: 9  },
  { emoji: "🍔", top: "70%", right: "3%", delay: 0.6,  duration: 4.2, amplitude: 11 },
] as const;

export function Hero() {
  return (
    <section className="relative bg-crumb-cream min-h-screen flex flex-col justify-center overflow-hidden pt-16 grain-overlay">
      <FlowingBackground />

      {/* Floating decorative food emojis */}
      {floatingEmojis.map((item, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 0.35, 0.35, 0],
            scale: [0.6, 1, 1, 0.8],
            y: [0, -item.amplitude, 0, item.amplitude, 0],
          }}
          transition={{
            delay: item.delay,
            duration: item.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            opacity: { delay: item.delay, duration: 1.2 },
            scale: { delay: item.delay, duration: 1.2 },
          }}
          className="absolute text-3xl pointer-events-none select-none hidden lg:block"
          style={{
            top: item.top,
            left: "left" in item ? item.left : undefined,
            right: "right" in item ? item.right : undefined,
            filter: "blur(0.5px)",
            zIndex: 2,
          }}
        >
          {item.emoji}
        </motion.span>
      ))}

      <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 w-full" style={{ zIndex: 3 }}>
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* Left: text + CTA */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Pill badge — gradient border + glow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 badge-glow rounded-full text-xs font-semibold text-crumb-dark mb-8"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-crumb-brown block"
              />
              Your food delivery stats — beautifully wrapped
            </motion.div>

            {/* Main headline — larger, tighter tracking */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-crumb-dark leading-[1.02] mb-8"
              style={{ letterSpacing: "-0.03em" }}
            >
              Know exactly<br />
              how you{" "}
              <span className="gradient-text">eat</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-crumb-muted leading-relaxed max-w-[480px] mb-10"
            >
              Connect Uber Eats and Just Eat. Get deep stats, a restaurant map,
              personal reviews, your food personality, friend soulmate matching,
              and your annual Wrapped — all in one place.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <motion.a
                href="#waitlist"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center justify-center px-10 h-15 bg-crumb-dark text-white text-base font-semibold rounded-full shadow-lg hover:shadow-2xl transition-shadow"
                style={{ height: "3.75rem", boxShadow: "0 4px 24px rgba(61,43,31,0.22)" }}
              >
                Join the waitlist - it&apos;s free
              </motion.a>
              <p className="text-sm text-crumb-muted">
                Sign in with Apple, Google, or email
              </p>
            </motion.div>

            {/* Social proof micro-line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 text-xs text-crumb-muted"
            >
              Built by students · Launching in the UK
            </motion.p>
          </div>

          {/* Right: phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", damping: 18 }}
            className="w-full max-w-[300px] lg:max-w-[340px] shrink-0"
          >
            <PhoneMockup />
          </motion.div>

        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 3 }}
      >
        <div className="w-px h-10 bg-crumb-brown/30 animate-pulse" />
      </motion.div>
    </section>
  );
}
