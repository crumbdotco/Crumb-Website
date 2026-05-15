'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';

interface ScreenPanelProps {
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
  children: React.ReactNode;
}

export function ScreenPanel({ scrollYProgress, start, end, children }: ScreenPanelProps) {
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.04, end - 0.04, end],
    [0, 1, 1, 0]
  );
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}
