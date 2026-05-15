'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { STATS_BAND } from './sections-data';

const StatItem = ({ s }: { s: { num: string; label: string } }) => (
  <div className="flex flex-col items-center min-w-[280px]">
    <div className="font-headline text-[clamp(80px,12vw,180px)] text-[#E0D5C9] leading-[0.85] tracking-[-0.03em]">
      {s.num}
    </div>
    <div className="text-[12px] uppercase tracking-[2px] text-[#E0D5C9]/35 mt-2">
      {s.label}
    </div>
  </div>
);

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);

  return (
    <section ref={ref} className="bg-[#0E0805] py-16 md:py-24 overflow-hidden border-y border-[#E6C39B]/8">
      {/* Mobile: infinite marquee */}
      <div className="md:hidden">
        <motion.div
          className="flex w-max gap-16 will-change-transform"
          animate={reduce ? {} : { x: ['0%', '-50%'] }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        >
          {[...STATS_BAND, ...STATS_BAND].map((s, i) => (
            <StatItem key={i} s={s} />
          ))}
        </motion.div>
      </div>

      {/* Desktop: scroll-tied */}
      <div className="hidden md:block">
        <motion.div style={{ x }} className="flex w-max gap-16 will-change-transform">
          {[...STATS_BAND, ...STATS_BAND].map((s, i) => (
            <StatItem key={i} s={s} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
