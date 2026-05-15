'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { PhoneShell } from '@/components/ui/PhoneShell';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useWaitlistCount } from '@/hooks/useWaitlistCount';
import { useCountUp } from '@/hooks/useCountUp';
import { HERO_HEADLINE, HERO_SUB } from './sections-data';

export function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const phoneY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const waitlist = useWaitlistCount();
  const orders = useCountUp(147, 1400);
  const restaurants = useCountUp(38, 1200);

  const blob = useMouseParallax(0.04);

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity: fadeOut }}
      className="relative min-h-screen bg-[#0E0805] flex items-center overflow-hidden px-6 pt-28 pb-24"
      id="hero"
    >
      {/* Mouse-parallax gold blob */}
      <motion.div
        ref={blob.ref as React.RefObject<HTMLDivElement>}
        style={{ x: blob.x, y: blob.y }}
        className="absolute top-[35%] right-[10%] w-[600px] h-[500px] rounded-full pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-full h-full bg-[radial-gradient(ellipse,rgba(201,160,119,0.18),transparent_60%)]" />
      </motion.div>

      <NoiseOverlay opacity={0.022} />

      <div className="relative z-10 w-full max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Text — 7 cols */}
        <div className="md:col-span-7 flex flex-col gap-7">
          {/* Status badge */}
          <motion.a
            href="#waitlist"
            data-cursor="pointer"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border border-[#E6C39B]/15 bg-[#E6C39B]/[0.06] text-[11px] font-semibold text-[#E6C39B]/70 tracking-[1.2px] uppercase hover:border-[#E6C39B]/30 hover:text-[#E6C39B]/90 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 motion-safe:animate-pulse" />
            Coming soon · Join the waitlist
          </motion.a>

          {/* Headline */}
          <h1 className="font-headline leading-[0.88]">
            {HERO_HEADLINE.map((word, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  initial={reduce ? { opacity: 0 } : { y: '100%' }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.7 + i * 0.09,
                  }}
                  className="block text-[clamp(72px,11vw,164px)] text-[#E0D5C9]"
                >
                  {i === HERO_HEADLINE.length - 1 ? (
                    <>
                      {word.replace('.', '')}
                      <span className="text-[#E6C39B]">.</span>
                    </>
                  ) : (
                    word
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Sub */}
          <motion.p
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.6 }}
            className="text-[15px] leading-[1.65] text-[#E0D5C9]/45 max-w-[420px]"
          >
            {HERO_SUB}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex items-center gap-5"
          >
            <MagneticButton
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] bg-[#E6C39B] text-[#1A1208] text-[14px] font-bold hover:bg-[#C9A077] transition-colors duration-150"
            >
              Join the Waitlist
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M6.5 1v7M3 4.5l3.5 3.5 3.5-3.5M1 11h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MagneticButton>
            <a
              href="#features"
              className="text-[13px] font-medium text-[#E0D5C9]/45 hover:text-[#E0D5C9] transition-colors flex items-center gap-1.5 group"
              data-cursor="pointer"
            >
              See how it works
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </motion.div>

          {/* Social proof */}
          {waitlist !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.35 }}
              className="flex items-center gap-2.5 text-[12px] text-[#E0D5C9]/35"
            >
              <div className="flex">
                {['A', 'J', 'S'].map((l, i) => (
                  <div
                    key={l}
                    className="w-[26px] h-[26px] rounded-full border-2 border-[#0E0805] flex items-center justify-center text-[10px] font-bold text-[#0E0805]"
                    style={{
                      background: ['#C9A077', '#5C4438', '#8A7060'][i],
                      marginLeft: i === 0 ? 0 : -8,
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              {waitlist.toLocaleString()}+ on the waitlist
            </motion.div>
          )}
        </div>

        {/* Phone — 5 cols, offset down 80px */}
        <motion.div
          style={{ y: phoneY }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 64, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.85, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5 md:translate-y-[80px] flex justify-center md:justify-end"
        >
          <PhoneShell className="w-full max-w-[270px]" screenClassName="h-[500px] pt-12 px-4 pb-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#E0D5C9]/30">
                  Your Stats
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#E6C39B]/15 text-[#E6C39B] font-bold tracking-[1px]">
                  2026
                </span>
              </div>
              <div className="bg-[#2A2118] rounded-2xl p-4 border border-white/5">
                <div className="text-[9px] uppercase tracking-[1px] text-[#E0D5C9]/30">
                  Total Orders
                </div>
                <div
                  ref={orders.ref as React.RefObject<HTMLDivElement>}
                  className="font-headline text-[44px] text-white leading-[0.9] mt-1 tracking-[-0.02em]"
                >
                  {orders.value}
                </div>
                <div className="text-[10px] text-[#E6C39B] mt-1">screenshot & manual entry</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#2A2118] rounded-xl p-3 border border-white/5">
                  <div className="text-[8px] uppercase tracking-[1px] text-[#E0D5C9]/30">
                    Restaurants
                  </div>
                  <div
                    ref={restaurants.ref as React.RefObject<HTMLDivElement>}
                    className="font-headline text-[22px] text-white leading-none mt-0.5"
                  >
                    {restaurants.value}
                  </div>
                  <div className="text-[9px] text-[#E0D5C9]/30">unique spots</div>
                </div>
                <div className="bg-[#2A2118] rounded-xl p-3 border border-white/5">
                  <div className="text-[8px] uppercase tracking-[1px] text-[#E0D5C9]/30">
                    Top Cuisine
                  </div>
                  <div className="text-[14px] font-bold text-white mt-0.5">Indian 🍛</div>
                  <div className="text-[9px] text-[#E0D5C9]/30">34% of orders</div>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  ['🍗', "Nando's", '21 visits'],
                  ['🍕', 'Pizza Express', '14 visits'],
                ].map(([e, n, c]) => (
                  <div
                    key={n}
                    className="flex items-center gap-2.5 bg-[#2A2118] rounded-xl p-2.5 border border-white/5"
                  >
                    <span className="text-lg">{e}</span>
                    <div className="flex-1">
                      <div className="text-[11px] font-semibold text-white">{n}</div>
                      <div className="text-[9px] text-[#E0D5C9]/30">{c}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PhoneShell>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[2px] uppercase text-[#E0D5C9]/20 font-mono">
          Scroll
        </span>
        <motion.div
          animate={reduce ? {} : { y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-[#E6C39B]/40 to-transparent"
        />
      </motion.div>
    </motion.section>
  );
}
