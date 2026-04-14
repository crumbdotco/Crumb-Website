"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTurnstile } from "@/hooks/useTurnstile";
import { useWaitlist } from "@/hooks/useWaitlist";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (isTouch || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      ref.current.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    },
    [isTouch],
  );

  const onMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

function useWaitlistCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/waitlist/count")
      .then((r) => r.json())
      .then((d: { count: number }) => setCount(d.count))
      .catch(() => setCount(900));
  }, []);
  return count;
}

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.7, ease: EASE },
  }),
};

export function CTASection() {
  const { token, containerRef: turnstileRef, hasTurnstile, reset } = useTurnstile("dark");
  const { email, setEmail, status, submit } = useWaitlist({ turnstileToken: token, honeypotId: "crumb-hp-cta" });
  const magnetic = useMagnetic<HTMLButtonElement>();
  const waitlistCount = useWaitlistCount();

  const buttonDisabled = status === "loading" || (hasTurnstile && !token);

  const handleSubmit = async (e: React.FormEvent) => {
    await submit(e);
    if (status === "error") reset();
  };

  return (
    <section id="waitlist" className="relative z-1 overflow-hidden bg-crumb-dark px-10 py-[60px] pb-20 text-center text-crumb-cream">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_400px_at_50%_50%,rgba(230,195,155,0.08),transparent_70%)]" />

      <div className="relative z-[2] mx-auto max-w-[520px]">
        <motion.h2
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          custom={0}
          className="font-display text-[clamp(26px,3.8vw,40px)] font-bold leading-[1.1] tracking-[-2px]"
        >
          Ready to see your<br />
          <span className="text-crumb-gold">food story?</span>
        </motion.h2>

        <motion.p
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          custom={1}
          className="mt-2.5 text-[15px] text-crumb-brown"
        >
          Join the waitlist. We&apos;ll email you on launch day.
        </motion.p>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mt-7 max-w-[400px] rounded-[10px] border border-crumb-gold/30 bg-crumb-gold/10 p-5"
          >
            <p className="font-bold text-crumb-cream">You&apos;re on the list!</p>
            <p className="mt-1 text-xs text-crumb-brown">We&apos;ll email you on launch day.</p>
          </motion.div>
        ) : (
          <motion.form
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            custom={2}
            onSubmit={handleSubmit}
            className="mx-auto mt-7 max-w-[400px]"
          >
            {/* Honeypot */}
            <input
              id="crumb-hp-cta"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute h-0 w-0 overflow-hidden opacity-0 pointer-events-none"
            />
            <div className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-l-[10px] border-[1.5px] border-r-0 border-crumb-gold/15 bg-white/[0.06] px-3.5 py-3 text-sm text-crumb-cream outline-none transition-all duration-150 placeholder:text-crumb-muted focus:border-crumb-gold/30 focus:bg-white/[0.1]"
              />
              <button
                ref={magnetic.ref}
                onMouseMove={magnetic.onMouseMove}
                onMouseLeave={magnetic.onMouseLeave}
                type="submit"
                disabled={buttonDisabled}
                className="whitespace-nowrap rounded-r-[10px] bg-crumb-gold px-5 py-3 text-[13px] font-bold text-crumb-darkest transition-transform duration-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "loading" ? "Joining..." : "Join Waitlist"}
              </button>
            </div>
            <div ref={turnstileRef} className="mt-2" />
          </motion.form>
        )}

        {status === "error" && (
          <p className="mt-2 text-xs text-red-400">Something went wrong. Please try again.</p>
        )}

        {waitlistCount !== null && (
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            custom={3}
            className="mt-5 flex items-center justify-center gap-2 text-xs text-crumb-brown"
          >
            <span className="h-[7px] w-[7px] rounded-full bg-green-400" style={{ animation: "pulse-dot 2s infinite" }} />
            {waitlistCount.toLocaleString()}+ people on the waitlist
          </motion.div>
        )}
      </div>
    </section>
  );
}
