"use client";
import { useRef, useCallback } from "react";
import Image from "next/image";

function useMagnetic() {
  const ref = useRef<HTMLAnchorElement>(null);
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
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

export function Navbar() {
  const magnetic = useMagnetic();

  return (
    <nav
      className="fixed top-3.5 left-1/2 z-[200] flex items-center gap-7 rounded-full border border-crumb-dark/[0.06] bg-white/60 px-6 py-2 backdrop-blur-[20px]"
      style={{ animation: "nav-in 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
    >
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

      <div className="flex gap-5">
        <a href="#features" className="text-[13px] font-semibold text-crumb-brown no-underline transition-colors duration-150 hover:text-crumb-dark">
          Features
        </a>
        <a href="#pricing" className="text-[13px] font-semibold text-crumb-brown no-underline transition-colors duration-150 hover:text-crumb-dark">
          Pricing
        </a>
      </div>

      <a
        ref={magnetic.ref}
        onMouseMove={magnetic.onMouseMove}
        onMouseLeave={magnetic.onMouseLeave}
        href="#waitlist"
        className="rounded-full bg-crumb-dark px-[18px] py-[7px] text-[13px] font-bold text-crumb-cream no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(61,43,31,0.15)]"
      >
        Join Waitlist
      </a>
    </nav>
  );
}
