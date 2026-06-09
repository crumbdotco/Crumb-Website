"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { heroPhoneShadow } from "./tokens";

// ── Main phone component ──────────────────────────────────────────────────────
export function PhoneFrame() {
  const reduced = useReducedMotion();

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Soft ground shadow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "65%",
          height: 24,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 80%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Phone shell */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.90, y: 32, rotate: 2.5 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        transition={{ delay: 0.35, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(295px, 88vw)",
          borderRadius: 46,
          border: `9px solid #0D0906`,
          backgroundColor: "#0D0906",
          overflow: "hidden",
          boxShadow: heroPhoneShadow,
          flexShrink: 0,
        }}
      >
        {/* Screenshot fills the screen area; the 9px border + 46px outer radius
            gives an inner radius of ~37px which we replicate for a snug clip. */}
        <div
          style={{
            borderRadius: 37,
            overflow: "hidden",
            display: "block",
            lineHeight: 0,
          }}
        >
          <Image
            src="/images/app-stats.png"
            alt="Crumbify Stats screen showing top restaurants and popular dishes"
            width={911}
            height={1969}
            priority
            sizes="(max-width: 640px) 88vw, 295px"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
