'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';

interface SlidePanelProps {
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
  num: string;
  title: string;
  body: string;
  tags: string[];
}

export function SlidePanel({ scrollYProgress, start, end, num, title, body, tags }: SlidePanelProps) {
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.04, end - 0.06, end - 0.02],
    [0, 1, 1, 0]
  );
  const y = useTransform(scrollYProgress, [start, start + 0.05], [40, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#E6C39B] mb-3 font-mono">
        {num} / 04
      </div>
      <h2 className="font-headline text-[clamp(42px,5vw,68px)] text-[#E0D5C9] leading-[0.92] tracking-[-0.02em] mb-5 whitespace-pre-line">
        {title}
      </h2>
      <p className="text-[14px] leading-[1.65] text-[#E0D5C9]/45 max-w-[340px] mb-5">{body}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E6C39B]/10 text-[#E6C39B] border border-[#E6C39B]/20"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
