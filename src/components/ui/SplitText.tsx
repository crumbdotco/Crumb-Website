'use client';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  staggerDelay?: number;
  baseDelay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function SplitText({
  text,
  className = '',
  wordClassName = '',
  staggerDelay = 0.07,
  baseDelay = 0,
  as: As = 'span',
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();

  const words = text.split(' ');

  return (
    <As ref={ref as React.Ref<HTMLElement & HTMLHeadingElement & HTMLParagraphElement>} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <motion.span
            className={`inline-block ${wordClassName}`}
            initial={reduce ? { opacity: 0 } : { y: '105%' }}
            animate={inView ? (reduce ? { opacity: 1 } : { y: '0%' }) : undefined}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
              delay: baseDelay + i * staggerDelay,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </As>
  );
}
