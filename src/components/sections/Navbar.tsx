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
          ? "bg-crumb-cream/90 backdrop-blur-xl border-b border-crumb-line"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.span
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xl font-extrabold text-crumb-dark tracking-tight"
        >
          crumb
        </motion.span>

        <motion.a
          href="#waitlist"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center px-5 py-2 bg-crumb-dark text-white text-sm font-semibold rounded-full hover:scale-[1.02] hover:shadow-lg transition-all"
        >
          Join the waitlist
        </motion.a>
      </div>
    </nav>
  );
}
