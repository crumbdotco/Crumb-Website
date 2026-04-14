"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTurnstile } from "@/hooks/useTurnstile";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useMagnetic } from "@/hooks/useMagnetic";

/* ── Count-up hook ── */
function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const prev = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done.current) {
          done.current = true;
          const start = performance.now();
          (function tick(now: number) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const rounded = Math.round(eased * target);
            if (rounded !== prev.current) {
              prev.current = rounded;
              setValue(rounded);
            }
            if (p < 1) requestAnimationFrame(tick);
          })(start);
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return { ref, value };
}

/* ── Waitlist count ── */
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

/* ── Receipt ── */
function Receipt() {
  return (
    <div
      className="relative max-w-[260px] rounded bg-white p-5 px-6 font-mono text-crumb-darkest shadow-[0_8px_32px_rgba(61,43,31,0.12)]"
      style={{ transform: "rotate(-1.5deg)", animation: "receipt-in 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both" }}
    >
      <div className="border-b-[1.5px] border-dashed border-crumb-line pb-2 mb-2 text-center">
        <h4 className="text-xs font-black font-sans">Your 2025 Receipt</h4>
        <span className="text-[10px] text-crumb-brown">Uber Eats &middot; Just Eat</span>
      </div>
      {[
        ["Orders", "147"],
        ["Restaurants", "38"],
        ["Top Cuisine", "Indian"],
        ["Favourite", "Nando's"],
      ].map(([lab, val]) => (
        <div key={lab} className="flex justify-between py-0.5 text-[11px]">
          <span className="text-crumb-brown">{lab}</span>
          <span className="font-bold">{val}</span>
        </div>
      ))}
      <div className="mt-1.5 border-t-[1.5px] border-dashed border-crumb-line pt-1.5 flex justify-between text-sm font-black font-sans">
        <span>TOTAL</span>
        <span className="text-crumb-red">&pound;2,847</span>
      </div>
      {/* Scallop edge */}
      <div
        className="absolute -bottom-2.5 left-0 right-0 h-2.5"
        style={{
          background:
            "linear-gradient(135deg, #fff 33.3%, transparent 33.3%) -10px 0, linear-gradient(225deg, #fff 33.3%, transparent 33.3%) -10px 0",
          backgroundSize: "10px 10px",
        }}
      />
    </div>
  );
}

