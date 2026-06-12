"use client";

/**
 * FeedPostCard — Feature B visual: Global Feed
 * Social feed post: avatar, name, food photo placeholder, caption, like/comment.
 * SWAP-SLOT: replace the gradient photo block with:
 *   <Image src="/images/feature-feed-photo.jpg" alt="Feed post photo" width={260} height={160} style={{ borderRadius: 12, objectFit: "cover", width: "100%", height: 160 }} />
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, ChatCircle } from "@phosphor-icons/react";
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

      {/* Food photo illustration — SWAP-SLOT: replace this block with:
          <Image src="/images/feature-feed-photo.jpg" alt="Nando's order" width={304} height={156}
            style={{ borderRadius: 14, objectFit: "cover", width: "100%", height: 156, display: "block" }} />
      */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : reduced ? {} : { opacity: 0, y: 12 }}
        transition={{ delay: 0.22, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
        style={{
          borderRadius: 14,
          height: 156,
          background: `linear-gradient(145deg, #3A2418 0%, #2E1A10 55%, #241208 100%)`,
          border: `1px solid rgba(230,195,155,0.10)`,
          position: "relative",
          overflow: "hidden",
          boxShadow: "inset 0 0 32px rgba(10,5,2,0.55)",
        }}
      >
        {/* Table surface warm grain */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 140% 80% at 50% 110%, rgba(90,45,20,0.35) 0%, transparent 65%)`,
          }}
        />

        {/* Plate — large off-center bone-cream circle, partially cropped right */}
        <div
          style={{
            position: "absolute",
            width: 148,
            height: 148,
            borderRadius: "50%",
            background: `radial-gradient(circle at 44% 42%, rgba(248,240,224,0.96) 0%, rgba(235,225,208,0.92) 60%, rgba(218,206,188,0.88) 100%)`,
            top: 10,
            right: -28,
            boxShadow: "0 4px 18px rgba(10,5,2,0.45), inset 0 1px 3px rgba(255,255,255,0.18)",
          }}
        >
          {/* Plate rim shadow */}
          <div
            style={{
              position: "absolute",
              inset: 6,
              borderRadius: "50%",
              border: "1px solid rgba(180,160,130,0.22)",
            }}
          />

          {/* Chicken piece 1 — large thigh shape, roasted amber */}
          <div
            style={{
              position: "absolute",
              width: 62,
              height: 48,
              background: `radial-gradient(ellipse at 38% 38%, #C9722E 0%, #A0511A 52%, #7A3A10 100%)`,
              borderRadius: "58% 42% 65% 35% / 52% 48% 60% 40%",
              top: 18,
              left: 18,
              boxShadow: "2px 3px 8px rgba(30,10,2,0.5), inset 1px 1px 3px rgba(220,160,80,0.22)",
            }}
          />

          {/* Chicken piece 2 — drumstick blob, darker mahogany */}
          <div
            style={{
              position: "absolute",
              width: 48,
              height: 38,
              background: `radial-gradient(ellipse at 40% 35%, #B5651D 0%, #8B4513 55%, #6B300A 100%)`,
              borderRadius: "45% 55% 40% 60% / 55% 45% 62% 38%",
              top: 52,
              left: 46,
              boxShadow: "2px 2px 6px rgba(30,10,2,0.45)",
            }}
          />

          {/* Small ramekin — sauce cup */}
          <div
            style={{
              position: "absolute",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `radial-gradient(circle at 42% 38%, #D94040 0%, #B02020 55%, #8B1515 100%)`,
              border: "2px solid rgba(248,240,224,0.70)",
              bottom: 16,
              left: 14,
              boxShadow: "1px 2px 5px rgba(30,10,2,0.4)",
            }}
          />

          {/* Seasoning dots on plate */}
          {[
            { top: 14, left: 66, size: 4, opacity: 0.55 },
            { top: 28, left: 88, size: 3, opacity: 0.45 },
            { top: 72, left: 82, size: 3.5, opacity: 0.50 },
            { top: 88, left: 52, size: 3, opacity: 0.40 },
          ].map((dot, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                width: dot.size,
                height: dot.size,
                borderRadius: "50%",
                backgroundColor: `rgba(120,60,20,${dot.opacity})`,
                top: dot.top,
                left: dot.left,
              }}
            />
          ))}
        </div>

        {/* Left side — charred sides / dark textured area suggesting a side dish */}
        <div
          style={{
            position: "absolute",
            width: 72,
            height: 56,
            background: `radial-gradient(ellipse at 55% 45%, rgba(90,48,18,0.72) 0%, rgba(50,25,8,0.85) 70%)`,
            borderRadius: "38% 62% 50% 50% / 45% 45% 55% 55%",
            top: 58,
            left: 10,
          }}
        />

        {/* Photographic edge vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 14,
            boxShadow: "inset 0 0 28px rgba(10,5,2,0.62)",
            pointerEvents: "none",
          }}
        />
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
