"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Fredoka, Nunito } from "next/font/google";
import { LedgeButton } from "@/components/landing/LedgeButton";
import { CrumbParticles } from "@/components/landing/CrumbParticles";
import { PhoneFrame } from "@/components/landing/PhoneFrame";
import { FeaturePhoneA } from "@/components/landing/FeaturePhoneA";
import { FeedPostCard } from "@/components/landing/FeedPostCard";
import { GroupCard } from "@/components/landing/GroupCard";
import { DiscoverCard } from "@/components/landing/DiscoverCard";
import { PersonalityChart } from "@/components/landing/PersonalityChart";
import { SoulmateCard } from "@/components/landing/SoulmateCard";
import { FoundingSection } from "@/components/landing/FoundingSection";
import { EmailCapture } from "@/components/landing/EmailCapture";
import { C } from "@/components/landing/tokens";
import { ConnectorLine } from "@/components/landing/ConnectorLine";
import { ForkKnife, Storefront, Heart, ChartPieSlice } from "@phosphor-icons/react";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-fredoka",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Arial", "sans-serif"],
  preload: true,
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Arial", "sans-serif"],
  preload: true,
});

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, inView: boolean, reduced: boolean | null, duration = 1.6) {
  const [count, setCount] = useState(0);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!inView || reduced || animatedRef.current) return;
    animatedRef.current = true;
    const start = performance.now();
    function step(now: number) {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [inView, reduced, target, duration]);

  return reduced ? target : count;
}

