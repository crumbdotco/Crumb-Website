"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function ScrollFX() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let lenis: Lenis | null = null;
    let rafId = 0;
    let parRafId = 0;

    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    const raf = (time: number) => {
      lenis?.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const closeMenu = () => {
      const burger = document.getElementById("burger");
      const mnav = document.getElementById("mnav");
      burger?.classList.remove("open");
      mnav?.classList.remove("open");
      window.setTimeout(() => {
        if (!mnav?.classList.contains("open")) mnav?.classList.remove("show");
      }, 350);
    };

    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const anchorHandlers: { el: HTMLAnchorElement; handler: (e: Event) => void }[] = [];
    anchors.forEach((a) => {
      const id = a.getAttribute("href");
      if (!id || id.length <= 1) return;
      const handler = (e: Event) => {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target as HTMLElement, { offset: -70 });
          } else {
            (target as HTMLElement).scrollIntoView({ behavior: "smooth" });
          }
          closeMenu();
        }
      };
      a.addEventListener("click", handler);
      anchorHandlers.push({ el: a, handler });
    });

    const pars = Array.from(document.querySelectorAll<HTMLElement>(".par"));
    const parFrame = () => {
      const vh = window.innerHeight;
      pars.forEach((el) => {
        const r = el.getBoundingClientRect();
        const off = r.top + r.height / 2 - vh / 2;
        const sp = parseFloat(el.dataset.speed || "0.15");
        el.style.transform = `translate3d(0,${(-off * sp).toFixed(1)}px,0)`;
      });
      parRafId = requestAnimationFrame(parFrame);
    };
    parRafId = requestAnimationFrame(parFrame);

    document.querySelectorAll(".stagger").forEach((c) => {
      Array.from(c.children).forEach((ch, i) => {
        if (ch.classList.contains("reveal")) {
          (ch as HTMLElement).style.transitionDelay = `${i * 0.09}s`;
        }
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((el) => io.observe(el));

    const safetyTimeout = window.setTimeout(() => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
      });
    }, 1400);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(parRafId);
      window.clearTimeout(safetyTimeout);
      lenis?.destroy();
      io.disconnect();
      anchorHandlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
    };
  }, []);

  return null;
}
