"use client";
import { useState } from "react";
import Image from "next/image";
import { useMagnetic } from "@/hooks/useMagnetic";

export function Navbar() {
  const magnetic = useMagnetic<HTMLAnchorElement>();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className={`fixed top-3.5 left-1/2 z-[200] border border-crumb-dark/[0.06] bg-white/90 px-4 py-2 md:px-6 ${open ? "rounded-[22px]" : "rounded-full"}`}
      style={{ animation: "nav-in 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <div className="flex items-center gap-4 md:gap-7">
        <a href="#" className="flex items-center gap-1.5 font-extrabold text-[15px] tracking-tight text-crumb-dark no-underline">
          <Image
            src="/images/crumb-icon.png"
            alt="Crumb"
            width={30}
            height={30}
            className="rounded-md object-cover"
          />
          crumb
        </a>

        {/* Desktop links */}
        <div className="hidden gap-5 md:flex">
          <a href="#features" className="text-[13px] font-semibold text-crumb-brown no-underline transition-colors duration-150 hover:text-crumb-dark">
            Features
          </a>
          <a href="#pricing" className="text-[13px] font-semibold text-crumb-brown no-underline transition-colors duration-150 hover:text-crumb-dark">
            Pricing
          </a>
        </div>

        {/* Desktop CTA */}
        <a
          ref={magnetic.ref}
          onMouseEnter={magnetic.onMouseEnter}
          onMouseMove={magnetic.onMouseMove}
          onMouseLeave={magnetic.onMouseLeave}
          href="#waitlist"
          className="hidden rounded-full bg-crumb-dark px-[18px] py-[7px] text-[13px] font-bold text-crumb-cream no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(61,43,31,0.15)] md:block"
        >
          Join Waitlist
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-8 w-8 items-center justify-center rounded-lg md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5 stroke-crumb-dark" viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="mt-3 flex flex-col gap-3 border-t border-crumb-dark/[0.06] pt-3 pb-2 md:hidden">
          <a
            href="#features"
            onClick={() => setOpen(false)}
            className="text-[13px] font-semibold text-crumb-brown no-underline transition-colors duration-150"
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="text-[13px] font-semibold text-crumb-brown no-underline transition-colors duration-150"
          >
            Pricing
          </a>
          <a
            href="#waitlist"
            onClick={() => setOpen(false)}
            className="rounded-full bg-crumb-dark px-4 py-2 text-center text-[13px] font-bold text-crumb-cream no-underline"
          >
            Join Waitlist
          </a>
        </div>
      )}
    </nav>
  );
}
