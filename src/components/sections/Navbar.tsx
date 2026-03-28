"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-crumb-cream/90 backdrop-blur-xl border-b border-crumb-line shadow-[0_4px_24px_rgba(61,43,31,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — slightly larger with generous letter-spacing */}
        <motion.span
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-extrabold text-crumb-dark tracking-[0.06em]"
        >
          crumb
        </motion.span>

        {/* Desktop nav links — hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="hidden md:flex items-center gap-7"
        >
          <a
            href="#features-section"
            className="text-sm font-medium text-crumb-dark/70 hover:text-crumb-dark transition-colors"
          >
            Features
          </a>
          <a
            href="#wrapped"
            className="text-sm font-medium text-crumb-dark/70 hover:text-crumb-dark transition-colors"
          >
            Wrapped
          </a>
          <a
            href="#pricing-section"
            className="text-sm font-medium text-crumb-dark/70 hover:text-crumb-dark transition-colors"
          >
            Pricing
          </a>
        </motion.div>

        {/* CTA — pill with background, more prominent on mobile too */}
        <motion.a
          href="#waitlist"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200
            bg-crumb-dark text-crumb-cream
            hover:bg-crumb-darkest hover:scale-[1.03] hover:shadow-[0_4px_20px_rgba(61,43,31,0.25)]
            ${scrolled ? "shadow-sm" : "shadow-[0_2px_12px_rgba(61,43,31,0.15)]"}
          `}
        >
          Join the waitlist
        </motion.a>
      </div>
    </nav>
  );
}
