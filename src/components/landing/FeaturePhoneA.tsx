"use client";

/**
 * FeaturePhoneA — Feature A visual: Top Restaurants + Cuisine Breakdown
 * Dark-themed phone frame with animated bar rankings.
 * SWAP-SLOT: replace the inner div contents with:
 *   <Image src="/images/feature-restaurants.png" alt="Top Restaurants screen" width={280} height={500} style={{ borderRadius: 34 }} />
 */

import { motion, useReducedMotion } from "framer-motion";
import { C, warmShadowDeep } from "./tokens";

interface FeaturePhoneAProps {
  fredokaClass: string;
  nunitoClass: string;
  inView: boolean;
}

const RESTAURANTS = [
  { emoji: "🍗", name: "Nando's", cuisine: "Portuguese chicken", visits: 21, rank: 1 },
  { emoji: "🍕", name: "Pizza Express", cuisine: "Italian", visits: 14, rank: 2 },
  { emoji: "🍜", name: "Wagamama", cuisine: "Japanese", visits: 11, rank: 3 },
  { emoji: "🥘", name: "Dishoom", cuisine: "Indian", visits: 9, rank: 4 },
  { emoji: "🍔", name: "Five Guys", cuisine: "American", visits: 7, rank: 5 },
];

const MAX_VISITS = 21;

const BAR_COLORS = [C.accent, C.accentDeep, "#8B7355", "#6B5340", "#4E3829"];

export function FeaturePhoneA({ fredokaClass, nunitoClass, inView }: FeaturePhoneAProps) {
  const reduced = useReducedMotion();

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Pedestal glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "75%",
          height: 32,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, rgba(230,195,155,0.10) 0%, transparent 80%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(290px, 88vw)",
          borderRadius: 44,
          border: `10px solid #2E1E14`,
          backgroundColor: C.heroDark,
          overflow: "hidden",
          boxShadow: warmShadowDeep,
          flexShrink: 0,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            backgroundColor: C.heroDark,
            paddingTop: 12,
            paddingInline: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <span className={nunitoClass} style={{ fontSize: 11, fontWeight: 600, color: C.mutedOnDark }}>
            9:41
          </span>
          {/* Dynamic island */}
          <div
            style={{
              width: 80,
              height: 26,
              borderRadius: 13,
              backgroundColor: "#0E0805",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 8,
            }}
          />
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[3, 5, 7].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: h,
                  borderRadius: 1.5,
                  backgroundColor: C.mutedOnDark,
                  opacity: 0.7,
                  alignSelf: "flex-end",
                }}
              />
            ))}
            <div
              style={{
                width: 17,
                height: 9,
                borderRadius: 2,
                border: `1px solid ${C.mutedOnDark}`,
                position: "relative",
                opacity: 0.7,
                marginLeft: 2,
              }}
            >
              <div style={{ position: "absolute", inset: "1.5px 2.5px", borderRadius: 1, backgroundColor: C.mutedOnDark }} />
              <div
                style={{
                  position: "absolute",
                  right: -3,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 2,
                  height: 5,
                  borderRadius: 1,
                  backgroundColor: C.mutedOnDark,
                }}
              />
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div
          style={{
            backgroundColor: C.heroDark,
            padding: "8px 14px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 2 }}>
            <span className={nunitoClass} style={{ fontSize: 13, fontWeight: 700, color: C.onHeroSoft }}>
              Top Restaurants
            </span>
            <span
              className={nunitoClass}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.heroDeep,
                backgroundColor: C.accent,
                borderRadius: 20,
                paddingInline: 9,
                paddingBlock: 3,
              }}
            >
              All time
            </span>
          </div>

          {/* Restaurant rows with animated bars */}
          {RESTAURANTS.map((r, i) => {
            const barPct = (r.visits / MAX_VISITS) * 100;
            return (
              <motion.div
                key={r.name}
                initial={reduced ? {} : { opacity: 0, x: -14 }}
                animate={
                  inView
                    ? { opacity: 1, x: 0 }
                    : reduced
                    ? {}
                    : { opacity: 0, x: -14 }
                }
                transition={{ delay: 0.08 + i * 0.09, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  backgroundColor: C.heroPanel,
                  borderRadius: 14,
                  border: `1px solid rgba(230,195,155,0.08)`,
                  padding: "9px 11px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    className={fredokaClass}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.accent,
                      width: 14,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {r.rank}
                  </span>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{r.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className={nunitoClass}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.onHero,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.name}
                    </div>
                    <div className={nunitoClass} style={{ fontSize: 9, color: C.mutedOnDark, marginTop: 1, fontWeight: 600 }}>
                      {r.cuisine}
                    </div>
                  </div>
                  <div
                    className={nunitoClass}
                    style={{ fontSize: 10, color: C.accentDeep, fontWeight: 700, flexShrink: 0 }}
                  >
                    {r.visits}
                  </div>
                </div>

                {/* Animated bar */}
                <div
                  style={{
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: "rgba(230,195,155,0.08)",
                    overflow: "hidden",
                    marginLeft: 22,
                  }}
                >
                  <motion.div
                    initial={reduced ? {} : { width: "0%" }}
                    animate={inView ? { width: `${barPct}%` } : reduced ? {} : { width: "0%" }}
                    transition={{ delay: 0.2 + i * 0.09, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      backgroundColor: BAR_COLORS[i] ?? C.accent,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
