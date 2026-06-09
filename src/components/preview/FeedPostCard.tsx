"use client";

/**
 * FeedPostCard — Feature B visual: Global Feed
 * Social feed post: avatar, name, food photo placeholder, caption, like/comment.
 * SWAP-SLOT: replace the gradient photo block with:
 *   <Image src="/images/feature-feed-photo.jpg" alt="Feed post photo" width={260} height={160} style={{ borderRadius: 12, objectFit: "cover", width: "100%", height: 160 }} />
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, ChatCircle, Image as ImageIcon } from "@phosphor-icons/react";
import { C, warmShadowDeep } from "./tokens";

interface FeedPostCardProps {
  fredokaClass: string;
  nunitoClass: string;
  inView: boolean;
}

const COMMENTS = [
  { avatar: "🧑", name: "Jordan", text: "Ok I need to try this place!" },
  { avatar: "👩", name: "Priya", text: "Nando's again 😂 classic" },
];

export function FeedPostCard({ fredokaClass, nunitoClass, inView }: FeedPostCardProps) {
  const reduced = useReducedMotion();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(14);

  function handleLike() {
    if (liked) {
      setLiked(false);
      setLikeCount((n) => n - 1);
    } else {
      setLiked(true);
      setLikeCount((n) => n + 1);
    }
  }

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
        padding: "18px 18px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
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

      {/* Author row */}
      <motion.div
        initial={reduced ? false : { opacity: 0, x: -12 }}
        animate={inView ? { opacity: 1, x: 0 } : reduced ? {} : { opacity: 0, x: -12 }}
        transition={{ delay: 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.accentDeep} 0%, ${C.cocoa} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
            border: `2px solid rgba(230,195,155,0.18)`,
          }}
        >
          🧑
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={fredokaClass} style={{ fontSize: 14, fontWeight: 600, color: C.onHero, lineHeight: 1.2 }}>
            Alex M.
          </div>
          <div className={nunitoClass} style={{ fontSize: 11, color: C.mutedOnDark, fontWeight: 600 }}>
            Just now
          </div>
        </div>
        {/* Platform tag */}
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
          }}
        >
          Uber Eats
        </div>
      </motion.div>

      {/* Photo placeholder — SWAP-SLOT */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 12 }}
        transition={{ delay: 0.22, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderRadius: 14,
          height: 156,
          background: `linear-gradient(145deg, rgba(62,39,35,0.8) 0%, rgba(46,30,20,0.9) 50%, rgba(36,23,18,1) 100%)`,
          border: `1px solid rgba(230,195,155,0.10)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle warm tint blobs */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "20%",
            left: "30%",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(230,195,155,0.08) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <ImageIcon size={28} color={C.accentDeep} weight="duotone" style={{ opacity: 0.6 }} />
        <span className={nunitoClass} style={{ fontSize: 11, color: C.mutedOnDark, fontWeight: 600, opacity: 0.6 }}>
          {/* SWAP-SLOT: real food photo */}
          Photo from order
        </span>
      </motion.div>

      {/* Caption */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 8 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={nunitoClass}
        style={{ fontSize: 13, color: C.onHeroSoft, fontWeight: 600, lineHeight: 1.5 }}
      >
        Nando&apos;s again. At this point it&apos;s basically my third home.
      </motion.div>

      {/* Actions row */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={inView ? { opacity: 1 } : reduced ? {} : { opacity: 0 }}
        transition={{ delay: 0.38, duration: 0.35 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingTop: 2,
          borderTop: `1px solid rgba(230,195,155,0.07)`,
        }}
      >
        <button
          onClick={handleLike}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 0",
            minHeight: 44,
          }}
          aria-label={liked ? "Unlike post" : "Like post"}
        >
          <Heart
            size={18}
            weight={liked ? "fill" : "regular"}
            color={liked ? C.accent : C.mutedOnDark}
            style={{ transition: "color 150ms ease, transform 150ms ease", transform: liked ? "scale(1.15)" : "scale(1)" }}
          />
          <span
            className={nunitoClass}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: liked ? C.accent : C.mutedOnDark,
              fontVariantNumeric: "tabular-nums",
              transition: "color 150ms ease",
            }}
          >
            {likeCount}
          </span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 0", minHeight: 44 }}>
          <ChatCircle size={18} color={C.mutedOnDark} weight="regular" />
          <span className={nunitoClass} style={{ fontSize: 12, fontWeight: 700, color: C.mutedOnDark }}>
            2
          </span>
        </div>
      </motion.div>

      {/* Comment rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {COMMENTS.map((c, i) => (
          <motion.div
            key={c.name}
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : reduced ? {} : { opacity: 0, x: -8 }}
            transition={{ delay: 0.45 + i * 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "rgba(230,195,155,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {c.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className={nunitoClass} style={{ fontSize: 11, fontWeight: 700, color: C.onHeroSoft }}>
                {c.name}{" "}
              </span>
              <span className={nunitoClass} style={{ fontSize: 11, fontWeight: 600, color: C.mutedOnDark }}>
                {c.text}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
