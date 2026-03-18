"use client";
import { motion } from "framer-motion";
import { FlowingBackground } from "../shared/FlowingBackground";
import { PhoneMockup } from "./PhoneMockup";

export function Hero() {
  return (
    <section className="relative bg-crumb-cream min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      <FlowingBackground />

      <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: text + CTA */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-crumb-card rounded-full text-xs font-semibold text-crumb-dark mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-crumb-brown" />
              Spotify Wrapped - but for food delivery
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold text-crumb-dark leading-[1.05] tracking-tight mb-6"
            >
              See exactly how<br />
              you really eat
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-crumb-muted leading-relaxed max-w-[480px] mb-8"
            >
              Connect your Uber Eats and Just Eat accounts. Crumb pulls your
              entire order history and turns it into beautiful stats, a
              year-in-review Wrapped, and more.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <a
                href="#waitlist"
                className="inline-flex items-center justify-center px-8 h-14 bg-crumb-dark text-white text-base font-semibold rounded-full hover:scale-[1.02] hover:shadow-xl transition-all"
              >
                Join the waitlist - it&apos;s free
              </a>
              <p className="text-sm text-crumb-muted">
                Available on iOS &amp; Android
              </p>
            </motion.div>

            {/* Social proof micro-line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 text-xs text-crumb-muted"
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
      >
        <div className="w-px h-10 bg-crumb-brown/30 animate-pulse" />
      </motion.div>
    </section>
  );
}
