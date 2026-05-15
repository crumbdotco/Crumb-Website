// src/components/ui/CustomCursor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Touch device → never enable
    const isTouch = matchMedia('(hover: none) or (pointer: coarse)').matches;
    if (isTouch) return;

    // Reduced motion → no cursor (system cursor is more predictable)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    const onEnter = () => {
      ring.dataset.state = 'hover';
    };
    const onLeave = () => {
      ring.dataset.state = '';
    };

    let raf: number;
    const animate = () => {
      dot.style.transform = `translate3d(${pos.x - 4}px, ${pos.y - 4}px, 0)`;
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x - 18}px, ${ringPos.y - 18}px, 0)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const interactiveSelector = 'a, button, [role="button"], [data-cursor="pointer"]';
    const refreshTargets = () => {
      document.querySelectorAll(interactiveSelector).forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    refreshTargets();

    // Re-bind on route change / DOM mutation
    const obs = new MutationObserver(refreshTargets);
    obs.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove);
    document.documentElement.dataset.customCursor = 'on';

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      obs.disconnect();
      delete document.documentElement.dataset.customCursor;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-2 h-2 rounded-full bg-[#E6C39B]"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        data-state=""
        className="pointer-events-none fixed top-0 left-0 z-[9998] w-9 h-9 rounded-full border border-[#E6C39B]/40 transition-[width,height,opacity,border-color] duration-200 data-[state=hover]:w-16 data-[state=hover]:h-16 data-[state=hover]:border-[#E6C39B]/70 data-[state=hover]:opacity-60"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
