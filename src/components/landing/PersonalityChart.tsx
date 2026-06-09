"use client";

/**
 * PersonalityChart — Feature C visual
 * Animated donut/segment chart with food personality label.
 *
 * SWAP-SLOT: replace entire component return with real screenshot:
 *   return <Image src="/images/feature-personality.png" alt="Food personality screen" width={300} height={520} />;
 */

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { C, warmShadowDeep } from "./tokens";

interface PersonalityChartProps {
  fredokaClass: string;
  nunitoClass: string;
  inView: boolean;
}

const SEGMENTS = [
  { label: "Indian", pct: 34, color: C.accent },
  { label: "Italian", pct: 22, color: C.accentDeep },
  { label: "Japanese", pct: 18, color: "#8B7355" },
  { label: "American", pct: 14, color: "#5C4232" },
  { label: "Other", pct: 12, color: "#3E2723" },
];

// Round to fixed precision so server-rendered and client-rendered path strings
// are byte-identical (avoids React hydration mismatch on float drift).
const rnd = (n: number) => Number(n.toFixed(3));

function polarToXY(angleDeg: number, radius: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: rnd(cx + radius * Math.cos(rad)), y: rnd(cy + radius * Math.sin(rad)) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarToXY(startDeg, r, cx, cy);
  const end = polarToXY(endDeg, r, cx, cy);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function PersonalityChart({ fredokaClass, nunitoClass, inView }: PersonalityChartProps) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Build donut paths
  let cumulativeDeg = 0;
  const paths = SEGMENTS.map((seg) => {
    const startDeg = cumulativeDeg;
    const spanDeg = (seg.pct / 100) * 360;
    cumulativeDeg += spanDeg;
    return { ...seg, startDeg, endDeg: cumulativeDeg };
  });

  const cx = 80;
  const cy = 80;
  const r = 64;
  const innerR = 42;

  return (
    <div
      ref={canvasRef}
      style={{
        width: "min(300px, 88vw)",
        borderRadius: 28,
        background: `linear-gradient(145deg, ${C.heroPanel} 0%, ${C.heroDark} 100%)`,
        border: `1.5px solid rgba(230,195,155,0.16)`,
        boxShadow: warmShadowDeep,
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Card label */}
      <div
        className={nunitoClass}
        style={{ fontSize: 11, fontWeight: 700, color: C.accentDeep, letterSpacing: 0 }}
      >
        Food personality
      </div>

      {/* Donut chart row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* SVG Donut */}
        <div style={{ position: "relative", flexShrink: 0, width: 160, height: 160 }}>
          <svg width="160" height="160" viewBox="0 0 160 160" overflow="visible">
            {paths.map((seg, i) => (
              <motion.path
                key={seg.label}
                d={describeArc(cx, cy, r, seg.startDeg, seg.endDeg)}
                fill={seg.color}
                initial={reduced ? {} : { opacity: 0, scale: 0.7 }}
                animate={inView ? { opacity: 1, scale: 1 } : (reduced ? {} : { opacity: 0, scale: 0.7 })}
                transition={{ delay: 0.15 + i * 0.09, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            ))}
            {/* Inner cutout */}
            <circle cx={cx} cy={cy} r={innerR} fill={C.heroPanel} />
            {/* Center label */}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fill={C.onHero}
              fontSize="11"
              fontWeight="700"
              fontFamily="var(--font-nunito), sans-serif"
            >
              34%
            </text>
            <text
              x={cx}
              y={cy + 9}
              textAnchor="middle"
              fill={C.onHeroSoft}
              fontSize="9"
              fontWeight="600"
              fontFamily="var(--font-nunito), sans-serif"
            >
              Indian
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
          {SEGMENTS.map((seg, i) => (
            <motion.div
              key={seg.label}
              initial={reduced ? {} : { opacity: 0, x: 12 }}
              animate={inView ? { opacity: 1, x: 0 } : (reduced ? {} : { opacity: 0, x: 12 })}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", alignItems: "center", gap: 7 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: seg.color,
                  flexShrink: 0,
                }}
              />
              <span
                className={nunitoClass}
                style={{ fontSize: 11, color: C.onHeroSoft, fontWeight: 600, flex: 1 }}
              >
                {seg.label}
              </span>
              <span
                className={nunitoClass}
                style={{ fontSize: 11, color: C.mutedOnDark, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
              >
                {seg.pct}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Personality type chip */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : (reduced ? {} : { opacity: 0, y: 10 })}
        transition={{ delay: 0.7, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backgroundColor: "rgba(230,195,155,0.10)",
          border: `1px solid rgba(230,195,155,0.22)`,
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 24, flexShrink: 0 }}>🌍</div>
        <div>
          <div
            className={nunitoClass}
            style={{ fontSize: 10, color: C.mutedOnDark, fontWeight: 600, marginBottom: 2 }}
          >
            Your food personality
          </div>
          <div
            className={fredokaClass}
            style={{ fontSize: 18, fontWeight: 600, color: C.onHero, lineHeight: 1 }}
          >
            The Explorer
          </div>
        </div>
      </motion.div>
    </div>
  );
}
