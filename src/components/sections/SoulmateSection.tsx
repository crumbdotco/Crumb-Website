"use client";
import { motion } from "framer-motion";
import { Users, Utensils, MessageCircle } from "lucide-react";
import { FlowingBackground } from "../shared/FlowingBackground";

const bullets = [
  {
    icon: Users,
    text: "Match with friends based on cuisine preferences",
  },
  {
    icon: Utensils,
    text: "Compare your food personalities",
  },
  {
    icon: MessageCircle,
    text: "Group recommendations for ordering together",
  },
];

export function SoulmateSection() {
  return (
    <section className="relative bg-crumb-cream py-24 md:py-32 overflow-hidden">
      <FlowingBackground />
      <div className="relative max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Left phone mockups */}
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-[300px] md:w-[380px] h-[400px] md:h-[500px]">
            {/* Back phone */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="absolute top-0 left-0 w-[200px] md:w-[240px] aspect-[9/19.5] bg-crumb-card rounded-[2rem] border-2 border-crumb-brown/20 shadow-xl rotate-[-6deg] overflow-hidden"
            >
              <div className="p-4 pt-8 flex flex-col gap-3">
                <div className="text-xs font-bold text-crumb-dark">Food Soulmate</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-crumb-brown" />
                  <div>
                    <div className="h-2 w-16 bg-crumb-dark/20 rounded" />
                    <div className="h-2 w-12 bg-crumb-dark/10 rounded mt-1" />
                  </div>
                </div>
                <div className="text-center mt-4">
                  <div className="text-3xl font-extrabold text-crumb-dark">92%</div>
                  <div className="text-[10px] text-crumb-brown mt-1">taste match</div>
                </div>
                <div className="space-y-1.5 mt-3">
                  <div className="h-2 bg-crumb-dark/10 rounded-full w-full" />
                  <div className="h-2 bg-crumb-dark/10 rounded-full w-4/5" />
                  <div className="h-2 bg-crumb-dark/10 rounded-full w-3/5" />
                </div>
              </div>
            </motion.div>

            {/* Front phone */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="absolute bottom-0 right-0 w-[200px] md:w-[240px] aspect-[9/19.5] bg-crumb-cream rounded-[2rem] border-2 border-crumb-brown/20 shadow-2xl rotate-[4deg] overflow-hidden"
            >
              <div className="p-4 pt-8 flex flex-col gap-3">
                <div className="text-xs font-bold text-crumb-dark">Compare</div>
                <div className="flex justify-around mt-2">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-crumb-card" />
                    <div className="text-[9px] text-crumb-dark mt-1">You</div>
                  </div>
                  <div className="text-lg font-bold text-crumb-brown mt-2">vs</div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-crumb-brown" />
                    <div className="text-[9px] text-crumb-dark mt-1">Alex</div>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {["Italian", "Indian", "Chinese"].map((cuisine) => (
                    <div key={cuisine} className="flex items-center gap-2">
                      <span className="text-[9px] text-crumb-dark w-10">{cuisine}</span>
                      <div className="flex-1 h-2 bg-crumb-line rounded-full overflow-hidden">
                        <div
                          className="h-full bg-crumb-brown rounded-full"
                          style={{ width: `${40 + Math.random() * 50}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:w-1/2"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-crumb-muted mb-4">
            Food Soulmate
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-crumb-dark mb-6">
            Find your perfect food match
          </h2>
          <p className="text-base md:text-lg text-crumb-muted leading-relaxed mb-8">
            Crumb compares your taste profile with your friends. See your match
            percentage, shared favourites, and where your tastes differ.
          </p>

          <div className="space-y-5">
            {bullets.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-crumb-card flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} className="text-crumb-dark" />
                  </div>
                  <span className="text-sm md:text-base text-crumb-dark/80 leading-relaxed">
                    {b.text}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
