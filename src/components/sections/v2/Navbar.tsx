'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Discover', href: '#discover' },
  { label: 'Waitlist', href: '#waitlist' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-[940px]"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
    >
      <nav
        className="flex items-center justify-between px-5 py-2.5 rounded-2xl border transition-shadow duration-300"
        style={{
          background: 'rgba(14,8,5,0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderColor: 'rgba(230,195,155,0.12)',
          boxShadow: scrolled
            ? '0 12px 48px rgba(0,0,0,0.6)'
            : '0 4px 20px rgba(0,0,0,0.3)',
        }}
        aria-label="Primary navigation"
      >
        <a
          href="/"
          className="text-xl text-[#E6C39B] tracking-[0.12em] font-extrabold"
          data-cursor="pointer"
        >
          CRUMBIFY
        </a>
        <ul className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#E0D5C9]/55 hover:text-[#E0D5C9] hover:bg-white/5 transition-colors duration-150"
                data-cursor="pointer"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href="#waitlist"
            className="hidden md:inline-flex px-4 py-2 rounded-[10px] bg-[#E6C39B] text-[#1A1208] text-[13px] font-bold hover:bg-[#C9A077] transition-colors duration-150"
            data-cursor="pointer"
          >
            Join Waitlist
          </a>
          <button
            className="md:hidden p-2 text-[#E0D5C9]"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            data-cursor="pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <motion.path
                d="M3 6h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                animate={open ? { d: 'M5 5l10 10M5 15l10-10' } : { d: 'M3 6h14M3 14h14' }}
              />
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden mt-2 rounded-2xl border border-[#E6C39B]/12 p-2 backdrop-blur-xl"
            style={{ background: 'rgba(14,8,5,0.92)' }}
          >
            <ul className="flex flex-col">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 rounded-lg text-[14px] font-medium text-[#E0D5C9]/80 hover:bg-white/5"
                    data-cursor="pointer"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <a
                  href="#waitlist"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-lg bg-[#E6C39B] text-[#1A1208] text-[14px] font-bold text-center"
                  data-cursor="pointer"
                >
                  Join Waitlist
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
