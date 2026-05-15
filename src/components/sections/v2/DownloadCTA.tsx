// src/components/sections/v2/DownloadCTA.tsx
'use client';
import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { SplitText } from '@/components/ui/SplitText';
import { MagneticButton } from '@/components/ui/MagneticButton';

export function DownloadCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduce = useReducedMotion();

  return (
    <section className="bg-[#E0D5C9] relative overflow-hidden px-6 py-28 text-center" id="download">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(201,160,119,0.35),transparent_70%)] pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-[720px] mx-auto">
        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
          className="text-[10px] font-bold tracking-[3px] uppercase text-[#8A7060] mb-4 font-mono"
        >
          Available now
        </motion.p>

        <SplitText
          text="Your food story, starts today."
          as="h2"
          className="font-headline text-[clamp(48px,8vw,108px)] text-[#1A1208] tracking-[-0.025em] leading-[0.9] mb-8"
          staggerDelay={0.08}
          baseDelay={0.1}
        />

        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="text-[15px] leading-[1.65] text-[#5C4438] mb-10 max-w-[420px] mx-auto"
        >
          Download Crumb for free. Import your first screenshot in seconds. Your stats are waiting.
        </motion.p>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex gap-3 justify-center flex-wrap"
        >
          <MagneticButton
            className="flex items-center gap-3 bg-[#1A1208] text-[#E0D5C9] rounded-[13px] px-6 py-3.5 hover:bg-[#2A2118] transition-colors duration-150"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span className="text-left">
              <span className="block text-[9px] opacity-60 leading-none">Download on the</span>
              <span className="block text-[15px] font-bold leading-tight">App Store</span>
            </span>
          </MagneticButton>

          <MagneticButton
            className="flex items-center gap-3 bg-[#1A1208]/10 text-[#1A1208] border border-[#1A1208]/15 rounded-[13px] px-6 py-3.5 hover:bg-[#1A1208]/15 transition-colors duration-150"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.18 23.76c.35.2.74.24 1.12.12l12.74-7.38-2.8-2.8-11.06 10.06zm-1.7-20.2C1.2 3.9 1 4.32 1 4.86v14.28c0 .54.2.96.48 1.3l.07.07 8-8v-.18l-8-8-.07.07zM20.55 10.3l-2.68-1.55-3.01 3.01 3.01 3.01 2.72-1.57c.78-.45.78-1.45-.04-1.9zM4.3.12C3.92 0 3.53.04 3.18.24l.07.07 11.02 10.06 2.8-2.8L4.3.12z" />
            </svg>
            <span className="text-left">
              <span className="block text-[9px] opacity-50 leading-none">Get it on</span>
              <span className="block text-[15px] font-bold leading-tight">Google Play</span>
            </span>
          </MagneticButton>
        </motion.div>

        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : undefined}
          transition={{ delay: 0.9 }}
          className="mt-6 text-[12px] text-[#8A7060]"
        >
          Free to download · Import via screenshot or log manually
        </motion.p>
      </div>
    </section>
  );
}
