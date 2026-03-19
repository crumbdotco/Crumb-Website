"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Trophy, Fingerprint, Share2 } from "lucide-react";

const wrappedCards = [
  {
    icon: Utensils,
    headline: "You ordered",
    value: "147",
    sub: "times this year",
    gradient: "from-[#8B7355] to-[#6B5335]",
  },
  {
    icon: Trophy,
    headline: "Your go-to was",
    value: "Nando's",
    sub: "21 orders and counting",
    gradient: "from-[#A0785A] to-[#7A5838]",
  },
  {
    icon: Fingerprint,
    headline: "Your food personality",
    value: "Creature of Habit",
    sub: "You know what you like",
    gradient: "from-[#6B5335] to-[#3D2B1F]",
  },
  {
    icon: Share2,
    headline: "",
    value: "Share your story",
    sub: "Let your friends see your Wrapped",
    gradient: "from-[#3D2B1F] to-[#1A1208]",
  },
];

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
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #8B7355, #3D2B1F)",
      }}
    >
      {/* Top gradient — blend from HowItWorks dark */}
      <div className="absolute top-0 left-0 right-0 h-24 z-10" style={{ background: "linear-gradient(to bottom, #1A1208, transparent)" }} />
      <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left text */}
        <div className="lg:w-[40%] text-center lg:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-crumb-cream/60 mb-4">
            Crumb Wrapped
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-crumb-cream mb-6">
            Your year in food delivery
          </h2>
          <p className="text-base md:text-lg text-crumb-cream/70 leading-relaxed mb-8">
            Every December, get your personalised Crumb Wrapped. Share your food
            personality, your top restaurants, and your ordering habits with
            friends.
          </p>
          <a
            href="#waitlist"
            className="text-crumb-cream underline underline-offset-4 hover:text-white transition-colors font-medium"
          >
            Get your Wrapped
          </a>
        </div>

        {/* Right carousel */}
        <div
          className="lg:w-[60%] flex justify-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative w-[260px] md:w-[300px] aspect-[9/16]">
            <AnimatePresence mode="wait">
              {wrappedCards.map(
                (card, i) =>
                  i === activeCard && (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className={`absolute inset-0 bg-gradient-to-b ${card.gradient} rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-2xl`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                        <card.icon size={28} className="text-white" />
                      </div>
                      {card.headline && (
                        <p className="text-sm text-crumb-cream/70 mb-2">
                          {card.headline}
                        </p>
                      )}
                      <p className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                        {card.value}
                      </p>
                      <p className="text-sm text-crumb-cream/60">{card.sub}</p>
                    </motion.div>
                  )
              )}
            </AnimatePresence>

            {/* Card dots */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
              {wrappedCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCard(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeCard ? "bg-white w-6" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom gradient — blend into cream FeaturesGrid */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-crumb-cream z-10" />
    </section>
  );
}
