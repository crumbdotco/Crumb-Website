"use client";
import { motion } from "framer-motion";

function generateLines(width: number, height: number, count: number): string[] {
  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const baseY = (i / (count - 1)) * height;
    const amp1 = 15 + (i % 3) * 10;
    const amp2 = 10 + ((i + 1) % 4) * 8;
    const phase = (i * 37) % 100;
    let d = `M -50 ${baseY}`;
    const segments = 12;
    for (let j = 1; j <= segments; j++) {
      const x = (j / segments) * (width * 2 + 100) - 50;
      const t = j / segments;
      const y =
        baseY +
        Math.sin(t * Math.PI * 2 + phase * 0.1) * amp1 +
        Math.cos(t * Math.PI * 3 + phase * 0.15) * amp2;
      d += ` Q ${x - 40} ${y + (j % 2 ? 8 : -8)}, ${x} ${y}`;
    }
    paths.push(d);
  }
  return paths;
}

const lines = generateLines(1920, 1080, 15);

export function FlowingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.svg
        className="w-[200%] h-full will-change-transform"
        viewBox="0 0 3840 1080"
        preserveAspectRatio="none"
        animate={{ x: [0, -1920] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {lines.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="rgba(180,160,140,0.15)"
            strokeWidth={1.5}
            fill="none"
          />
        ))}
      </motion.svg>
    </div>
  );
}
