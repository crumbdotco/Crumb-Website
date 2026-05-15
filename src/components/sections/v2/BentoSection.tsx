'use client';
import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { SplitText } from '@/components/ui/SplitText';

function BentoCard({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
      className={`bg-[#1A1208] rounded-3xl border border-white/6 p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 ${className}`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(230,195,155,0.05) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      {children}
    </motion.div>
  );
}

export function BentoSection() {
  return (
    <section className="bg-[#0E0805] px-6 py-28" id="discover">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold tracking-[3px] uppercase text-[#E0D5C9]/25 mb-4 font-mono">
            What&apos;s inside
          </p>
          <SplitText
            text="Everything you didn't know you wanted."
            as="h2"
            className="font-headline text-[clamp(40px,6vw,80px)] text-[#E0D5C9] tracking-[-0.02em] leading-[0.95] max-w-[900px] mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Wrapped — wide */}
          <BentoCard className="md:col-span-2" delay={0}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#E6C39B]/10 flex items-center justify-center text-xl mb-4">
                  ✦
                </div>
                <h3 className="font-headline text-[36px] text-[#E0D5C9] tracking-[-0.02em] mb-3">
                  Wrapped.
                </h3>
                <p className="text-[14px] leading-[1.65] text-[#E0D5C9]/45">
                  Your year in food, distilled. Orders, restaurants, top spots — all in one shareable card.
                </p>
              </div>
              <div className="flex gap-3">
                {[
                  ['Orders', '147', 'this year'],
                  ['Restaurants', '38', 'unique'],
                  ['Top Spot', "Nando's", '21 visits'],
                ].map(([l, v, s]) => (
                  <div key={l} className="flex-1 bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                    <div className="text-[8px] uppercase tracking-[1px] text-[#E0D5C9]/30">{l}</div>
                    <div className="font-headline text-[22px] text-white mt-0.5 leading-tight">{v}</div>
                    <div className="text-[9px] text-[#E6C39B] mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Personality */}
          <BentoCard delay={0.1}>
            <div className="w-10 h-10 rounded-xl bg-[#E6C39B]/10 flex items-center justify-center text-xl mb-4">
              🧠
            </div>
            <h3 className="font-headline text-[32px] text-[#E0D5C9] tracking-[-0.02em] mb-3">
              Personality.
            </h3>
            <p className="text-[13px] leading-[1.65] text-[#E0D5C9]/45 mb-5">
              What do your orders say about you?
            </p>
            <div className="flex items-center gap-4">
              <div
                className="w-[72px] h-[72px] rounded-full shrink-0 relative"
                style={{
                  background:
                    'conic-gradient(#C9A077 0deg 122deg, #8A7060 122deg 223deg, #5C4438 223deg 280deg, rgba(255,255,255,0.06) 280deg)',
                }}
              >
                <div className="absolute inset-0 m-[14px] rounded-full bg-[#1A1208]" />
              </div>
              <div className="space-y-1.5 text-[10px] text-[#E0D5C9]/55">
                {[['#C9A077', 'Indian 34%'], ['#8A7060', 'Pizza 28%'], ['#5C4438', 'Chinese 18%']].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Soulmates */}
          <BentoCard delay={0.2}>
            <div className="w-10 h-10 rounded-xl bg-[#E6C39B]/10 flex items-center justify-center text-xl mb-4">
              💛
            </div>
            <h3 className="font-headline text-[32px] text-[#E0D5C9] tracking-[-0.02em] mb-3">
              Soulmates.
            </h3>
            <p className="text-[13px] leading-[1.65] text-[#E0D5C9]/45 mb-5">
              Find who shares the most culinary DNA with you.
            </p>
            <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A077] to-[#5C4438] flex items-center justify-center text-white font-bold shrink-0">
                J
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-white">Jamie</div>
                <div className="text-[10px] text-[#E0D5C9]/35">3 shared favourites</div>
              </div>
              <div className="font-headline text-[28px] text-[#E6C39B] leading-none">92%</div>
            </div>
          </BentoCard>

          {/* Streaks — wide */}
          <BentoCard className="md:col-span-2" delay={0.3}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#E6C39B]/10 flex items-center justify-center text-xl mb-4">
                  🔥
                </div>
                <h3 className="font-headline text-[36px] text-[#E0D5C9] tracking-[-0.02em] mb-3">
                  Streaks.
                </h3>
                <p className="text-[14px] leading-[1.65] text-[#E0D5C9]/45">
                  Track how many days in a row you&apos;ve ordered. Personal bests, current streaks, weekly patterns.
                </p>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#E0D5C9]/25 uppercase tracking-[1.5px] mb-3 font-mono">
                  Last 14 days
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {[1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1].map((done, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        done
                          ? 'bg-[#C9A077] text-[#1A1208]'
                          : 'bg-white/[0.05] text-[#E0D5C9]/20'
                      }`}
                    >
                      {done ? '✓' : '—'}
                    </div>
                  ))}
                </div>
                <div className="font-headline text-[36px] text-[#E6C39B] leading-none tracking-[-0.02em]">
                  7 Day Streak 🔥
                </div>
                <div className="text-[10px] text-[#E0D5C9]/25 mt-1">Personal best: 12 days</div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
