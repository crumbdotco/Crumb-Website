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

          {/* Food Map — wide */}
          <BentoCard className="md:col-span-2" delay={0.3}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#E6C39B]/10 flex items-center justify-center text-xl mb-4">
                  📍
                </div>
                <h3 className="font-headline text-[36px] text-[#E0D5C9] tracking-[-0.02em] mb-3">
                  Food Map.
                </h3>
                <p className="text-[14px] leading-[1.65] text-[#E0D5C9]/45">
                  Every restaurant you&apos;ve ordered from, plotted on the map. See your hotspots, untouched corners, and the radius of your appetite.
                </p>
              </div>
              <div className="relative h-[180px] rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
                {/* Faux map: grid lines + pins */}
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(230,195,155,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(230,195,155,0.08) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
                {[
                  { x: '22%', y: '34%', size: 14 },
                  { x: '48%', y: '52%', size: 22 },
                  { x: '70%', y: '28%', size: 12 },
                  { x: '64%', y: '70%', size: 18 },
                  { x: '32%', y: '74%', size: 10 },
                  { x: '82%', y: '54%', size: 14 },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-[#E6C39B]"
                    style={{
                      left: p.x,
                      top: p.y,
                      width: p.size,
                      height: p.size,
                      transform: 'translate(-50%,-50%)',
                      boxShadow: '0 0 0 4px rgba(230,195,155,0.12), 0 0 12px rgba(230,195,155,0.5)',
                    }}
                  />
                ))}
                <div className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[1.5px] text-[#E0D5C9]/40 font-mono">
                  38 spots · London
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
