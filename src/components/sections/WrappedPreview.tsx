"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Utensils, Trophy, Fingerprint, Share2 } from "lucide-react";
import { EtherealShadow } from "../ui/ethereal-shadow";

const wrappedCards = [
  {
    icon: Utensils,
    headline: "You ordered",
    value: "147",
    sub: "times this year",
    accent: "rgba(139, 115, 85, 0.2)",
  },
  {
    icon: Trophy,
    headline: "Your go-to was",
    value: "Nando\u2019s",
    sub: "21 orders and counting",
    accent: "rgba(160, 120, 90, 0.2)",
  },
  {
    icon: Fingerprint,
    headline: "Your food personality",
    value: "Main Character",
    sub: "You order like the protagonist",
    accent: "rgba(107, 83, 53, 0.2)",
  },
  {
    icon: Share2,
    headline: "",
    value: "Share your story",
    sub: "Let your friends see your Wrapped",
    accent: "rgba(61, 43, 31, 0.25)",
  },
];

const springConfig = { stiffness: 300, damping: 30 };

// More dramatic stack: larger scale & blur differences
const stackPositions = [
  { scale: 1,    y: 0,   opacity: 1,    blur: 0 },
  { scale: 0.88, y: 28,  opacity: 0.65, blur: 2 },
  { scale: 0.76, y: 56,  opacity: 0.35, blur: 5 },
  { scale: 0.64, y: 80,  opacity: 0,    blur: 8 },
];

// Floating particle component
function FloatingParticle({ x, y, size, delay, duration }: {
  x: number; y: number; size: number; delay: number; duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-crumb-brown/20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{
        y: [0, -18, 0],
        opacity: [0.15, 0.45, 0.15],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

const particles = [
  { x: 8,  y: 15, size: 4,  delay: 0,   duration: 4.2 },
  { x: 82, y: 20, size: 6,  delay: 0.8, duration: 5.1 },
  { x: 15, y: 72, size: 3,  delay: 1.6, duration: 3.8 },
  { x: 75, y: 65, size: 5,  delay: 0.4, duration: 4.7 },
  { x: 50, y: 88, size: 4,  delay: 2.0, duration: 5.5 },
  { x: 92, y: 45, size: 3,  delay: 1.2, duration: 4.0 },
  { x: 25, y: 40, size: 5,  delay: 2.5, duration: 4.9 },
  { x: 60, y: 10, size: 4,  delay: 0.6, duration: 3.6 },
];

function TiltCard({
  card,
  offset,
  onClick,
}: {
  card: (typeof wrappedCards)[number];
  offset: number;
  onClick: () => void;
}) {
  const isFront = offset === 0;
  const pos = stackPositions[offset] ?? stackPositions[3];
  const Icon = card.icon;

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, springConfig);
  const springY = useSpring(rotateY, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isFront) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      rotateX.set(((y - rect.height / 2) / (rect.height / 2)) * -10);
      rotateY.set(((x - rect.width / 2) / (rect.width / 2)) * 10);
    },
    [isFront, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  const ariaLabel = card.headline
    ? `${card.headline} ${card.value} — ${card.sub}`
    : `${card.value} — ${card.sub}`;

  return (
    <motion.div
      role="button"
      tabIndex={isFront ? 0 : -1}
      aria-label={ariaLabel}
      className="absolute inset-0"
      animate={{
        scale: pos.scale,
        y: pos.y,
        opacity: pos.opacity,
        zIndex: 4 - offset,
      }}
      transition={{ type: "spring", ...springConfig }}
      style={{
        transformPerspective: 900,
        rotateX: isFront ? springX : 0,
        rotateY: isFront ? springY : 0,
        filter: `blur(${pos.blur}px)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      onClick={onClick}
    >
      {/* Animated gradient border — slightly more vivid */}
      <div
        className="absolute inset-0 rounded-3xl animated-border-gradient"
        style={{ padding: "1.5px" }}
      >
        <div
          className={`w-full h-full rounded-3xl flex flex-col items-center justify-center p-8 text-center ${
            isFront
              ? "bg-crumb-darkest/80 backdrop-blur-xl"
              : "bg-crumb-darkest/90"
          }`}
        >
          {/* Icon with glow */}
          <div className="relative mb-6">
            <div
              className="absolute inset-0 w-28 h-28 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full blur-2xl"
              style={{ background: card.accent }}
            />
            <div className="relative w-16 h-16 rounded-2xl bg-white/[0.08] flex items-center justify-center">
              <Icon size={32} className="text-crumb-cream/80" />
            </div>
          </div>

          {card.headline && (
            <p className="text-sm text-crumb-cream/60 mb-2">{card.headline}</p>
          )}
          <p className="text-3xl md:text-4xl font-extrabold text-crumb-cream mb-2">
            {card.value}
          </p>
          <p className="text-sm text-crumb-muted">{card.sub}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function WrappedPreview() {
  const [activeCard, setActiveCard] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % wrappedCards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <section
      id="wrapped"
      ref={sectionRef}
      className="relative bg-crumb-darkest py-24 md:py-32 overflow-hidden"
    >
      {/* Ethereal background */}
      <div className="absolute inset-0 z-0">
        <EtherealShadow
          color="rgba(139, 115, 85, 0.25)"
          animation={{ scale: 60, speed: 40 }}
          noise={{ opacity: 0.2, scale: 1 }}
          sizing="fill"
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(26,18,8,0.65) 100%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
        {/* Left text */}
        <div className="lg:w-[40%] text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium uppercase tracking-[0.2em] text-crumb-muted mb-4"
          >
            Crumb Wrapped
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-crumb-cream mb-6"
          >
            Your year in food delivery
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-crumb-cream/70 leading-relaxed mb-8"
          >
            Every December, get your personalised Crumb Wrapped. Share your food
            personality, your top restaurants, and your ordering habits with
            friends.
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            href="#waitlist"
            className="text-crumb-cream underline underline-offset-4 hover:text-white transition-colors font-medium"
          >
            Get your Wrapped
          </motion.a>
        </div>

        {/* Right card stack */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:w-[60%] flex justify-center w-full"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Larger cards on mobile + desktop for more drama */}
          <div className="relative w-[280px] sm:w-[320px] md:w-[340px] aspect-[9/16]">
            {wrappedCards.map((card, i) => {
              const offset =
                (i - activeCard + wrappedCards.length) % wrappedCards.length;
              return (
                <TiltCard
                  key={i}
                  card={card}
                  offset={offset}
                  onClick={() => setActiveCard(i)}
                />
              );
            })}

            {/* Progress indicators — larger and more interactive */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2.5 items-center">
              {wrappedCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCard(i)}
                  aria-label={`Go to card ${i + 1}`}
                  className={`rounded-full transition-all duration-300 overflow-hidden
                    ${i === activeCard
                      ? "w-14 h-2 bg-white/10"
                      : "w-2 h-2 bg-white/15 hover:bg-white/30"
                    }`}
                >
                  {i === activeCard && (
                    <motion.div
                      key={activeCard}
                      className="h-full bg-crumb-cream rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
