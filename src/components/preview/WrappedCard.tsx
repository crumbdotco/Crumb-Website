"use client";

/**
 * WrappedCard — Feature B visual: Annual Wrapped recap
 * Dark gradient card, count-only stats, no money figures.
 * SWAP-SLOT: replace entire card with:
 *   <Image src="/images/feature-wrapped.png" alt="Crumbify Wrapped recap" width={380} height={460} style={{ borderRadius: 28 }} />
 */

import { motion, useReducedMotion } from "framer-motion";
import { C, warmShadowDeep } from "./tokens";

interface WrappedCardProps {
  fredokaClass: string;
  nunitoClass: string;
  inView: boolean;
}

const STATS = [
  { label: "Orders this year", value: "147", emoji: "📦" },
  { label: "Unique restaurants", value: "38", emoji: "🍽️" },
  { label: "Top spot", value: "Nando's", emoji: "🍗" },
  { label: "Food soulmate", value: "92%", emoji: "💛" },
];

export function WrappedCard({ fredokaClass, nunitoClass, inView }: WrappedCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.88, y: 40 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : reduced ? {} : { opacity: 0, scale: 0.88, y: 40 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: "min(380px, 92vw)",
        borderRadius: 28,
        background: `linear-gradient(145deg, ${C.heroPanel} 0%, ${C.heroDeep} 100%)`,
        border: `1.5px solid rgba(230,195,155,0.20)`,
        padding: "28px 24px",
        boxShadow: warmShadowDeep,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top sheen line */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(230,195,155,0.28), transparent)`,
        }}
      />

      {/* Card header */}
      <div style={{ marginBottom: 20 }}>
        <div
          className={nunitoClass}
          style={{ fontSize: 11, fontWeight: 700, color: C.accentDeep, marginBottom: 6, letterSpacing: 0 }}
        >
          Your 2025 in food
        </div>
        <div
          className={fredokaClass}
          style={{ fontSize: 30, fontWeight: 600, color: C.onHero, lineHeight: 1, letterSpacing: "-0.01em" }}
        >
          Crumbify Wrapped
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 16 }}
            transition={{ delay: 0.18 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 14,
              border: `1px solid rgba(230,195,155,0.12)`,
              padding: "13px 13px",
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 5 }}>{stat.emoji}</div>
            <div
              className={fredokaClass}
              style={{
                fontSize: stat.value.length > 4 ? 19 : 26,
                fontWeight: 600,
                color: C.onHero,
                lineHeight: 1,
                marginBottom: 4,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stat.value}
            </div>
            <div
              className={nunitoClass}
              style={{ fontSize: 10, color: C.mutedOnDark, fontWeight: 600, lineHeight: 1.3 }}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top cuisine highlight */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={inView ? { opacity: 1 } : reduced ? {} : { opacity: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        style={{
          marginTop: 12,
          backgroundColor: "rgba(201,160,119,0.10)",
          borderRadius: 14,
          border: `1px solid rgba(230,195,155,0.20)`,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className={nunitoClass} style={{ fontSize: 10, color: C.mutedOnDark, fontWeight: 600, marginBottom: 3 }}>
            Most ordered cuisine
          </div>
          <div className={fredokaClass} style={{ fontSize: 17, fontWeight: 600, color: C.onHero }}>
            Indian 🍛
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={nunitoClass} style={{ fontSize: 10, color: C.mutedOnDark, fontWeight: 600, marginBottom: 3 }}>
            of your orders
          </div>
          <div
            className={fredokaClass}
            style={{ fontSize: 24, fontWeight: 600, color: C.accentDeep, fontVariantNumeric: "tabular-nums" }}
          >
            34%
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