/* ── Stats Panel ── */
function StatsPanel() {
  const spent = useCountUp(2847);
  const restaurants = useCountUp(38);
  const soulmate = useCountUp(92);

  return (
    <div
      className="rounded-[18px] border border-crumb-dark/[0.06] bg-white/45 p-5 backdrop-blur-[8px]"
      style={{ animation: "panel-in 1s cubic-bezier(0.16,1,0.3,1) 0.4s both" }}
    >
      <div className="mb-2.5 text-center text-[10px] uppercase tracking-[2px] text-crumb-muted">
        What you&apos;ll discover
      </div>
      <div className="grid grid-cols-2 gap-[7px]">
        {/* Featured wide card */}
        <div className="col-span-2 rounded-xl border border-crumb-gold/30 bg-crumb-gold/25 p-3.5 transition-transform duration-200 ease-out hover:-translate-y-0.5">
          <div className="text-[9px] uppercase tracking-[0.5px] text-crumb-muted">Total Spent</div>
          <div ref={spent.ref} className="mt-0.5 text-[34px] font-black tracking-tight text-[#6B4E1F]">
            &pound;{spent.value.toLocaleString()}
          </div>
          <div className="text-[10px] text-crumb-brown">across 147 orders this year</div>
        </div>
        {/* Small cards */}
        <StatCard label="Top Spot" value="Nando's" sub="21 orders" valueSize="text-lg" />
        <StatCard label="Personality" value="Main Character" sub="top 3%" valueSize="text-sm" />
        <StatCard label="Restaurants">
          <span ref={restaurants.ref} className="mt-0.5 text-2xl font-black tracking-tight text-crumb-dark">
            {restaurants.value}
          </span>
          <div className="text-[10px] text-crumb-brown">on your food map</div>
        </StatCard>
        <StatCard label="Soulmate">
          <span ref={soulmate.ref} className="mt-0.5 text-2xl font-black tracking-tight text-crumb-dark">
            {soulmate.value}%
          </span>
          <div className="text-[10px] text-crumb-brown">taste match</div>
        </StatCard>
        {/* Bar chart */}
        <div className="col-span-2 rounded-xl border border-crumb-dark/5 bg-white/50 px-3.5 py-2.5 transition-transform duration-200 ease-out hover:-translate-y-0.5">
          <div className="text-[9px] uppercase tracking-[0.5px] text-crumb-muted">Weekly Spending</div>
          <div className="mt-2 flex items-end gap-1 h-[38px]">
            {[35, 55, 25, 80, 45, 60, 30].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-[3px] ${i === 3 ? "bg-crumb-brown" : "bg-crumb-dark/[0.08]"}`}
                style={{ height: `${h}%`, minHeight: 6 }}
              />
            ))}
          </div>
          <div className="mt-[3px] flex gap-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} className="flex-1 text-center text-[8px] text-crumb-muted">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  valueSize = "text-2xl",
  children,
}: {
  label: string;
  value?: string;
  sub?: string;
  valueSize?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-crumb-dark/5 bg-white/50 p-3.5 transition-transform duration-200 ease-out hover:-translate-y-0.5">
      <div className="text-[9px] uppercase tracking-[0.5px] text-crumb-muted">{label}</div>
      {children ?? (
        <>
          <div className={`mt-0.5 font-black tracking-tight text-crumb-dark ${valueSize}`}>{value}</div>
          {sub && <div className="text-[10px] text-crumb-brown">{sub}</div>}
        </>
      )}
    </div>
  );
}

/* ── Hero ── */
export function Hero() {
  const { token, containerRef: turnstileRef, hasTurnstile, reset } = useTurnstile("light");
  const { email, setEmail, status, submit } = useWaitlist({ turnstileToken: token });
  const magnetic = useMagnetic<HTMLButtonElement>();
  const waitlistCount = useWaitlistCount();

  const buttonDisabled = status === "loading" || (hasTurnstile && !token);

  const handleSubmit = async (e: React.FormEvent) => {
    await submit(e);
    if (status === "error") reset();
  };

  return (
    <section className="relative z-1 flex min-h-screen items-center justify-center overflow-hidden px-5 pb-[60px] pt-24 md:px-10 md:pt-20">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_400px_at_40%_45%,rgba(230,195,155,0.2),transparent_70%)]" />

      <div className="relative z-[2] grid w-full max-w-[960px] grid-cols-1 items-center gap-9 md:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <div>
            <h1
              className="text-[clamp(30px,4.2vw,48px)] font-black leading-[1.05] tracking-[-2.5px] text-crumb-dark"
              style={{ animation: "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}
            >
              Your food delivery<br />
              <span className="text-crumb-brown">receipt.</span>
            </h1>
            <p
              className="mt-4 max-w-[380px] text-[15px] leading-relaxed text-crumb-brown"
              style={{ animation: "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s both" }}
            >
              Connect Uber Eats &amp; Just Eat. See every order, every pound, every guilty pleasure.
            </p>
          </div>

          <Receipt />

          {/* Waitlist form */}
          <div style={{ animation: "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s both" }}>
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[10px] border border-crumb-gold/30 bg-crumb-gold/10 p-4 text-center"
              >
                <p className="font-bold text-crumb-dark">You&apos;re on the list!</p>
                <p className="mt-1 text-xs text-crumb-brown">We&apos;ll email you on launch day.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Honeypot */}
                <input
                  id="crumb-hp"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute h-0 w-0 overflow-hidden opacity-0 pointer-events-none"
                />
                <div className="flex max-w-[360px]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 rounded-l-[10px] border-[1.5px] border-r-0 border-crumb-dark/[0.12] bg-white/50 px-3.5 py-3 text-sm text-crumb-dark outline-none transition-all duration-150 placeholder:text-[#B0A090] focus:border-crumb-dark/25 focus:bg-white/75"
                  />
                  <button
                    ref={magnetic.ref}
                    onMouseEnter={magnetic.onMouseEnter}
                    onMouseMove={magnetic.onMouseMove}
                    onMouseLeave={magnetic.onMouseLeave}
                    type="submit"
                    disabled={buttonDisabled}
                    className="whitespace-nowrap rounded-r-[10px] bg-crumb-dark px-5 py-3 text-[13px] font-bold text-crumb-cream transition-transform duration-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status === "loading" ? "Joining..." : "Join Waitlist"}
                  </button>
                </div>
                <div ref={turnstileRef} className="mt-2" />
              </form>
            )}
            {status === "error" && (
              <p className="mt-2 text-xs text-red-500">Something went wrong. Please try again.</p>
            )}
            <p className="mt-1.5 text-[11px] text-crumb-muted">We&apos;ll email you on launch day.</p>
            {waitlistCount !== null && (
              <div className="mt-3 flex items-center gap-2 text-xs text-crumb-brown">
                <span className="h-[7px] w-[7px] rounded-full bg-green-400" style={{ animation: "pulse-dot 2s infinite" }} />
                {waitlistCount.toLocaleString()}+ people on the waitlist
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <StatsPanel />
      </div>
    </section>
  );
}
