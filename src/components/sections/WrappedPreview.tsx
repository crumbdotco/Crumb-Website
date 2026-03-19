"use client";
import { useState, useEffect, useCallback } from "react";
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

const stackPositions = [
  { scale: 1, y: 0, opacity: 1, blur: 0 },
  { scale: 0.92, y: 20, opacity: 0.7, blur: 1 },
  { scale: 0.84, y: 40, opacity: 0.4, blur: 2 },
  { scale: 0.76, y: 60, opacity: 0, blur: 3 },
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
      rotateX.set(((y - rect.height / 2) / (rect.height / 2)) * -8);
      rotateY.set(((x - rect.width / 2) / (rect.width / 2)) * 8);
    },
    [isFront, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      className="absolute inset-0"
      animate={{
        scale: pos.scale,
        y: pos.y,
        opacity: pos.opacity,
        zIndex: 4 - offset,
      }}
      transition={{ type: "spring", ...springConfig }}
      style={{
        transformPerspective: 800,
        rotateX: isFront ? springX : 0,
        rotateY: isFront ? springY : 0,
        filter: `blur(${pos.blur}px)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-3xl animated-border-gradient"
        style={{ padding: "1px" }}
      >
        <div
          className={`w-full h-full rounded-3xl flex flex-col items-center justify-center p-8 text-center ${
            isFront
              ? "bg-crumb-darkest/80 backdrop-blur-xl"
              : "bg-crumb-darkest/90"
          }`}
        >
          {/* Icon with glow */}
          <div className="relative mb-4">
            <div
              className="absolute inset-0 w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full blur-2xl"
              style={{ background: card.accent }}
            />
            <div className="relative w-14 h-14 rounded-2xl bg-white/[0.08] flex items-center justify-center">
              <Icon size={28} className="text-crumb-cream/80" />
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
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
          className="lg:w-[60%] flex justify-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative w-[260px] md:w-[300px] aspect-[9/16]">
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

            {/* Progress indicators */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
              {wrappedCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCard(i)}
                  className={`h-1 rounded-full transition-all duration-300 overflow-hidden ${
                    i === activeCard
                      ? "w-12 bg-white/10"
                      : "w-8 bg-white/10"
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
