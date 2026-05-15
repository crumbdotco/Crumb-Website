'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { STATS_BAND } from './sections-data';

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);

  return (
    <section ref={ref} className="bg-[#0E0805] py-24 overflow-hidden border-y border-[#E6C39B]/8">
      <motion.div style={{ x }} className="flex w-max gap-16 will-change-transform">
        {[...STATS_BAND, ...STATS_BAND].map((s, i) => (
          <div key={i} className="flex flex-col items-center min-w-[280px]">
            <div className="font-headline text-[clamp(80px,12vw,180px)] text-[#E0D5C9] leading-[0.85] tracking-[-0.03em]">
              {s.num}
            </div>
            <div className="text-[12px] uppercase tracking-[2px] text-[#E0D5C9]/35 mt-2">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
