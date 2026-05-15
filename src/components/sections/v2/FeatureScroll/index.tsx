'use client';
import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { PhoneShell } from '@/components/ui/PhoneShell';
import { FEATURE_SLIDES } from '../sections-data';
import { SlidePanel } from './SlidePanel';
import { ScreenPanel } from './ScreenPanel';
import { Screen1, Screen2, Screen3, Screen4 } from './screens';

const SCREENS = [Screen1, Screen2, Screen3, Screen4];

export function FeatureScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const total = FEATURE_SLIDES.length;

  return (
    <>
      {/* Desktop pinned */}
      <div
        ref={containerRef}
        id="features"
        className="hidden md:block bg-[#0E0805] relative"
        style={{ height: `${total * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <div className="w-full max-w-[1100px] mx-auto px-6 grid grid-cols-12 gap-12 items-center">
            <div className="col-span-5 flex justify-start">
              <div className="relative w-[280px]">
                <PhoneShell screenClassName="h-[520px]">
                  {SCREENS.map((Screen, i) => (
                    <ScreenPanel
                      key={i}
                      scrollYProgress={scrollYProgress}
                      start={i / total}
                      end={(i + 1) / total}
                    >
                      <Screen />
                    </ScreenPanel>
                  ))}
                </PhoneShell>
              </div>
            </div>

            <div className="col-span-7 relative h-[360px]">
              {FEATURE_SLIDES.map((slide, i) => (
                <SlidePanel
                  key={i}
                  scrollYProgress={scrollYProgress}
                  start={i / total}
                  end={(i + 1) / total}
                  {...slide}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile stacked */}
      <div className="md:hidden bg-[#0E0805]" id="features-mobile">
        {FEATURE_SLIDES.map((slide, i) => {
          const Screen = SCREENS[i];
          return (
            <div key={i} className="px-5 py-10 sm:px-6 sm:py-16 border-b border-[#E6C39B]/8">
              <div className="flex justify-center mb-8">
                <PhoneShell className="w-[240px]" screenClassName="h-[440px]">
                  <Screen />
                </PhoneShell>
              </div>
              <div className="text-[10px] font-bold tracking-[2px] uppercase text-[#E6C39B] mb-2 font-mono">
                {slide.num} / 04
              </div>
              <h2 className="font-headline text-[32px] sm:text-[40px] text-[#E0D5C9] leading-[0.95] tracking-[-0.02em] mb-3 whitespace-pre-line">
                {slide.title}
              </h2>
              <p className="text-[14px] text-[#E0D5C9]/45 leading-[1.65] mb-4">{slide.body}</p>
              <div className="flex flex-wrap gap-2">
                {slide.tags.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E6C39B]/10 text-[#E6C39B] border border-[#E6C39B]/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
