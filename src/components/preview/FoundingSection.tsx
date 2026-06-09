"use client";

/**
 * FoundingSection — Founding member CTA
 * Placed after StatsBand, before ClosingCTA.
 * Fetches /api/waitlist/founding for live spot count.
 * Stripe link: NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK (fallback: /founding-member).
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Medal, Lock, Lightning } from "@phosphor-icons/react";
import { LedgeButton } from "./LedgeButton";
import { C, warmShadowDeep } from "./tokens";

interface FoundingSectionProps {
  fredokaClass: string;
  nunitoClass: string;
  reduced: boolean | null;
}

interface FoundingData {
  count: number;
  remaining: number;
  closed: boolean;
}

const PERKS = [
  {
    icon: Medal,
    label: "Founding member badge in the app",
    sub: "Displayed on your profile permanently",
  },
  {
    icon: Lock,
    label: "Locked-in premium perks",
    sub: "Premium features, kept as long as you stay",
  },
  {
    icon: Lightning,
    label: "Early access before public launch",
    sub: "First in when Crumbify goes live",
  },
];

export function FoundingSection({ fredokaClass, nunitoClass, reduced }: FoundingSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const rm = useReducedMotion();

  const [founding, setFounding] = useState<FoundingData>({ count: 0, remaining: 100, closed: false });
  const [loaded, setLoaded] = useState(false);

  const stripeLink =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK) || "";

  useEffect(() => {
    fetch("/api/waitlist/founding")
      .then((r) => r.json())
      .then((d: FoundingData) => {
        setFounding(d);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const clampedCount = Math.min(founding.count, 100);
  const progressPct = (clampedCount / 100) * 100;

  const isReduced = reduced ?? rm;

  return (
    <section
      id="founding"
      ref={ref}
      style={{
        position: "relative",
        background: "transparent",
        overflow: "hidden",
        padding: "clamp(80px, 12vh, 140px) clamp(16px, 4vw, 64px)",
      }}
    >

      {/* Faint arc watermark */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-10%",
          left: "-6%",
          width: "clamp(200px, 32vw, 440px)",
          height: "clamp(200px, 32vw, 440px)",
          borderRadius: "50%",
          border: `clamp(18px, 3vw, 36px) solid ${C.accent}`,
          opacity: 0.035,
          pointerEvents: "none",
          clipPath: "polygon(40% 0%, 100% 0%, 100% 100%, 40% 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(48px, 6vw, 80px)",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* Left: headline + perks */}
        <div
          className="founding-left"
          style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 32 }}
        >
          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <motion.div
              initial={isReduced ? false : { opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className={nunitoClass}
              style={{ fontSize: 12, fontWeight: 700, color: C.accentDeep }}
            >
              Limited to 100 people
            </motion.div>

            <motion.h2
              className={fredokaClass}
              initial={isReduced ? false : { opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "clamp(40px, 6vw, 76px)",
                fontWeight: 600,
                lineHeight: 0.92,
                color: C.onHero,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Founding
              <br />
              <span style={{ color: C.accent }}>member.</span>
            </motion.h2>

            <motion.p
              className={nunitoClass}
              initial={isReduced ? false : { opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "clamp(15px, 1.3vw, 17px)",
                lineHeight: 1.65,
                color: C.onHeroSoft,
                maxWidth: 420,
                margin: 0,
                fontWeight: 400,
              }}
            >
              The first 100 people to join get founding member status. Not first-come-first-served to a waitlist, but a real limited group with lasting recognition in the app.
            </motion.p>
          </div>

          {/* Perks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {PERKS.map((p, i) => (
              <motion.div
                key={p.label}
                initial={isReduced ? false : { opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.28 + i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: "rgba(230,195,155,0.08)",
                    border: `1px solid rgba(230,195,155,0.14)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <p.icon size={20} color={C.accent} weight="fill" />
                </div>
                <div>
                  <div
                    className={nunitoClass}
                    style={{ fontSize: 14, fontWeight: 700, color: C.onHero, lineHeight: 1.3 }}
                  >
                    {p.label}
                  </div>
                  <div
                    className={nunitoClass}
                    style={{ fontSize: 12, color: C.mutedOnDark, fontWeight: 600, marginTop: 2, lineHeight: 1.4 }}
                  >
                    {p.sub}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: card */}
        <motion.div
          className="founding-right"
          initial={isReduced ? false : { opacity: 0, y: 32, scale: 0.95 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: "0 1 360px", minWidth: 280 }}
        >
          <div
            style={{
              borderRadius: 28,
              background: `linear-gradient(145deg, ${C.heroPanel} 0%, ${C.heroDeep} 100%)`,
              border: `1.5px solid rgba(230,195,155,0.20)`,
              boxShadow: warmShadowDeep,
              padding: "28px 26px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Inner sheen */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, transparent, rgba(230,195,155,0.30), transparent)`,
              }}
            />

            {/* Card heading */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              <div className={nunitoClass} style={{ fontSize: 11, fontWeight: 700, color: C.accentDeep }}>
                Founding membership
              </div>
              <div
                className={fredokaClass}
                style={{ fontSize: 26, fontWeight: 600, color: C.onHero, lineHeight: 1, letterSpacing: "-0.01em" }}
              >
                One of 100
              </div>
            </div>

            {/* Spots progress */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 10,
                }}
              >
                <span className={nunitoClass} style={{ fontSize: 12, fontWeight: 700, color: C.onHeroSoft }}>
                  Founding spots claimed
                </span>
                <span
                  className={nunitoClass}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: loaded ? C.accent : C.mutedOnDark,
                    fontVariantNumeric: "tabular-nums",
                    transition: "color 0.3s ease",
                  }}
                >
                  {loaded ? `${clampedCount} / 100` : "... / 100"}
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(230,195,155,0.10)",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={inView && loaded ? { width: `${progressPct}%` } : {}}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${C.accentDeep} 0%, ${C.accent} 100%)`,
                  }}
                />
              </div>

              {loaded && !founding.closed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className={nunitoClass}
                  style={{ fontSize: 11, color: C.mutedOnDark, fontWeight: 600, marginTop: 8 }}
                >
                  {founding.remaining} spot{founding.remaining !== 1 ? "s" : ""} remaining
                </motion.div>
              )}
            </div>

            {/* CTA */}
            {founding.closed ? (
              <div
                className={nunitoClass}
                style={{
                  textAlign: "center",
                  padding: "14px 20px",
                  borderRadius: 14,
                  backgroundColor: "rgba(230,195,155,0.06)",
                  border: `1px solid rgba(230,195,155,0.14)`,
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.mutedOnDark,
                }}
              >
                Founding membership is now closed
              </div>
            ) : (
              <LedgeButton
                ledgeOffset={5}
                fontClassName={nunitoClass}
                variant="accent"
                onClick={() => {
                  const href = stripeLink || "/founding-member";
                  window.open(href, stripeLink ? "_blank" : "_self");
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 800 }}>Become a founding member</span>
              </LedgeButton>
            )}

            <div
              className={nunitoClass}
              style={{
                fontSize: 11,
                color: C.mutedOnDark,
                textAlign: "center",
                marginTop: 14,
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              Available in the UK. More regions coming soon.
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .founding-left { order: 1; }
          .founding-right { order: 2; flex: 1 1 100% !important; }
        }
      `}</style>
    </section>
  );
}
