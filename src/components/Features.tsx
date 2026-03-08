"use client";

import { motion } from "framer-motion";
import { useRef, useCallback } from "react";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
    title: "Stats & Insights",
    description:
      "See your top restaurants, favourite items, cuisine breakdown, ordering heatmaps, and more. Understand your food habits like never before.",
    colour: "#6C5CE7",
    gradient: "from-[#6C5CE7]/10 to-[#A29BFE]/5",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Social & Soulmates",
    description:
      "Find your food soulmate, compare tastes with friends, and see who orders the most. Share your taste profile and flex your stats.",
    colour: "#FD79A8",
    gradient: "from-[#FD79A8]/10 to-[#FDCB6E]/5",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
        <path d="M18 12a2 2 0 000 4h4v-4z" />
      </svg>
    ),
    title: "Wrapped",
    description:
      "Get your Spotify Wrapped-style food delivery recap. Relive your year in orders, discover your personality type, and share with friends.",
    colour: "#FDCB6E",
    gradient: "from-[#FDCB6E]/10 to-[#E17055]/5",
  },
];

function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty("--spotlight-x", `${x}px`);
    ref.current.style.setProperty("--spotlight-y", `${y}px`);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-28 md:py-36">
      <div className="section-divider mx-auto max-w-md" />
      <div className="mx-auto max-w-6xl px-6 pt-28 md:pt-36">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            Features
          </motion.span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Everything you need to know about
            <br />
            <span className="gradient-text">your food delivery habits</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-muted md:text-lg">
            Connect your accounts and let Crumb do the rest. We turn your order
            history into beautiful, personalised insights.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <SpotlightCard
                className={`group relative rounded-2xl border border-border/60 bg-gradient-to-br ${feature.gradient} p-8 transition-all duration-300 hover:border-border card-hover`}
              >
                <div className="relative z-10">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: feature.colour + "18",
                      color: feature.colour,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Learn more
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
