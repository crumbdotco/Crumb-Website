"use client";

/**
 * DiscoverCard — Feature D visual: Discover Scroll
 * Swipeable recommendation card stack — main card + peek of card behind.
 * SWAP-SLOT: replace entire component return with real screenshot:
 *   return <Image src="/images/feature-discover.png" alt="Discover screen" width={300} height={380} style={{ borderRadius: 24 }} />;
 */

import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Percent, Sparkle } from "@phosphor-icons/react";
import { C, warmShadowDeep } from "./tokens";

interface DiscoverCardProps {
  fredokaClass: string;
  nunitoClass: string;
  inView: boolean;
}

const CARD_DATA = [
  {
    emoji: "🍜",
    name: "Shoryu Ramen",
    tag: "Japanese",
    matchPct: 94,
    location: "Soho, London",
  },
  {
    emoji: "🌮",
    name: "Breddos Tacos",
    tag: "Mexican",
    matchPct: 88,
    location: "Clerkenwell",
  },
];

export function DiscoverCard({ fredokaClass, nunitoClass, inView }: DiscoverCardProps) {
  const reduced = useReducedMotion();

  const [main, behind] = CARD_DATA;

  return (
    <div style={{ position: "relative", width: "min(300px, 88vw)", flexShrink: 0 }}>
      {/* Card peeking behind */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.88 }}
        animate={inView ? { opacity: 1, scale: 0.94 } : reduced ? {} : { opacity: 0, scale: 0.88 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          bottom: -14,
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          borderRadius: 24,
          background: `linear-gradient(145deg, rgba(46,30,20,0.9) 0%, rgba(36,23,18,0.95) 100%)`,
          border: `1.5px solid rgba(230,195,155,0.09)`,
          height: 72,
          zIndex: 0,
          display: "flex",
          alignItems: "center",
          paddingInline: 20,
          gap: 12,
        }}
      >
        <span style={{ fontSize: 22, opacity: 0.7 }}>{behind.emoji}</span>
        <div>
          <div className={nunitoClass} style={{ fontSize: 12, fontWeight: 700, color: C.onHeroSoft, opacity: 0.7 }}>
            {behind.name}
          </div>
          <div className={nunitoClass} style={{ fontSize: 10, color: C.mutedOnDark, fontWeight: 600, opacity: 0.6 }}>
            {behind.tag}
          </div>
        </div>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 32, scale: 0.9 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : reduced ? {} : { opacity: 0, y: 32, scale: 0.9 }}
        transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: 24,
          background: `linear-gradient(150deg, ${C.heroPanel} 0%, ${C.heroDark} 100%)`,
          border: `1.5px solid rgba(230,195,155,0.18)`,
          boxShadow: warmShadowDeep,
          padding: "22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
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
            background: `linear-gradient(90deg, transparent, rgba(230,195,155,0.26), transparent)`,
          }}
        />

        {/* "For You" chip */}
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -10 }}
          animate={inView ? { opacity: 1, x: 0 } : reduced ? {} : { opacity: 0, x: -10 }}
          transition={{ delay: 0.18, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Sparkle size={13} color={C.accent} weight="fill" />
          <span className={nunitoClass} style={{ fontSize: 11, fontWeight: 700, color: C.accentDeep }}>
            Picked for you
          </span>
        </motion.div>

        {/* Restaurant hero block */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 12 }}
          transition={{ delay: 0.24, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: 16,
            height: 120,
            background: `linear-gradient(145deg, rgba(62,39,35,0.8) 0%, rgba(46,30,20,0.95) 100%)`,
            border: `1px solid rgba(230,195,155,0.10)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
          }}
        >
          {main.emoji}
        </motion.div>

        {/* Name + location */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 10 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", flexDirection: "column", gap: 6 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div className={fredokaClass} style={{ fontSize: 20, fontWeight: 600, color: C.onHero, lineHeight: 1.1 }}>
              {main.name}
            </div>
            {/* Cuisine tag */}
            <div
              className={nunitoClass}
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.accentDeep,
                backgroundColor: "rgba(230,195,155,0.08)",
                borderRadius: 999,
                paddingInline: 9,
                paddingBlock: 4,
                border: `1px solid rgba(230,195,155,0.14)`,
                flexShrink: 0,
              }}
            >
              {main.tag}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <MapPin size={12} color={C.mutedOnDark} weight="fill" />
            <span className={nunitoClass} style={{ fontSize: 11, color: C.mutedOnDark, fontWeight: 600 }}>
              {main.location}
            </span>
          </div>
        </motion.div>

        {/* Taste match chip */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 10 }}
          transition={{ delay: 0.4, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "rgba(230,195,155,0.08)",
            borderRadius: 14,
            border: `1px solid rgba(230,195,155,0.16)`,
            padding: "10px 14px",
          }}
        >
          <Percent size={16} color={C.accent} weight="fill" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={nunitoClass} style={{ fontSize: 10, color: C.mutedOnDark, fontWeight: 600, marginBottom: 2 }}>
              Matched to your taste
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Match bar */}
              <div
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(230,195,155,0.10)",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={reduced ? false : { width: "0%" }}
                  animate={inView ? { width: `${main.matchPct}%` } : reduced ? {} : { width: "0%" }}
                  transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: "100%", borderRadius: 2, backgroundColor: C.accent }}
                />
              </div>
              <span
                className={nunitoClass}
                style={{ fontSize: 13, fontWeight: 700, color: C.accent, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}
              >
                {main.matchPct}%
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
