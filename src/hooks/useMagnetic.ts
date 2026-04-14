"use client";
import { useRef, useCallback } from "react";

const isBrowser = typeof window !== "undefined";
const isTouch = isBrowser && "ontouchstart" in window;

export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const raf = useRef<number>(0);
  const rect = useRef<DOMRect | null>(null);

  const onMouseEnter = useCallback(() => {
    if (isTouch || !ref.current) return;
    rect.current = ref.current.getBoundingClientRect();
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (isTouch || !ref.current || !rect.current) return;
      if (raf.current) return; // throttle: 1 update per frame
      raf.current = requestAnimationFrame(() => {
        if (!ref.current || !rect.current) return;
        const x = e.clientX - rect.current.left - rect.current.width / 2;
        const y = e.clientY - rect.current.top - rect.current.height / 2;
        ref.current.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        raf.current = 0;
      });
    },
    [],
  );

  const onMouseLeave = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    rect.current = null;
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return { ref, onMouseEnter, onMouseMove, onMouseLeave };
}
