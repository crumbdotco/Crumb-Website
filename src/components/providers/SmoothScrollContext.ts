'use client';
import { createContext } from 'react';
import type Lenis from 'lenis';

export interface SmoothScrollContextValue {
  lenis: Lenis | null;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}

export const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  wrapperRef: { current: null },
});
