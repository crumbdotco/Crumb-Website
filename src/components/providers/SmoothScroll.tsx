'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { SmoothScrollContext } from './SmoothScrollContext';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    setLenis(instance);
    return () => {
      cancelAnimationFrame(rafId);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis, wrapperRef }}>
      <div ref={wrapperRef}>{children}</div>
    </SmoothScrollContext.Provider>
  );
}
