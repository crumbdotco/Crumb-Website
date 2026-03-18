"use client";
import { motion } from "framer-motion";

export function SocialProof() {
  return (
    <section className="bg-crumb-card py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-4xl md:text-5xl font-extrabold text-crumb-dark">
            Ready to see yours?
          </p>
          <p className="text-lg text-crumb-muted max-w-[460px]">
            Crumb is launching soon in the UK. Join the waitlist now and be
            first to see your food stats.
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center px-8 h-14 bg-crumb-dark text-white text-base font-semibold rounded-full hover:scale-[1.02] hover:shadow-xl transition-all"
          >
            Join the waitlist - it&apos;s free
          </a>
          <p className="text-xs text-crumb-muted/70">
            No spam. We&apos;ll email you on launch day and nothing else.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
