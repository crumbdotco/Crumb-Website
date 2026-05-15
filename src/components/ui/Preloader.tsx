// src/components/ui/Preloader.tsx
'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export function Preloader() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(false);
      return;
    }

    // Wait for fonts + initial paint
    const fontsReady = (document as Document & { fonts?: FontFaceSet }).fonts?.ready ?? Promise.resolve();

    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(p + Math.random() * 18 + 4, 95);
      setProgress(p);
    }, 90);

    Promise.all([
      fontsReady,
      new Promise((r) => setTimeout(r, 1100)), // minimum 1.1s for design intent
    ]).then(() => {
      clearInterval(tick);
      setProgress(100);
      setTimeout(() => setVisible(false), 380);
    });

    return () => clearInterval(tick);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0E0805]"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-headline text-[14vw] md:text-[10vw] text-[#E6C39B] tracking-[0.05em] leading-none"
          >
            CRUMB
          </motion.div>
          <div className="mt-12 w-[180px] h-px bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-[#E6C39B] origin-left"
              animate={{ scaleX: progress / 100 }}
              transition={{ ease: 'easeOut', duration: 0.4 }}
            />
          </div>
          <div className="mt-3 font-mono text-[10px] tracking-[2px] text-[#E0D5C9]/35">
            {String(Math.floor(progress)).padStart(3, '0')}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
