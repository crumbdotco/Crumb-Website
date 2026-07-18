"use client";

/**
 * ReviewCard - Feature B visual: Reviews
 * User's personal restaurant review card: restaurant header, star rating, note, and other rated places.
 * SWAP-SLOT: replace entire component return with real screenshot:
 *   return <Image src="/images/feature-reviews.png" alt="Reviews screen" width={320} height={420} />;
 */

import { motion, useReducedMotion } from "framer-motion";
import { Star, Note } from "@phosphor-icons/react";
import { C, warmShadowDeep } from "./tokens";

interface ReviewCardProps {
  fredokaClass: string;
  nunitoClass: string;
  inView: boolean;
}

const MAIN_REVIEW = {
  emoji: "🍗",
  name: "Nando's",
  tag: "Portuguese",
  rating: 4.0,
  note: "Best wings in the city. Getting it again.",
};

const OTHER_REVIEWS = [
  { emoji: "🍜", name: "Shoryu Ramen", tag: "Japanese", rating: 4.5 },
  { emoji: "🥟", name: "Bao", tag: "Taiwanese", rating: 5.0 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          weight={n <= Math.round(rating) ? "fill" : "regular"}
          color={n <= Math.round(rating) ? C.accent : C.mutedOnDark}
          style={{ opacity: n <= Math.round(rating) ? 1 : 0.4 }}
        />
      ))}
      <span
        style={{
          fontSize: 11,
          color: C.mutedOnDark,
          fontWeight: 700,
          marginLeft: 4,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function ReviewCard({ fredokaClass, nunitoClass, inView }: ReviewCardProps) {
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

      {/* Restaurant header row */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: -8 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: "rgba(230,195,155,0.10)",
            border: `1px solid rgba(230,195,155,0.14)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {MAIN_REVIEW.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={fredokaClass} style={{ fontSize: 17, fontWeight: 600, color: C.onHero, lineHeight: 1.1 }}>
            {MAIN_REVIEW.name}
          </div>
          <div
            className={nunitoClass}
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.accentDeep,
              backgroundColor: "rgba(230,195,155,0.08)",
              borderRadius: 999,
              paddingInline: 8,
              paddingBlock: 3,
              border: `1px solid rgba(230,195,155,0.14)`,
              display: "inline-block",
              marginTop: 4,
            }}
          >
            {MAIN_REVIEW.tag}
          </div>
        </div>
      </motion.div>

      {/* Star rating row */}
      <motion.div
        initial={reduced ? false : { opacity: 0, x: -10 }}
        animate={inView ? { opacity: 1, x: 0 } : reduced ? {} : { opacity: 0, x: -10 }}
        transition={{ delay: 0.2, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          border: `1px solid rgba(230,195,155,0.09)`,
          padding: "10px 13px",
        }}
      >
        <Star size={15} weight="fill" color={C.accent} style={{ flexShrink: 0 }} />
        <span className={nunitoClass} style={{ fontSize: 12, fontWeight: 700, color: C.onHeroSoft }}>
          Your rating
        </span>
        <div style={{ marginLeft: "auto" }}>
          <StarRating rating={MAIN_REVIEW.rating} />
        </div>
      </motion.div>

      {/* Note block */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 10 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backgroundColor: "rgba(230,195,155,0.05)",
          borderRadius: 14,
          border: `1px solid rgba(230,195,155,0.11)`,
          padding: "12px 14px",
          display: "flex",
          alignItems: "flex-start",
          gap: 9,
        }}
      >
        <Note size={14} weight="fill" color={C.accentDeep} style={{ flexShrink: 0, marginTop: 1 }} />
        <span
          className={nunitoClass}
          style={{ fontSize: 12, fontWeight: 600, color: C.onHeroSoft, lineHeight: 1.55, fontStyle: "italic" }}
        >
          &ldquo;{MAIN_REVIEW.note}&rdquo;
        </span>
      </motion.div>

      {/* Section label */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={inView ? { opacity: 1 } : reduced ? {} : { opacity: 0 }}
        transition={{ delay: 0.38, duration: 0.3 }}
        className={nunitoClass}
        style={{ fontSize: 11, fontWeight: 700, color: C.accentDeep }}
      >
        Also rated
      </motion.div>

      {/* Other rated places list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {OTHER_REVIEWS.map((r, i) => (
          <motion.div
            key={r.name}
            initial={reduced ? false : { opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : reduced ? {} : { opacity: 0, x: -12 }}
            transition={{ delay: 0.44 + i * 0.1, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
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
            <span style={{ fontSize: 18, flexShrink: 0 }}>{r.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={nunitoClass} style={{ fontSize: 12, fontWeight: 700, color: C.onHero, lineHeight: 1.2 }}>
                {r.name}
              </div>
              <div className={nunitoClass} style={{ fontSize: 10, color: C.mutedOnDark, fontWeight: 600, marginTop: 2 }}>
                {r.tag}
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <StarRating rating={r.rating} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
