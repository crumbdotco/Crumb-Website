"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Load Turnstile script and render widget
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || typeof window === "undefined") return;

    // Load script if not already loaded
    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => renderWidget(siteKey);
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget(siteKey);
    }
  }, []);

  function renderWidget(siteKey: string) {
    if (!turnstileRef.current || !window.turnstile) return;
    if (widgetIdRef.current) return; // already rendered

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      theme: "dark",
      callback: (token: string) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(null),
      "error-callback": () => setTurnstileToken(null),
    });
  }

  const handleJoinFree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    // Require Turnstile token if site key is configured
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (siteKey && !turnstileToken) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website: (document.getElementById("crumb-hp") as HTMLInputElement)?.value ?? "",
          turnstileToken: turnstileToken ?? "",
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        // Reset Turnstile widget for retry
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
          setTurnstileToken(null);
        }
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="waitlist" className="relative bg-crumb-darkest py-24 md:py-32 overflow-hidden">
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-bold text-crumb-cream mb-4">
          Ready to see your food story?
        </h2>
        <p className="text-crumb-muted text-lg mb-10">
          Crumb is launching soon. Join the waitlist to be first in line.
        </p>

        {/* Free Waitlist */}
        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-crumb-brown/20 border border-crumb-brown/40 rounded-2xl p-6 mb-12"
          >
            <p className="text-crumb-cream text-lg font-semibold">
              You&apos;re on the list!
            </p>
            <p className="text-crumb-muted mt-2">
              We&apos;ll email you on launch day.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleJoinFree} className="flex flex-col gap-3 mb-12">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Honeypot — hidden from humans, bots auto-fill it */}
              <input
                id="crumb-hp"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-xl bg-white/5 border border-white/15 text-crumb-cream placeholder:text-crumb-muted/50 focus:outline-none focus:border-crumb-card transition-colors"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-8 py-4 rounded-xl bg-crumb-card text-crumb-dark font-bold hover:bg-crumb-cream transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {status === "loading" ? "Joining..." : "Join Free \u2192"}
              </button>
            </div>
            {/* Cloudflare Turnstile widget — invisible/managed mode */}
            <div ref={turnstileRef} className="flex justify-center" />
          </form>
        )}

        {status === "error" && (
          <p className="text-red-400 text-sm mb-4">Something went wrong. Please try again.</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-crumb-muted/50 text-sm uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Founding Member Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl p-8 text-left"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">&#x1F451;</span>
            <h3 className="text-2xl font-bold text-crumb-cream">
              Become a Founding Member
            </h3>
          </div>

          <p className="text-crumb-muted text-lg mb-2">
            Pay once. Get premium forever.
          </p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-crumb-cream">&pound;4.99</span>
            <span className="text-crumb-muted">one-time</span>
            <span className="text-crumb-muted/50 line-through text-sm">&pound;1.99/month</span>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              "First-day access when Crumb launches",
              "Lifetime premium \u2014 never pay a subscription",
              "Exclusive \"Founding Member\" badge in your profile",
              "All future premium features included forever",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-crumb-cream/80">
                <span className="text-crumb-card mt-0.5">{"\u2713"}</span>
                {item}
              </li>
            ))}
          </ul>

          <a
            href="https://buy.stripe.com/3cI8wJ6zPaaG5XE7M33ks00"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-crumb-brown hover:bg-crumb-dark text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl text-lg"
          >
            Become a Founding Member - &pound;4.99
          </a>
        </motion.div>

        <p className="text-crumb-muted/50 text-sm mt-8">
          Available in the UK. More regions coming soon.
        </p>
      </div>
    </section>
  );
}
