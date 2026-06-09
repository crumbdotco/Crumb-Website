"use client";

import { motion, useReducedMotion } from "framer-motion";

// Crumb specs — irregular organic SVG chunk silhouettes radiating from phone area.
// 3-4 distinct hand-broken cookie fragment shapes + a couple of tiny speck shapes.
// Warm cocoa/tan palette to read as real cookie crumbs on the dark hero.

interface Particle {
  id: number;
  size: number;   // scale applied to the 20×20 viewBox shape
  x: number;      // percent horizontal start
  y: number;      // percent vertical start
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  opacity: number;
  rotate: number;
  shapeIndex: number; // 0-3 = chunk shapes, 4 = small speck
  color: string;
}

// Palette: visible against dark cocoa hero but subtle/premium
const COCOA_MID  = "rgba(120,72,40,VAL)";   // rich mid-cocoa
const COCOA_DARK = "rgba(90,50,25,VAL)";    // deeper cocoa
const TAN        = "rgba(195,148,95,VAL)";  // warm tan/biscuit
const CREAM      = "rgba(230,210,175,VAL)"; // light cream specks

function col(template: string, alpha: number) {
  return template.replace("VAL", String(alpha));
}

// 4 distinct crumb chunk outlines + 1 speck, all within a rough 20×20 conceptual box.
// Paths are hand-crafted irregular polygons / quadratic-curve blobby shapes
// that look like pieces snapped off a biscuit/cookie.
const CRUMB_PATHS = [
  // Shape 0 — broad irregular chunk, upper-left break
  "M 3,8 Q 1,4 4,2 Q 7,0 10,3 L 14,2 Q 17,3 18,7 Q 19,11 15,13 L 11,15 Q 7,16 5,13 Q 2,12 3,8 Z",
  // Shape 1 — thinner elongated shard, like a corner snapped off
  "M 1,9 Q 0,5 3,3 L 7,1 Q 11,0 13,4 L 14,7 Q 15,10 11,12 L 7,13 Q 3,14 1,9 Z",
  // Shape 2 — stubby wide chunk with a concave bite on one side
  "M 2,6 Q 1,2 5,1 L 10,0 Q 15,1 17,4 Q 19,7 16,10 Q 13,13 9,12 L 5,13 Q 1,11 2,6 Z",
  // Shape 3 — small irregular triangle-ish chip
  "M 4,2 Q 7,0 11,2 L 14,6 Q 15,10 11,12 Q 7,14 4,11 Q 1,8 4,2 Z",
  // Shape 4 — tiny near-round speck (crumb dust), but slightly lumpy
  "M 5,2 Q 9,0 12,3 Q 15,6 13,10 Q 11,13 7,13 Q 3,12 2,8 Q 0,4 5,2 Z",
];

// viewBox for each shape — all use "0 0 20 16" (rough bounding)
const PARTICLES: Particle[] = [
  // Bigger chunks radiate outward from phone position (~78-90% x, 45-65% y)
  { id: 0,  size: 9,  x: 78, y: 48, duration: 9,  delay: 0,    driftX: -44, driftY: -62, opacity: 0.55, rotate: 20,  shapeIndex: 0, color: col(TAN,       0.6) },
  { id: 1,  size: 5,  x: 82, y: 52, duration: 11, delay: 0.6,  driftX: 28,  driftY: -78, opacity: 0.40, rotate: -35, shapeIndex: 4, color: col(CREAM,     0.5) },
  { id: 2,  size: 11, x: 70, y: 55, duration: 8,  delay: 1.2,  driftX: -55, driftY: -45, opacity: 0.50, rotate: 48,  shapeIndex: 1, color: col(COCOA_MID, 0.55) },
  { id: 3,  size: 6,  x: 75, y: 45, duration: 13, delay: 0.3,  driftX: 35,  driftY: -68, opacity: 0.38, rotate: -15, shapeIndex: 4, color: col(CREAM,     0.45) },
  { id: 4,  size: 10, x: 85, y: 60, duration: 10, delay: 2,    driftX: -32, driftY: -54, opacity: 0.48, rotate: 62,  shapeIndex: 2, color: col(TAN,       0.55) },
  { id: 5,  size: 5,  x: 72, y: 40, duration: 12, delay: 1.5,  driftX: -22, driftY: -88, opacity: 0.35, rotate: 25,  shapeIndex: 4, color: col(CREAM,     0.40) },
  { id: 6,  size: 12, x: 90, y: 50, duration: 7,  delay: 0.9,  driftX: 44,  driftY: -42, opacity: 0.45, rotate: -40, shapeIndex: 3, color: col(COCOA_MID, 0.50) },
  { id: 7,  size: 7,  x: 65, y: 58, duration: 15, delay: 2.5,  driftX: -58, driftY: -36, opacity: 0.32, rotate: 18,  shapeIndex: 0, color: col(TAN,       0.42) },
  { id: 8,  size: 8,  x: 88, y: 42, duration: 9,  delay: 1.8,  driftX: 20,  driftY: -74, opacity: 0.52, rotate: -55, shapeIndex: 2, color: col(COCOA_DARK,0.55) },
  { id: 9,  size: 4,  x: 68, y: 62, duration: 11, delay: 0.4,  driftX: -26, driftY: -52, opacity: 0.36, rotate: 33,  shapeIndex: 4, color: col(CREAM,     0.38) },
  { id: 10, size: 10, x: 92, y: 55, duration: 8,  delay: 3,    driftX: 50,  driftY: -32, opacity: 0.42, rotate: -22, shapeIndex: 1, color: col(TAN,       0.48) },
  { id: 11, size: 6,  x: 74, y: 35, duration: 14, delay: 0.7,  driftX: -38, driftY: -84, opacity: 0.33, rotate: 70,  shapeIndex: 3, color: col(COCOA_MID, 0.42) },
  { id: 12, size: 5,  x: 80, y: 65, duration: 10, delay: 2.2,  driftX: 16,  driftY: -46, opacity: 0.46, rotate: -10, shapeIndex: 4, color: col(CREAM,     0.44) },
  { id: 13, size: 9,  x: 62, y: 50, duration: 12, delay: 1,    driftX: -46, driftY: -66, opacity: 0.28, rotate: 42,  shapeIndex: 2, color: col(TAN,       0.38) },
  { id: 14, size: 11, x: 95, y: 48, duration: 9,  delay: 3.5,  driftX: 58,  driftY: -50, opacity: 0.40, rotate: -30, shapeIndex: 0, color: col(COCOA_DARK,0.48) },
  { id: 15, size: 6,  x: 77, y: 70, duration: 11, delay: 1.3,  driftX: -36, driftY: -40, opacity: 0.36, rotate: 55,  shapeIndex: 3, color: col(TAN,       0.42) },
];

export function CrumbParticles() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0,
            rotate: p.rotate,
            // No layout-affecting props — transform/opacity only
          }}
          animate={{
            x: [0, p.driftX * 0.5, p.driftX],
            y: [0, p.driftY * 0.5, p.driftY],
            opacity: [0, p.opacity, p.opacity * 0.7, 0],
            rotate: [p.rotate, p.rotate + 55, p.rotate + 110],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: p.delay * 0.5,
            ease: "easeOut",
          }}
        >
          <svg
            viewBox="0 0 20 16"
            width={p.size}
            height={p.size}
            fill={p.color}
            style={{ display: "block" }}
          >
            <path d={CRUMB_PATHS[p.shapeIndex]} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
