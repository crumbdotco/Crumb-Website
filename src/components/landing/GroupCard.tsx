"use client";

/**
 * GroupCard — Feature C visual: Groups
 * Group card with member avatars, shared Want-to-Try list, and ratings.
 * SWAP-SLOT: replace entire component return with real screenshot:
 *   return <Image src="/images/feature-groups.png" alt="Groups screen" width={320} height={400} style={{ borderRadius: 24 }} />;
 */

import { motion, useReducedMotion } from "framer-motion";
import { Star, Users, MapPin } from "@phosphor-icons/react";
import { C, warmShadowDeep } from "./tokens";

interface GroupCardProps {
  fredokaClass: string;
  nunitoClass: string;
  inView: boolean;
}

const WANT_TO_TRY = [
  { emoji: "🍜", name: "Bone Daddies", tag: "Ramen", avgRating: 4.8 },
  { emoji: "🥟", name: "Bao", tag: "Taiwanese", avgRating: 4.6 },
  { emoji: "🍕", name: "Homeslice", tag: "Pizza", avgRating: 4.5 },
];

const MEMBERS = ["🧑", "👩", "🧔", "👱"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={10}
          weight={n <= Math.round(rating) ? "fill" : "regular"}
          color={n <= Math.round(rating) ? C.accent : C.mutedOnDark}
          style={{ opacity: n <= Math.round(rating) ? 1 : 0.4 }}
        />
      ))}
      <span
        style={{
          fontSize: 10,
          color: C.mutedOnDark,
          fontWeight: 700,
          marginLeft: 3,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function GroupCard({ fredokaClass, nunitoClass, inView }: GroupCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.92, y: 32 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : reduced ? {} : { opacity: 0, scale: 0.92, y: 32 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: "min(340px, 92vw)",
        borderRadius: 24,
        background: `linear-gradient(150deg, ${C.heroPanel} 0%, ${C.heroDark} 100%)`,
        border: `1.5px solid rgba(230,195,155,0.16)`,
        boxShadow: warmShadowDeep,
        padding: "20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top sheen */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(230,195,155,0.22), transparent)`,
        }}
      />

      {/* Group header */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: -8 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div>
          <div className={fredokaClass} style={{ fontSize: 17, fontWeight: 600, color: C.onHero, lineHeight: 1.1 }}>
            Uni Crew
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}
          >
            <Users size={12} color={C.mutedOnDark} weight="fill" />
            <span className={nunitoClass} style={{ fontSize: 11, color: C.mutedOnDark, fontWeight: 600 }}>
              4 members
            </span>
          </div>
        </div>
        {/* Member stack */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {MEMBERS.map((m, i) => (
            <div
              key={i}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                backgroundColor: i % 2 === 0 ? "rgba(230,195,155,0.12)" : "rgba(201,160,119,0.10)",
                border: `2px solid ${C.heroDark}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                marginLeft: i === 0 ? 0 : -8,
                zIndex: MEMBERS.length - i,
                position: "relative",
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section label */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={inView ? { opacity: 1 } : reduced ? {} : { opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <MapPin size={13} color={C.accentDeep} weight="fill" />
        <span className={nunitoClass} style={{ fontSize: 11, fontWeight: 700, color: C.accentDeep }}>
          Want to Try
        </span>
      </motion.div>

      {/* Restaurant list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {WANT_TO_TRY.map((r, i) => (
          <motion.div
            key={r.name}
            initial={reduced ? false : { opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : reduced ? {} : { opacity: 0, x: -12 }}
            transition={{ delay: 0.25 + i * 0.1, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              borderRadius: 14,
              border: `1px solid rgba(230,195,155,0.09)`,
              padding: "11px 13px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{r.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={nunitoClass} style={{ fontSize: 12, fontWeight: 700, color: C.onHero, lineHeight: 1.2 }}>
                {r.name}
              </div>
              <div className={nunitoClass} style={{ fontSize: 10, color: C.mutedOnDark, fontWeight: 600, marginTop: 2 }}>
                {r.tag}
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <StarRating rating={r.avgRating} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom add button hint */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 8 }}
        transition={{ delay: 0.58, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(230,195,155,0.06)",
          borderRadius: 14,
          border: `1px dashed rgba(230,195,155,0.18)`,
          padding: "11px 14px",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            backgroundColor: "rgba(230,195,155,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 13, color: C.accent, fontWeight: 700, lineHeight: 1 }}>+</span>
        </div>
        <span className={nunitoClass} style={{ fontSize: 12, color: C.mutedOnDark, fontWeight: 600 }}>
          Add a restaurant to try
        </span>
      </motion.div>
    </motion.div>
  );
}
