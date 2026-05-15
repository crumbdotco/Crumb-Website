'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { MARQUEE_ITEMS } from './sections-data';

const TRACK = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

export function PlatformMarquee() {
  const reduce = useReducedMotion();
  return (
    <section className="bg-[#0E0805] border-y border-[#E6C39B]/8 py-6 overflow-hidden" aria-label="Supported delivery platforms">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#0E0805] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#0E0805] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex w-max"
          animate={reduce ? {} : { x: ['0%', '-33.333%'] }}
          transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
        >
          {TRACK.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-9 py-3 border-r border-[#E6C39B]/8 whitespace-nowrap"
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: item.dot }}
                aria-hidden="true"
              />
              <span className="text-[13px] font-medium text-[#E0D5C9]/40 font-mono uppercase tracking-[1px]">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
