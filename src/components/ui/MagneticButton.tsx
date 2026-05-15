'use client';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { cn } from '@/lib/utils';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  strength = 0.25,
  ...rest
}: MagneticButtonProps) {
  const { ref, x, y } = useMouseParallax(strength);
  const localRef = useRef<HTMLButtonElement | null>(null);

  return (
    <motion.button
      ref={(node) => {
        localRef.current = node;
        if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }}
      style={{ x, y }}
      data-cursor="pointer"
      className={cn('relative will-change-transform', className)}
      {...(rest as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
