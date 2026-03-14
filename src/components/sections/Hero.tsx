"use client";
import { motion } from "framer-motion";
import { FlowingBackground } from "../shared/FlowingBackground";
import { ContainerScroll } from "../ui/container-scroll-animation";
import { PhoneMockup } from "./PhoneMockup";

function AnimatedHeadline() {
  const lines = ["Your food.", "Your stats.", "Your story."];

  return (
    <div className="flex flex-col items-center">
      {lines.map((line, lineIdx) => {
        const words = line.split(" ");
        return (
          <div key={lineIdx} className="overflow-hidden">
            {words.map((word, wordIdx) => {
              const globalIdx = lineIdx * 2 + wordIdx;
              return (
                <span
                  key={wordIdx}
                  className="inline-block overflow-hidden mr-[0.3em]"
                >
                  <motion.span
                    className="inline-block text-5xl sm:text-7xl md:text-8xl lg:text-[96px] font-extrabold tracking-tight text-crumb-dark"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + globalIdx * 0.15,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function AnimatedSubheadline() {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="text-lg md:text-xl text-crumb-muted max-w-[600px] mx-auto text-center leading-relaxed"
    >
      Crumb connects to Uber Eats and Just Eat, pulls your entire order history,
      and turns it into beautiful stats, a Spotify Wrapped for food, and more.
    </motion.p>
  );
}

function CTAButtons() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.5 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="#waitlist"
          className="inline-flex items-center justify-center px-8 h-14 bg-crumb-dark text-white text-base font-semibold rounded-full hover:scale-[1.02] hover:shadow-xl transition-all"
        >
          Join the Waitlist
        </a>
        <a
          href="#features"
          className="inline-flex items-center justify-center px-8 h-14 border-2 border-crumb-dark text-crumb-dark text-base font-semibold rounded-full hover:bg-crumb-dark/5 transition-all"
        >
          See how it works ↓
        </a>
      </div>
      <p className="text-xs text-crumb-muted">
        Available on iOS and Android
      </p>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative bg-crumb-cream overflow-hidden">
      <FlowingBackground />
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center gap-6 pt-20">
            <AnimatedHeadline />
            <AnimatedSubheadline />
            <CTAButtons />
          </div>
        }
      >
        <PhoneMockup />
      </ContainerScroll>
    </section>
  );
}
