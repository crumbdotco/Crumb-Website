"use client";
import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK ?? "";
const isBrowser = typeof window !== "undefined";
const isTouch = isBrowser && "ontouchstart" in window;

/* ── RAF-throttled Tilt hook (desktop only) ── */
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const rect = useRef<DOMRect | null>(null);

  const onMouseEnter = useCallback(() => {
    if (isTouch || !ref.current) return;
    rect.current = ref.current.getBoundingClientRect();
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouch || !ref.current || !rect.current) return;
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        if (!ref.current || !rect.current) return;
        const x = (e.clientX - rect.current.left) / rect.current.width - 0.5;
        const y = (e.clientY - rect.current.top) / rect.current.height - 0.5;
        ref.current.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-3px) scale(1.01)`;
        raf.current = 0;
      });
    },
    [],
  );

  const onMouseLeave = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    rect.current = null;
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return { ref, onMouseEnter, onMouseMove, onMouseLeave };
}

/* ── Bento Card ── */
function BentoCard({
  icon,
  title,
  desc,
  large,
  highlight,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  large?: boolean;
  highlight?: boolean;
  children?: React.ReactNode;
  delay?: number;
}) {
  const tilt = useTilt();
  const base = highlight
    ? "bg-crumb-dark text-crumb-cream border-none"
    : "bg-white/50 border border-crumb-dark/[0.06] backdrop-blur-[4px]";

  return (
    <motion.div
      ref={tilt.ref}
      onMouseEnter={tilt.onMouseEnter}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`bento-card cursor-default overflow-hidden rounded-[18px] ${large ? "md:col-span-2 md:row-span-2 p-6 md:p-8" : "p-6"} ${base}`}
    >
      <div
        className={`flex items-center justify-center rounded-[10px] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-[5deg] ${
          large ? "mb-3.5 h-[50px] w-[50px] rounded-[14px]" : "mb-3.5 h-10 w-10"
        } ${highlight ? "bg-crumb-gold/[0.12]" : "bg-crumb-dark/[0.06]"}`}
      >
        {icon}
      </div>
      <h3 className={`font-extrabold tracking-tight ${large ? "text-xl" : "text-base"}`}>{title}</h3>
      <p className={`mt-1 leading-relaxed ${highlight ? "text-crumb-brown" : "text-crumb-brown"} ${large ? "max-w-[340px] text-sm" : "text-xs"}`}>
        {desc}
      </p>
      {children}
    </motion.div>
  );
}

/* ── Checkmark icon ── */
function Chk({ gold }: { gold?: boolean }) {
  return <Check className={`h-[15px] w-[15px] flex-shrink-0 ${gold ? "stroke-crumb-gold" : "stroke-crumb-brown"}`} strokeWidth={2} />;
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function FeaturesGrid() {
  return (
    <section id="features" className="relative z-1 bg-crumb-cream px-5 py-[50px] pb-16 md:px-10 md:py-[60px] md:pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_500px_400px_at_70%_30%,rgba(230,195,155,0.15),transparent_70%)]" />

      <div className="relative z-[2] mx-auto max-w-[960px]">
        {/* Header — single observer for group */}
        <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-crumb-brown">Features</p>
          <h2 className="mt-2.5 font-display text-[clamp(26px,3.8vw,40px)] font-bold tracking-[-2px]">
            Everything you didn&apos;t<br />know you needed.
          </h2>
          <p className="mt-1.5 max-w-[460px] text-[15px] text-crumb-brown">
            Your orders tell a story. We help you read it.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="mt-10 grid grid-cols-1 gap-2.5 md:grid-cols-3">
          <BentoCard
            large
            delay={0.06}
            icon={<svg className="h-[26px] w-[26px] stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>}
            title="Crumb Wrapped"
            desc="Every December, get your year in food delivery. Top restaurants, total spent, food personality — shareable, beautiful, yours."
          >
            <div className="mt-5 rounded-xl border border-crumb-dark/5 bg-crumb-dark/[0.04] p-4">
              <div className="flex gap-2">
                {[
                  { num: "147", label: "Orders" },
                  { num: "£2.8k", label: "Spent" },
                  { num: "38", label: "Places" },
                ].map((c) => (
                  <div key={c.label} className="flex-1 rounded-[10px] bg-crumb-dark p-3.5 text-center text-crumb-cream transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:scale-[1.02]">
                    <div className="font-display text-[26px] font-bold text-crumb-gold">{c.num}</div>
                    <div className="mt-[3px] text-[9px] uppercase tracking-[0.5px] text-crumb-brown">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          <BentoCard
            delay={0.12}
            icon={<svg className="h-5 w-5 stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>}
            title="Deep Stats"
            desc="Spending trends, peak hours, cuisine breakdowns, order frequency."
          />

          <BentoCard
            delay={0.18}
            icon={<svg className="h-5 w-5 stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>}
            title="Food Map"
            desc="Every restaurant pinned. See where you've been, discover where to go."
          />

          <BentoCard
            highlight
            delay={0.24}
            icon={<svg className="h-5 w-5 stroke-crumb-gold fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>}
            title="Food Soulmate"
            desc="Find your taste twin. Match percentage, shared favourites, compare side by side."
          />

          <BentoCard
            delay={0.3}
            icon={<svg className="h-5 w-5 stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
            title="Reviews"
            desc="Rate restaurants, write notes, build your personal food diary."
          />

          <BentoCard
            delay={0.36}
            icon={<svg className="h-5 w-5 stroke-crumb-dark fill-none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>}
            title="Friends"
            desc="Add friends, compare stats, flex your spending."
          />
        </div>

        {/* ── Pricing ── */}
        <div id="pricing" className="mt-[60px]">
          <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-crumb-brown">Pricing</p>
            <h2 className="mt-2.5 font-display text-[clamp(22px,3.2vw,34px)] font-bold tracking-[-1.5px]">
              Start free. Upgrade<br />when you want more.
            </h2>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {/* Free tier */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[22px] border border-crumb-dark/[0.06] bg-white/50 p-8 backdrop-blur-[4px] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px]"
            >
              <p className="text-[11px] font-bold uppercase tracking-[2px] text-crumb-brown">Free</p>
              <div className="mt-1.5 font-display text-[44px] font-bold tracking-[-3px]">
                &pound;0 <small className="text-[15px] font-medium tracking-normal text-crumb-muted">/month</small>
              </div>
              <ul className="mt-5 flex flex-col gap-2">
                {["Basic spending stats", "Restaurant map", "Rate & review", "Food personality", "Add friends", "Crumb Wrapped"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-[#5A4D3E]">
                    <Chk /> {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Premium tier */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[22px] bg-crumb-dark p-8 text-crumb-cream shadow-[0_14px_40px_rgba(61,43,31,0.2)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:shadow-[0_20px_48px_rgba(61,43,31,0.28)]"
            >
              <p className="text-[11px] font-bold uppercase tracking-[2px] text-crumb-gold">Premium</p>
              <div className="mt-1.5 font-display text-[44px] font-bold tracking-[-3px]">
                &pound;4.99 <small className="text-[15px] font-medium tracking-normal text-crumb-muted">/month</small>
              </div>
              <p className="text-xs text-crumb-muted">or &pound;49.99/year</p>
              <ul className="mt-5 flex flex-col gap-2">
                {["Everything in Free", "Advanced analytics", "Food soulmate matching", "Unlimited history", "No ads", "Export your data"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-crumb-muted">
                    <Chk gold /> {f}
                  </li>
                ))}
              </ul>

              {/* Founding badge */}
              <div className="mt-5 rounded-xl border border-crumb-gold/15 bg-crumb-gold/10 px-[18px] py-3.5" style={{ animation: "f-pulse 3s ease-in-out infinite" }}>
                <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-crumb-gold">
                  <Star className="h-[15px] w-[15px] stroke-crumb-gold" strokeWidth={2} fill="none" />
                  Founding Member — &pound;4.99 once
                </div>
                <p className="mt-[3px] text-[11px] text-crumb-brown">Pay once, get Premium forever. Limited spots.</p>
              </div>

              {STRIPE_LINK ? (
                <a
                  href={STRIPE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 block w-full rounded-[10px] bg-crumb-gold py-3 text-center text-sm font-bold text-crumb-darkest transition-colors hover:bg-crumb-cream"
                >
                  Become a Founding Member
                </a>
              ) : (
                <button
                  disabled
                  className="mt-5 block w-full cursor-not-allowed rounded-[10px] bg-crumb-gold/30 py-3 text-center text-sm font-bold text-crumb-cream/30"
                >
                  Become a Founding Member
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
