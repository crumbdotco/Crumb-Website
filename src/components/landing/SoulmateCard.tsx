"use client";

/**
 * SoulmateCard — Feature D visual
 * Two avatar bubbles + big match % + shared favourites rows.
 *
 * SWAP-SLOT: replace entire component return with real screenshot:
 *   return <Image src="/images/feature-soulmate.png" alt="Food soulmate screen" width={300} height={420} />;
 */

import { motion, useReducedMotion } from "framer-motion";
import { C, warmShadowDeep } from "./tokens";

interface SoulmateCardProps {
  fredokaClass: string;
  nunitoClass: string;
  inView: boolean;
}

const SHARED = [
  { emoji: "🍗", name: "Nando's", label: "Chicken joint" },
  { emoji: "🍛", name: "Indian", label: "Cuisine" },
  { emoji: "🕙", name: "Late night", label: "Order window" },
];

export function SoulmateCard({ fredokaClass, nunitoClass, inView }: SoulmateCardProps) {
  const reduced = useReducedMotion();

  return (
    <div
      style={{
        width: "min(320px, 90vw)",
        borderRadius: 28,
        background: `linear-gradient(160deg, ${C.heroPanel} 0%, ${C.heroDark} 100%)`,
        border: `1.5px solid rgba(230,195,155,0.16)`,
        boxShadow: warmShadowDeep,
        padding: "26px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        flexShrink: 0,
      }}
    >
      {/* Card label */}
      <div
        className={nunitoClass}
        style={{ fontSize: 11, fontWeight: 700, color: C.accentDeep, letterSpacing: 0 }}
      >
        Food soulmate
      </div>

      {/* Avatars + match % */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
        {/* Avatar A */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : (reduced ? {} : { opacity: 0, x: -20 })}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.accentDeep} 0%, ${C.cocoa} 100%)`,
            border: `3px solid ${C.heroPanel}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            position: "relative",
            zIndex: 2,
          }}
        >
          🧑
        </motion.div>

        {/* Match score bubble */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, scale: 0.6 }}
          animate={inView ? { opacity: 1, scale: 1 } : (reduced ? {} : { opacity: 0, scale: 0.6 })}
          transition={{ delay: 0.25, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: C.accent,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 3,
            marginInline: -8,
            boxShadow: `0 4px 16px rgba(230,195,155,0.28), 0 2px 6px rgba(0,0,0,0.3)`,
          }}
        >
          <div
            className={fredokaClass}
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: C.heroDeep,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            92%
          </div>
          <div
            className={nunitoClass}
            style={{ fontSize: 8, color: C.heroDeep, fontWeight: 700, marginTop: 1 }}
          >
            match
          </div>
        </motion.div>

        {/* Avatar B */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, x: 20 }}
          animate={inView ? { opacity: 1, x: 0 } : (reduced ? {} : { opacity: 0, x: 20 })}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `linear-gradient(135deg, #8B7355 0%, ${C.cocoa} 100%)`,
            border: `3px solid ${C.heroPanel}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            position: "relative",
            zIndex: 2,
          }}
        >
          👩
        </motion.div>
      </div>

      {/* Names */}
      <div style={{ textAlign: "center" }}>
        <div
          className={fredokaClass}
          style={{ fontSize: 16, fontWeight: 600, color: C.onHero, lineHeight: 1.2 }}
        >
          You and Jamie
        </div>
        <div
          className={nunitoClass}
          style={{ fontSize: 12, color: C.onHeroSoft, fontWeight: 600, marginTop: 3 }}
        >
          Your closest food soulmate
        </div>
      </div>

      {/* Shared favourites */}
      <div
        style={{
          backgroundColor: "rgba(230,195,155,0.06)",
          borderRadius: 16,
          border: `1px solid rgba(230,195,155,0.14)`,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div
          className={nunitoClass}
          style={{ fontSize: 10, color: C.mutedOnDark, fontWeight: 700, marginBottom: 2 }}
        >
          Shared favourites
        </div>
        {SHARED.map((s, i) => (
          <motion.div
            key={s.name}
            initial={reduced ? {} : { opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : (reduced ? {} : { opacity: 0, x: -10 })}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", alignItems: "center", gap: 9 }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{s.emoji}</span>
            <span
              className={nunitoClass}
              style={{ fontSize: 12, fontWeight: 700, color: C.onHero, flex: 1 }}
            >
              {s.name}
            </span>
            <span
              className={nunitoClass}
              style={{ fontSize: 11, color: C.mutedOnDark, fontWeight: 600 }}
            >
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