// ─── Feature tag pill ─────────────────────────────────────────────────────────
function TagPill({ label, nunitoClass }: { label: string; nunitoClass: string }) {
  return (
    <div
      className={nunitoClass}
      style={{
        backgroundColor: "rgba(230,195,155,0.08)",
        border: `1px solid rgba(230,195,155,0.18)`,
        borderRadius: 999,
        paddingInline: 14,
        paddingBlock: 7,
        fontSize: 13,
        fontWeight: 700,
        color: C.onHeroSoft,
        minHeight: 34,
        display: "flex",
        alignItems: "center",
      }}
    >
      {label}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function LandingNavbar({
  fredokaClass,
  nunitoClass,
  onGetEarlyAccess,
}: {
  fredokaClass: string;
  nunitoClass: string;
  onGetEarlyAccess: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 32);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    color: C.onHeroSoft,
    padding: "12px 0",
    minHeight: 44,
    display: "none",
    transition: "color 160ms ease",
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "rgba(26,18,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid rgba(230,195,155,0.12)` : "1px solid transparent",
        padding: "0 clamp(20px, 4vw, 48px)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background-color 260ms ease, border-color 260ms ease, backdrop-filter 260ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Image
          src="/images/crumbify-logo.png"
          alt="Crumbify logo"
          width={34}
          height={34}
          style={{ borderRadius: 8 }}
          priority
        />
        <span className={fredokaClass} style={{ fontSize: 20, fontWeight: 600, color: C.onHero }}>
          Crumbify
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <button
          id="nav-features-link"
          className={nunitoClass}
          onClick={() => {
            document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
          }}
          style={navLinkStyle}
        >
          Features
        </button>
        <button
          id="nav-founding-link"
          className={nunitoClass}
          onClick={() => {
            document.getElementById("founding")?.scrollIntoView({ behavior: "smooth" });
          }}
          style={navLinkStyle}
        >
          Founding member
        </button>
        <LedgeButton ledgeOffset={4} fontClassName={nunitoClass} variant="accent" onClick={onGetEarlyAccess}>
          <span style={{ fontSize: 14 }}>Get early access</span>
        </LedgeButton>
      </div>

      <style>{`
        @media (min-width: 640px) {
          #nav-features-link { display: block !important; }
          #nav-founding-link { display: block !important; }
        }
        nav button:hover { color: ${C.accent} !important; }
      `}</style>
    </nav>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────
function HeroMoment({
  fredokaClass,
  nunitoClass,
  reduced,
}: {
  fredokaClass: string;
  nunitoClass: string;
  reduced: boolean | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const phoneSpring = useSpring(phoneY, { stiffness: 70, damping: 22 });

  const words = [
    { text: "Read", delay: 0 },
    { text: "the", delay: 0.12 },
    { text: "crumbs", delay: 0.24, hasAccentDot: true },
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "100dvh",
        minHeight: 580,
        background: `linear-gradient(to bottom, ${C.heroDeep} 0%, ${C.heroDeep} 80%, ${C.heroDark} 100%)`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CrumbParticles />

      {/* Faint cookie-arc watermark - top-left */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-15%",
          left: "-8%",
          width: "clamp(280px, 42vw, 560px)",
          height: "clamp(280px, 42vw, 560px)",
          borderRadius: "50%",
          border: `clamp(24px, 4vw, 48px) solid ${C.accent}`,
          opacity: 0.04,
          pointerEvents: "none",
          clipPath: "polygon(30% 0%, 100% 0%, 100% 100%, 30% 100%)",
        }}
      />

      {/* Arc - bottom-right */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-12%",
          right: "-5%",
          width: "clamp(200px, 28vw, 380px)",
          height: "clamp(200px, 28vw, 380px)",
          borderRadius: "50%",
          border: `clamp(18px, 3vw, 36px) solid ${C.accent}`,
          opacity: 0.035,
          pointerEvents: "none",
          clipPath: "polygon(0% 0%, 70% 0%, 70% 100%, 0% 100%)",
        }}
      />


      <div
        className="hero-grid"
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          maxWidth: 1320,
          margin: "0 auto",
          width: "100%",
          padding: "0 clamp(20px, 4vw, 56px)",
          paddingTop: 64,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: 0,
        }}
      >
        {/* LEFT COL */}
        <div
          className="hero-left-col"
          style={{
            flex: "0 0 58%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: "clamp(24px, 4vw, 64px)",
            paddingBottom: 48,
          }}
        >
          <h1
            className={fredokaClass}
            style={{
              fontSize: "clamp(68px, 11.5vw, 168px)",
              lineHeight: 0.88,
              fontWeight: 600,
              margin: "0 0 28px 0",
              letterSpacing: "-0.025em",
            }}
          >
            {words.map((w) => (
              <motion.span
                key={w.text}
                style={{ display: "block", color: C.onHero }}
                initial={reduced ? false : { opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: reduced ? 0 : 0.2 + w.delay,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {w.hasAccentDot ? (
                  <>
                    {w.text}
                    <span style={{ color: C.accent }}>.</span>
                  </>
                ) : (
                  w.text
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className={nunito.className}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.55, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(15px, 1.4vw, 18px)",
              lineHeight: 1.65,
              color: C.onHeroSoft,
              maxWidth: 440,
              margin: "0 0 32px 0",
              fontWeight: 400,
            }}
          >
            Screenshot your delivery orders. Crumbify reads them and shows you who you really are.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.68, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <EmailCapture nunitoClass={nunitoClass} surface="dark" honeypotId="crumb-hp-hero" />
          </motion.div>
        </div>

        {/* RIGHT COL */}
        <div
          className="hero-right-col"
          style={{
            flex: "0 0 42%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "clamp(80px, 10vh, 120px)",
          }}
        >
          <motion.div data-connect="1" style={{ y: reduced ? 0 : phoneSpring, rotate: -1.5 }}>
            <PhoneFrame />
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hero-grid { flex-direction: column !important; }
          .hero-left-col { flex: unset !important; width: 100% !important; padding-right: 0 !important; padding-top: 24px !important; }
          .hero-right-col { flex: unset !important; width: 100% !important; padding-top: 0 !important; justify-content: center !important; padding-bottom: 40px !important; }
        }
      `}</style>
    </section>
  );
}

// ─── Platform Line ────────────────────────────────────────────────────────────
function PlatformLine({
  fredokaClass,
  nunitoClass,
  reduced,
}: {
  fredokaClass: string;
  nunitoClass: string;
  reduced: boolean | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const platforms = [
    { name: "Uber Eats", logo: "https://cdn.simpleicons.org/ubereats/E6C39B", alt: "Uber Eats" },
    { name: "Just Eat", logo: "https://cdn.simpleicons.org/justeat/E6C39B", alt: "Just Eat" },
    { name: "Deliveroo", logo: "https://cdn.simpleicons.org/deliveroo/E6C39B", alt: "Deliveroo" },
  ];

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        background: "transparent",
        borderTop: `1px solid rgba(230,195,155,0.06)`,
        borderBottom: `1px solid rgba(230,195,155,0.06)`,
        padding: "clamp(48px, 7vw, 88px) clamp(16px, 4vw, 64px)",
        overflow: "hidden",
      }}
    >

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 920,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <p
          className={fredokaClass}
          style={{
            fontSize: "clamp(22px, 3.2vw, 40px)",
            fontWeight: 600,
            color: C.onHero,
            lineHeight: 1.3,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Works with screenshots from Uber Eats, Just Eat, Deliveroo,{" "}
          <span style={{ color: C.onHeroSoft }}>or any restaurant you log by hand.</span>
        </p>

        <p
          className={nunitoClass}
          style={{
            fontSize: "clamp(14px, 1.2vw, 16px)",
            color: C.mutedOnDark,
            lineHeight: 1.65,
            margin: 0,
            maxWidth: 560,
            fontWeight: 600,
          }}
        >
          OCR screenshot reading and manual entry. No account connection, no logins, no data shared with delivery apps.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "clamp(24px, 4vw, 44px)", flexWrap: "wrap" }}>
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", alignItems: "center" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.logo} alt={p.alt} width={32} height={32} style={{ opacity: 0.7, display: "block" }} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─── Feature A: "See where you really eat" — visual LEFT, text RIGHT ──────────
function FeatureMomentA({
  fredokaClass,
  nunitoClass,
  reduced,
}: {
  fredokaClass: string;
  nunitoClass: string;
  reduced: boolean | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const phoneSpring = useSpring(phoneY, { stiffness: 60, damping: 20 });

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "transparent",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >

      <div
        className="feat-grid feat-grid-a"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          padding: "clamp(72px, 10vh, 128px) clamp(16px, 4vw, 64px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(48px, 6vw, 80px)",
          alignItems: "center",
        }}
      >
        <motion.div data-connect="1" style={{ flex: "0 1 auto", display: "flex", justifyContent: "center", y: reduced ? 0 : phoneSpring }}>
          <FeaturePhoneA fredokaClass={fredokaClass} nunitoClass={nunitoClass} inView={inView} />
        </motion.div>

        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <motion.h2
            className={fredokaClass}
            initial={reduced ? false : { opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(40px, 6vw, 84px)", fontWeight: 600, lineHeight: 0.92, color: C.onHero, margin: 0, letterSpacing: "-0.02em" }}
          >
            See where
            <br />you really
            <br /><span style={{ color: C.accent }}>eat.</span>
          </motion.h2>

          <motion.p
            className={nunitoClass}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(16px, 1.4vw, 18px)", lineHeight: 1.65, color: C.onHeroSoft, maxWidth: 400, margin: 0, fontWeight: 400 }}
          >
            Top restaurants ranked by visits, cuisine breakdown at a glance. Patterns you never noticed, surfaced automatically.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            {["Top Restaurants", "Cuisine Breakdown", "Visit Counts"].map((tag) => (
              <TagPill key={tag} label={tag} nunitoClass={nunitoClass} />
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .feat-grid-a { flex-direction: column !important; align-items: center !important; } }`}</style>
    </section>
  );
}

// ─── Feature B: "Share what you eat" — Global Feed — text LEFT, card RIGHT ────
function FeatureMomentB({
  fredokaClass,
  nunitoClass,
  reduced,
}: {
  fredokaClass: string;
  nunitoClass: string;
  reduced: boolean | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const cardSpring = useSpring(cardY, { stiffness: 60, damping: 20 });

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "transparent",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >

      <div
        className="feat-grid feat-grid-b"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          padding: "clamp(72px, 10vh, 128px) clamp(16px, 4vw, 64px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(48px, 6vw, 80px)",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Text LEFT */}
        <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <motion.h2
            className={fredokaClass}
            initial={reduced ? false : { opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(40px, 6vw, 84px)", fontWeight: 600, lineHeight: 0.92, color: C.onHero, margin: 0, letterSpacing: "-0.02em" }}
          >
            Share what
            <br />you
            <br /><span style={{ color: C.accent }}>eat.</span>
          </motion.h2>

          <motion.p
            className={nunitoClass}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(16px, 1.4vw, 18px)", lineHeight: 1.65, color: C.onHeroSoft, maxWidth: 380, margin: 0, fontWeight: 400 }}
          >
            Post a photo from your order, write a note, like and comment on your friends. The food social feed that actually makes sense.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.28, duration: 0.45 }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            {["Photo Posts", "Likes", "Comments"].map((tag) => (
              <TagPill key={tag} label={tag} nunitoClass={nunitoClass} />
            ))}
          </motion.div>
        </div>

        {/* Card RIGHT */}
        <motion.div data-connect="1" style={{ flex: "0 1 auto", display: "flex", justifyContent: "center", y: reduced ? 0 : cardSpring }}>
          <FeedPostCard fredokaClass={fredokaClass} nunitoClass={nunitoClass} inView={inView} />
        </motion.div>
      </div>

      <style>{`@media (max-width: 768px) { .feat-grid-b { flex-direction: column !important; align-items: center !important; } }`}</style>
    </section>
  );
}

// ─── Feature C: "Plan it with your group" — Groups — centered editorial ────────
function FeatureMomentC({
  fredokaClass,
  nunitoClass,
  reduced,
}: {
  fredokaClass: string;
  nunitoClass: string;
  reduced: boolean | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const cardSpring = useSpring(cardY, { stiffness: 60, damping: 20 });

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "transparent",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
          padding: "clamp(72px, 10vh, 128px) clamp(16px, 4vw, 64px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(48px, 6vw, 72px)",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <motion.h2
            className={fredokaClass}
            initial={reduced ? false : { opacity: 0, y: 32, filter: "blur(6px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(52px, 9vw, 120px)", fontWeight: 600, lineHeight: 0.9, color: C.onHero, margin: 0, letterSpacing: "-0.025em" }}
          >
            Plan it with
            <br /><span style={{ color: C.accent }}>your group.</span>
          </motion.h2>

          <motion.p
            className={nunitoClass}
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(16px, 1.4vw, 18px)", lineHeight: 1.65, color: C.onHeroSoft, maxWidth: 500, margin: 0, fontWeight: 400 }}
          >
            Share restaurants with your group, build a shared Want-to-Try list, and rate places together. Food decisions, finally collaborative.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.45 }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}
          >
            {["Shared Lists", "Group Ratings", "Photos"].map((tag) => (
              <TagPill key={tag} label={tag} nunitoClass={nunitoClass} />
            ))}
          </motion.div>
        </div>

        <motion.div data-connect="1" style={{ display: "flex", justifyContent: "center", y: reduced ? 0 : cardSpring }}>
          <GroupCard fredokaClass={fredokaClass} nunitoClass={nunitoClass} inView={inView} />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Feature D: "Discover your next meal" — Discover — card LEFT, text RIGHT ──
function FeatureMomentD({
  fredokaClass,
  nunitoClass,
  reduced,
}: {
  fredokaClass: string;
  nunitoClass: string;
  reduced: boolean | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const cardSpring = useSpring(cardY, { stiffness: 60, damping: 20 });

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "transparent",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >

      <div
        className="feat-grid feat-grid-d"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          padding: "clamp(72px, 10vh, 128px) clamp(16px, 4vw, 64px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(48px, 6vw, 80px)",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Card LEFT */}
        <motion.div data-connect="1" style={{ flex: "0 1 auto", display: "flex", justifyContent: "center", y: reduced ? 0 : cardSpring }}>
          <DiscoverCard fredokaClass={fredokaClass} nunitoClass={nunitoClass} inView={inView} />
        </motion.div>

        {/* Text RIGHT */}
        <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <motion.h2
            className={fredokaClass}
            initial={reduced ? false : { opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(40px, 6vw, 84px)", fontWeight: 600, lineHeight: 0.92, color: C.onHero, margin: 0, letterSpacing: "-0.02em" }}
          >
            Discover
            <br />your next
            <br /><span style={{ color: C.accent }}>meal.</span>
          </motion.h2>

          <motion.p
            className={nunitoClass}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(16px, 1.4vw, 18px)", lineHeight: 1.65, color: C.onHeroSoft, maxWidth: 380, margin: 0, fontWeight: 400 }}
          >
            A scroll feed of restaurant recommendations tuned to your actual taste. Matched by your history, not by a generic algorithm.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.28, duration: 0.45 }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            {["For You", "Taste Match", "Nearby"].map((tag) => (
              <TagPill key={tag} label={tag} nunitoClass={nunitoClass} />
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .feat-grid-d { flex-direction: column !important; align-items: center !important; } }`}</style>
    </section>
  );
}

// ─── Feature E: "Discover your food personality" — text LEFT, chart RIGHT ─────
function FeatureMomentE({
  fredokaClass,
  nunitoClass,
  reduced,
}: {
  fredokaClass: string;
  nunitoClass: string;
  reduced: boolean | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const chartY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const chartSpring = useSpring(chartY, { stiffness: 60, damping: 20 });

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "transparent",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >

      <div
        className="feat-grid feat-grid-e"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          padding: "clamp(72px, 10vh, 128px) clamp(16px, 4vw, 64px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(48px, 6vw, 80px)",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Text LEFT */}
        <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <motion.h2
            className={fredokaClass}
            initial={reduced ? false : { opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(40px, 6vw, 84px)", fontWeight: 600, lineHeight: 0.92, color: C.onHero, margin: 0, letterSpacing: "-0.02em" }}
          >
            Discover your
            <br />food
            <br /><span style={{ color: C.accent }}>personality.</span>
          </motion.h2>

          <motion.p
            className={nunitoClass}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(16px, 1.4vw, 18px)", lineHeight: 1.65, color: C.onHeroSoft, maxWidth: 380, margin: 0, fontWeight: 400 }}
          >
            Creature of Habit, or The Explorer? Your cuisine mix tells the story. Crumbify gives it a name.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.28, duration: 0.45 }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            {["Personality Type", "Cuisine Analysis"].map((tag) => (
              <TagPill key={tag} label={tag} nunitoClass={nunitoClass} />
            ))}
          </motion.div>
        </div>

        {/* Chart RIGHT */}
        <motion.div data-connect="1" style={{ flex: "0 1 auto", display: "flex", justifyContent: "center", y: reduced ? 0 : chartSpring }}>
          <PersonalityChart fredokaClass={fredokaClass} nunitoClass={nunitoClass} inView={inView} />
        </motion.div>
      </div>

      <style>{`@media (max-width: 768px) { .feat-grid-e { flex-direction: column !important; align-items: center !important; } }`}</style>
    </section>
  );
}

// ─── Feature F: "Find your food soulmate" — card LEFT, text RIGHT ─────────────
function FeatureMomentF({
  fredokaClass,
  nunitoClass,
  reduced,
}: {
  fredokaClass: string;
  nunitoClass: string;
  reduced: boolean | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const cardSpring = useSpring(cardY, { stiffness: 60, damping: 20 });

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "transparent",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >

      <div
        className="feat-grid feat-grid-f"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          padding: "clamp(72px, 10vh, 128px) clamp(16px, 4vw, 64px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(48px, 6vw, 80px)",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Card LEFT */}
        <motion.div data-connect="1" style={{ flex: "0 1 auto", display: "flex", justifyContent: "center", y: reduced ? 0 : cardSpring }}>
          <SoulmateCard fredokaClass={fredokaClass} nunitoClass={nunitoClass} inView={inView} />
        </motion.div>

        {/* Text RIGHT */}
        <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <motion.h2
            className={fredokaClass}
            initial={reduced ? false : { opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(40px, 6vw, 84px)", fontWeight: 600, lineHeight: 0.92, color: C.onHero, margin: 0, letterSpacing: "-0.02em" }}
          >
            Find your
            <br />food
            <br /><span style={{ color: C.accent }}>soulmate.</span>
          </motion.h2>

          <motion.p
            className={nunitoClass}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(16px, 1.4vw, 18px)", lineHeight: 1.65, color: C.onHeroSoft, maxWidth: 380, margin: 0, fontWeight: 400 }}
          >
            Crumbify compares your order history with friends and scores your taste match. Find who eats just like you.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.28, duration: 0.45 }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            {["Taste Match", "Shared Favourites", "Friend Feed"].map((tag) => (
              <TagPill key={tag} label={tag} nunitoClass={nunitoClass} />
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .feat-grid-f { flex-direction: column !important; align-items: center !important; } }`}</style>
    </section>
  );
}

// ─── Stats Band ───────────────────────────────────────────────────────────────
interface StatItem {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
  Icon: React.ComponentType<{ size?: number; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone"; color?: string }>;
  hero?: boolean;
}

const STATS_DATA: StatItem[] = [
  { value: 147, suffix: "", label: "orders", sublabel: "in a single year", Icon: ForkKnife, hero: true },
  { value: 38, suffix: "", label: "restaurants tried", sublabel: "across the city", Icon: Storefront },
  { value: 92, suffix: "%", label: "soulmate match", sublabel: "closest taste match", Icon: Heart },
  { value: 34, suffix: "%", label: "top cuisine", sublabel: "Thai, every time", Icon: ChartPieSlice },
];

// Card surface shared style
const CARD_BASE: React.CSSProperties = {
  backgroundColor: C.heroDark,
  border: `1px solid rgba(230,195,155,0.12)`,
  borderRadius: 22,
  boxShadow: "0 2px 8px rgba(26,18,8,0.28), 0 8px 24px rgba(26,18,8,0.20)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
};

function StatCounter({
  stat, fredokaClass, nunitoClass, inView, reduced, index,
}: {
  stat: StatItem; fredokaClass: string; nunitoClass: string; inView: boolean; reduced: boolean | null; index: number;
}) {
  const count = useCountUp(stat.value, inView, reduced);
  const isHero = stat.hero ?? false;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{
        ...CARD_BASE,
        padding: isHero ? "clamp(28px, 3.5vw, 44px)" : "clamp(20px, 2.5vw, 32px)",
        justifyContent: "space-between",
        minHeight: isHero ? "clamp(200px, 22vw, 280px)" : "clamp(120px, 14vw, 168px)",
      }}
    >
      {/* Icon badge */}
      <div
        aria-hidden
        style={{
          width: isHero ? 48 : 38,
          height: isHero ? 48 : 38,
          borderRadius: 12,
          backgroundColor: "rgba(230,195,155,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <stat.Icon
          size={isHero ? 24 : 20}
          weight="regular"
          color={C.accent}
        />
      </div>

      {/* Number + labels */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: isHero ? 20 : 14 }}>
        <div
          className={fredokaClass}
          style={{
            fontSize: isHero ? "clamp(56px, 7vw, 96px)" : "clamp(36px, 4vw, 56px)",
            fontWeight: 600,
            color: C.onHero,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}<span style={{ color: C.accent }}>{stat.suffix}</span>
        </div>
        <div
          className={nunitoClass}
          style={{
            fontSize: isHero ? "clamp(15px, 1.3vw, 17px)" : "clamp(13px, 1.1vw, 15px)",
            fontWeight: 700,
            color: C.onHeroSoft,
            marginTop: 6,
            lineHeight: 1.3,
          }}
        >
          {stat.label}
        </div>
        <div
          className={nunitoClass}
          style={{
            fontSize: isHero ? "clamp(13px, 1vw, 14px)" : "clamp(11px, 0.9vw, 13px)",
            fontWeight: 400,
            color: C.mutedOnDark,
            lineHeight: 1.4,
          }}
        >
          {stat.sublabel}
        </div>
      </div>
    </motion.div>
  );
}

function StatsBand({
  fredokaClass, nunitoClass, reduced,
}: { fredokaClass: string; nunitoClass: string; reduced: boolean | null }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [hero, ...rest] = STATS_DATA;

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        background: "transparent",
        padding: "clamp(72px, 10vw, 120px) clamp(16px, 4vw, 40px)",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(32px, 4vw, 52px)",
        }}
      >
        {/* Editorial header */}
        <div className="statsband-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <motion.h2
            className={fredokaClass}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 600,
              color: C.onHero,
              margin: 0,
              lineHeight: 1.1,
              maxWidth: 520,
              letterSpacing: "-0.02em",
            }}
          >
            A year of you,{" "}
            <span style={{ color: C.accent }}>in food.</span>
          </motion.h2>

          <motion.p
            className={nunitoClass}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(13px, 1.05vw, 14px)",
              color: C.mutedOnDark,
              fontWeight: 400,
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 220,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            Sample stats from a typical year of ordering. Your crumbs will look different.
          </motion.p>
        </div>

        {/* Bento grid: hero left (spans 2 rows), 3 smaller right */}
        <div className="statsband-bento" style={{ display: "grid", gap: 14 }}>
          {/* Hero card */}
          <div style={{ gridArea: "hero" }}>
            <StatCounter
              stat={hero}
              fredokaClass={fredokaClass}
              nunitoClass={nunitoClass}
              inView={inView}
              reduced={reduced}
              index={0}
            />
          </div>

          {/* Three smaller cards */}
          {rest.map((stat, i) => (
            <div key={stat.label} style={{ gridArea: `s${i + 1}` }}>
              <StatCounter
                stat={stat}
                fredokaClass={fredokaClass}
                nunitoClass={nunitoClass}
                inView={inView}
                reduced={reduced}
                index={i + 1}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Desktop: hero left spanning 2 rows, 3 cards stacked right in 2-col cluster */
        .statsband-bento {
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: auto auto;
          grid-template-areas:
            "hero s1 s2"
            "hero s3 s3";
        }
        /* s3 stretches across the bottom two right cells */
        .statsband-bento > div:last-child > div {
          height: 100%;
        }
        /* Header: full row on mobile */
        @media (max-width: 767px) {
          .statsband-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .statsband-header p {
            text-align: left !important;
            max-width: 100% !important;
          }
          .statsband-bento {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
            grid-template-areas:
              "hero"
              "s1"
              "s2"
              "s3" !important;
          }
        }
        /* Tablet: 2-col, hero top-left spanning 2 */
        @media (min-width: 480px) and (max-width: 767px) {
          .statsband-bento {
            grid-template-columns: 1fr 1fr !important;
            grid-template-areas:
              "hero hero"
              "s1 s2"
              "s3 s3" !important;
          }
        }
      `}</style>
    </section>
  );
}

// ─── Closing CTA ──────────────────────────────────────────────────────────────
function ClosingCTA({
  fredokaClass, nunitoClass, reduced,
}: { fredokaClass: string; nunitoClass: string; reduced: boolean | null }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="cta"
      ref={ref}
      style={{
        position: "relative",
        minHeight: "80dvh",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(80px, 12vh, 140px) clamp(16px, 4vw, 64px)",
        overflow: "hidden",
      }}
    >

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-8%",
          right: "-4%",
          width: "clamp(280px, 40vw, 560px)",
          height: "clamp(280px, 40vw, 560px)",
          borderRadius: "50%",
          border: `clamp(24px, 4vw, 48px) solid ${C.accent}`,
          opacity: 0.04,
          pointerEvents: "none",
          clipPath: "polygon(0% 0%, 70% 0%, 70% 100%, 0% 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 720,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <motion.h2
          className={fredokaClass}
          initial={reduced ? false : { opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: "clamp(52px, 9vw, 120px)", fontWeight: 600, lineHeight: 0.9, color: C.onHero, margin: 0, letterSpacing: "-0.025em" }}
        >
          Read your
          <br /><span style={{ color: C.accent }}>crumbs.</span>
        </motion.h2>

        <motion.p
          className={nunitoClass}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ fontSize: "clamp(16px, 1.4vw, 18px)", color: C.onHeroSoft, lineHeight: 1.65, maxWidth: 460, margin: 0, fontWeight: 400 }}
        >
          Your stats are waiting. Screenshot your order history, let Crumbify do the reading.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.28, duration: 0.45 }}
          style={{ width: "100%", maxWidth: 520 }}
        >
          <EmailCapture nunitoClass={nunitoClass} surface="dark" honeypotId="crumb-hp-cta" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function LandingFooter({ fredokaClass, nunitoClass }: { fredokaClass: string; nunitoClass: string }) {
  const linkStyle: React.CSSProperties = {
    fontSize: 14,
    color: C.mutedOnDark,
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    display: "block",
    padding: "4px 0",
    minHeight: 44,
    lineHeight: "44px",
    transition: "color 180ms ease",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: C.onHeroSoft,
    marginBottom: 4,
    letterSpacing: 0,
  };

  return (
    <footer
      style={{
        position: "relative",
        background: "transparent",
        borderTop: `1px solid rgba(230,195,155,0.10)`,
        padding: "56px clamp(16px, 4vw, 64px) 40px",
      }}
    >

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "40px 64px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: "1 1 200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/images/crumbify-logo.png" alt="Crumbify" width={32} height={32} style={{ borderRadius: 7 }} />
            <span className={fredokaClass} style={{ fontSize: 17, fontWeight: 600, color: C.onHeroSoft }}>
              Crumbify
            </span>
          </div>
          <p className={nunitoClass} style={{ fontSize: 14, color: C.mutedOnDark, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
            Read the crumbs.
          </p>
          <p className={nunitoClass} style={{ fontSize: 13, color: C.mutedOnDark, margin: 0, fontWeight: 400, lineHeight: 1.5 }}>
            @crumbifyco
          </p>
        </div>

        <div style={{ flex: "1 1 120px" }}>
          <div className={nunitoClass} style={headingStyle}>Product</div>
          <a href="#features" className={nunitoClass} style={linkStyle}>Features</a>
          <a href="#founding" className={nunitoClass} style={linkStyle}>Founding member</a>
        </div>

        <div style={{ flex: "1 1 120px" }}>
          <div className={nunitoClass} style={headingStyle}>Legal</div>
          <a href="/privacy" className={nunitoClass} style={linkStyle}>Privacy</a>
          <a href="/terms" className={nunitoClass} style={linkStyle}>Terms</a>
          <a href="/delete-account" className={nunitoClass} style={linkStyle}>Delete account</a>
          <a href="/support" className={nunitoClass} style={linkStyle}>Support</a>
        </div>

        <div style={{ flex: "1 1 160px" }}>
          <div className={nunitoClass} style={headingStyle}>Contact</div>
          <a href="mailto:support@crumbify.co.uk" className={nunitoClass} style={linkStyle}>support@crumbify.co.uk</a>
          <a href="mailto:contact@crumbify.co.uk" className={nunitoClass} style={linkStyle}>contact@crumbify.co.uk</a>
          <a href="https://x.com/crumbifyco" target="_blank" rel="noopener noreferrer" className={nunitoClass} style={linkStyle}>
            X @crumbifyco
          </a>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "32px auto 0",
          paddingTop: 24,
          borderTop: `1px solid rgba(230,195,155,0.08)`,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <p className={nunitoClass} style={{ fontSize: 13, color: C.mutedOnDark, margin: 0, fontWeight: 400 }}>
          {new Date().getFullYear()} Crumbify. All rights reserved.
        </p>
        <p className={nunitoClass} style={{ fontSize: 13, color: C.mutedOnDark, margin: 0, fontWeight: 400 }}>
          Made with care in the UK.
        </p>
      </div>

      <style>{`footer a:hover { color: ${C.accent} !important; }`}</style>
    </footer>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const reduced = useReducedMotion();

  // NOTE: Lenis smooth scroll is provided globally by the root layout's <SmoothScroll>.
  // Do NOT instantiate a second Lenis here.

  function scrollToCTA() {
    document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
  }

  const wrapperClass = `${fredoka.variable} ${nunito.variable}`;

  return (
    <div
      className={wrapperClass}
      style={{
        position: "relative",
        minHeight: "100dvh",
        backgroundColor: C.heroDeep,
        color: C.onHero,
        overflowX: "hidden",
      }}
    >
      {/* ── Single page-level grain overlay ───────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Page-level soft radial glows (depth, no section seams) ────────── */}
      {/* Glow 1: top-right warm bloom — sits around 25–35% page height */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "18%",
          right: "-10%",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(46,30,20,0.48) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Glow 2: mid-left warm bloom — sits around 55% page height */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "-12%",
          width: 1300,
          height: 1300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(46,30,20,0.40) 0%, transparent 62%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Glow 3: lower-right bloom — sits near founding/CTA sections */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "78%",
          right: "-8%",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(46,30,20,0.44) 0%, transparent 64%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Scroll-drawn connector line — sits above glows (zIndex 0, later in DOM),
          behind section content (sections use zIndex 1 on their inner wrappers) */}
      <ConnectorLine />

      <LandingNavbar
        fredokaClass={fredoka.className}
        nunitoClass={nunito.className}
        onGetEarlyAccess={scrollToCTA}
      />

      {/* 1. Hero */}
      <HeroMoment fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />

      {/* 2. Platform line */}
      <PlatformLine fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />

      {/* 3–8. Six feature moments */}
      <FeatureMomentA fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />
      <FeatureMomentB fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />
      <FeatureMomentC fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />
      <FeatureMomentD fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />
      <FeatureMomentE fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />
      <FeatureMomentF fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />

      {/* 9. Stats band */}
      <StatsBand fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />

      {/* 10. Founding member */}
      <FoundingSection fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />

      {/* 11. Closing CTA */}
      <ClosingCTA fredokaClass={fredoka.className} nunitoClass={nunito.className} reduced={reduced} />

      {/* 12. Footer */}
      <LandingFooter fredokaClass={fredoka.className} nunitoClass={nunito.className} />
    </div>
  );
}
