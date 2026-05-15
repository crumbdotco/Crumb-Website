'use client';
import { useContext, useEffect } from 'react';
import { useMotionValue, type MotionValue } from 'framer-motion';
import { SmoothScrollContext } from '@/components/providers/SmoothScrollContext';

/**
 * Returns a MotionValue<number> updated with Lenis scroll position (px).
 * Use this where you'd normally use `useScroll().scrollY`.
 */
export function useLenisScroll(): MotionValue<number> {
  const { lenis } = useContext(SmoothScrollContext);
  const scrollY = useMotionValue(0);

  useEffect(() => {
    if (!lenis) return;
    const off = lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      scrollY.set(scroll);
    });
    return () => { (off as unknown as () => void)?.(); };
  }, [lenis, scrollY]);

  return scrollY;
}
