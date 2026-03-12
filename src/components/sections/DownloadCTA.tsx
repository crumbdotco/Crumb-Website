"use client";
import { motion } from "framer-motion";
import { AnimatedText } from "../shared/AnimatedText";

function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${(i * 5) + Math.random() * 3}%`,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 2 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full bg-crumb-cream/20"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `particle-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function DownloadCTA() {
  return (
    <section
      id="download"
      className="relative bg-crumb-darkest py-32 md:py-40 overflow-hidden"
    >
      <Particles />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <AnimatedText
          text="Ready to see your food story?"
          className="text-3xl md:text-5xl lg:text-[56px] font-bold text-crumb-cream mb-6"
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-crumb-muted mb-10"
        >
          Join thousands of food delivery lovers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <a
            href="#"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] text-white/60">Coming Soon on</div>
              <div className="text-sm font-semibold text-white">App Store</div>
            </div>
          </a>

          <a
            href="#"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 13l2.302-2.302-2.302-2.302 2.302 2.812zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] text-white/60">Coming Soon on</div>
              <div className="text-sm font-semibold text-white">Google Play</div>
            </div>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-xs text-crumb-muted"
        >
          Available in the UK. More regions coming soon.
        </motion.p>
      </div>
    </section>
  );
}
