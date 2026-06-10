"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  useScroll,
  useSpring,
  useMotionValue,
  useReducedMotion,
  motion,
} from "framer-motion";

/**
 * ConnectorLine — measures the real page-pixel positions of all
 * [data-connect] elements, then draws a smooth cubic-bezier path that
 * visually snakes from screenshot to screenshot with occasional decorative
 * loops. The drawing tip sits at a fixed 60% down the viewport — so the
 * bottom of the top 60% of the viewport shows the already-drawn line, and
 * the tip traces downward as the user scrolls.
 *
 * SVG coordinate space: 1:1 real page pixels (scrollWidth × scrollHeight).
 * The SVG is position:absolute top:0 left:0, sized to the full document.
 * strokeWidth is literal px (no scaling distortion). vectorEffect is kept
 * for safety but not strictly needed with 1:1 viewBox.
 */

interface Anchor {
  cx: number;
  cy: number;
}

/** Build the cubic-bezier path string from measured anchors. */
function buildPath(anchors: Anchor[], docW: number): string {
  if (anchors.length < 2) return "";

  const parts: string[] = [];

  // Start slightly above the first anchor
  const first = anchors[0];
  parts.push(`M ${first.cx.toFixed(1)},${(first.cy - 60).toFixed(1)}`);

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    const dy = b.cy - a.cy;

    // Control point y: 1/3 and 2/3 down the segment
    const cp1y = a.cy + dy * 0.33;
    const cp2y = a.cy + dy * 0.67;

    // Swing control points LEFT or RIGHT alternately so the path bows wide
    // and visibly reaches toward each screenshot. Even i → bow right (toward
    // right side of page), odd i → bow left.
    const swing = docW * 0.18; // 18% of page width — wide enough to be visible
    const cp1x = i % 2 === 0 ? a.cx + swing : a.cx - swing;
    const cp2x = i % 2 === 0 ? b.cx + swing : b.cx - swing;

    // Insert a decorative loop on every 3rd gap (between segments 2-3, 5-6, etc.)
    if (i > 0 && i % 3 === 2) {
      // Loop: a small curl that overshoots by ~36px and comes back.
      // Implemented as an extra tight cubic that circles ~36px to the
      // opposite side before the main cubic continues.
      const midX = (a.cx + b.cx) / 2;
      const midY = a.cy + dy * 0.45;
      const loopR = 36;
      const loopDir = i % 2 === 0 ? 1 : -1; // direction of the loop curl

      // Approach the loop entry point
      const loopEntryX = midX;
      const loopEntryY = midY - loopR;

      // Cubic to loop entry
      parts.push(
        `C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ` +
          `${(loopEntryX + loopDir * loopR * 0.6).toFixed(1)},${(loopEntryY - loopR * 0.4).toFixed(1)} ` +
          `${loopEntryX.toFixed(1)},${loopEntryY.toFixed(1)}`
      );

      // The curl: go around in a small circle using two cubics
      // Top of loop
      const loopTopX = midX + loopDir * loopR;
      const loopTopY = midY - loopR * 1.2;
      // Exit point (back near entry but below)
      const loopExitX = midX;
      const loopExitY = midY + loopR * 0.1;

      parts.push(
        `C ${(loopEntryX + loopDir * loopR * 1.4).toFixed(1)},${(loopEntryY - loopR * 0.4).toFixed(1)} ` +
          `${(loopTopX + loopDir * loopR * 0.4).toFixed(1)},${(loopTopY + loopR * 0.6).toFixed(1)} ` +
          `${loopTopX.toFixed(1)},${(loopTopY + loopR * 0.9).toFixed(1)}`
      );

      parts.push(
        `C ${(loopTopX - loopDir * loopR * 0.2).toFixed(1)},${(loopTopY + loopR * 1.4).toFixed(1)} ` +
          `${(loopExitX + loopDir * loopR * 0.6).toFixed(1)},${(loopExitY - loopR * 0.1).toFixed(1)} ` +
          `${loopExitX.toFixed(1)},${loopExitY.toFixed(1)}`
      );

      // Continue from loop exit to destination anchor
      parts.push(
        `C ${(loopExitX + (i % 2 === 0 ? swing * 0.5 : -swing * 0.5)).toFixed(1)},${(loopExitY + dy * 0.2).toFixed(1)} ` +
          `${cp2x.toFixed(1)},${cp2y.toFixed(1)} ` +
          `${b.cx.toFixed(1)},${b.cy.toFixed(1)}`
      );
    } else {
      // Normal cubic bezier arc between two anchors
      parts.push(
        `C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ` +
          `${cp2x.toFixed(1)},${cp2y.toFixed(1)} ` +
          `${b.cx.toFixed(1)},${b.cy.toFixed(1)}`
      );
    }
  }

  // Tail: continue a short distance past the last anchor
  const last = anchors[anchors.length - 1];
  parts.push(`S ${last.cx.toFixed(1)},${(last.cy + 80).toFixed(1)} ${last.cx.toFixed(1)},${(last.cy + 120).toFixed(1)}`);

  return parts.join(" ");
}

/** Measure all [data-connect] elements, returning page-pixel centers. */
function measureAnchors(): { anchors: Anchor[]; docW: number; docH: number } {
  const nodes = document.querySelectorAll<HTMLElement>("[data-connect]");
  const anchors: Anchor[] = [];
  for (const el of Array.from(nodes)) {
    const rect = el.getBoundingClientRect();
    anchors.push({
      cx: rect.left + rect.width / 2 + window.scrollX,
      cy: rect.top + rect.height / 2 + window.scrollY,
    });
  }
  const docW = Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth,
    window.innerWidth
  );
  const docH = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    window.innerHeight
  );
  return { anchors, docW, docH };
}

/**
 * Binary-search for the arc length L along the path where
 * path.getPointAtLength(L).y is closest to targetY.
 *
 * The path descends monotonically (Y increases with length), so binary
 * search is valid: if the midpoint Y is less than targetY, search the
 * upper half; else the lower half.
 *
 * Returns a fraction in [0, 1] (L / totalLength).
 */
function fractionAtY(path: SVGPathElement, targetY: number): number {
  const total = path.getTotalLength();
  if (total === 0) return 0;

  let lo = 0;
  let hi = total;

  // 22 iterations gives resolution of total/4M — more than sufficient
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    const pt = path.getPointAtLength(mid);
    if (pt.y < targetY) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const L = (lo + hi) / 2;
  return Math.max(0, Math.min(1, L / total));
}

export function ConnectorLine() {
  const reduced = useReducedMotion();

  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [docSize, setDocSize] = useState({ w: 1440, h: 9000 });
  const [pathD, setPathD] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref to the animated path element for getTotalLength / getPointAtLength
  const pathRef = useRef<SVGPathElement>(null);

  // MotionValue for the drawn fraction, smoothed by a spring
  const drawn = useMotionValue(0);
  const drawnSpring = useSpring(drawn, {
    stiffness: 90,
    damping: 22,
    restDelta: 0.0005,
  });

  const remeasure = useCallback(() => {
    const { anchors: a, docW, docH } = measureAnchors();
    setAnchors(a);
    setDocSize({ w: docW, h: docH });
    setPathD(buildPath(a, docW));
  }, []);

  // Initial measurement: 0ms (first pass), 400ms, 1500ms to catch late layout shifts
  useEffect(() => {
    remeasure();
    const t1 = setTimeout(remeasure, 400);
    const t2 = setTimeout(remeasure, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [remeasure]);

  // Remeasure on resize (debounced 150ms)
  useEffect(() => {
    function onResize() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(remeasure, 150);
    }
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [remeasure]);

  // Geometry-driven draw: tip sits at 60% down the viewport.
  // tipY = scrollY + innerHeight * 0.60 (page-Y coordinate).
  // Binary-search the path for the arc-length whose Y ≈ tipY, then set
  // drawn fraction. The spring smooths jitter between frames.
  const { scrollY } = useScroll();

  const recompute = useCallback(() => {
    const path = pathRef.current;
    if (!path) return;
    try {
      const tipY = window.scrollY + window.innerHeight * 0.60;
      const fraction = fractionAtY(path, tipY);
      drawn.set(fraction);
    } catch {
      // getPointAtLength unsupported or path empty — leave current value
    }
  }, [drawn]);

  // Drive recompute from scrollY MotionValue changes
  useEffect(() => {
    // Subscribe to the scrollY MotionValue
    const unsubscribe = scrollY.on("change", recompute);
    return unsubscribe;
  }, [scrollY, recompute]);

  // Also recompute when pathD changes (new anchors measured) and on resize
  useEffect(() => {
    if (!pathD) return;
    // Give the DOM one frame to apply the new `d` attribute before measuring
    const raf = requestAnimationFrame(recompute);
    return () => cancelAnimationFrame(raf);
  }, [pathD, recompute]);

  // Don't render until we have at least 2 anchors
  if (anchors.length < 2 && !reduced) {
    return null;
  }

  const svgStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 0,
    overflow: "visible",
  };

  if (reduced) {
    // Reduced motion: full static path, no animation
    return (
      <svg
        aria-hidden
        style={svgStyle}
        width={docSize.w}
        height={docSize.h}
        viewBox={`0 0 ${docSize.w} ${docSize.h}`}
      >
        <path
          d={pathD}
          fill="none"
          stroke="rgba(244,236,223,0.70)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden
      style={svgStyle}
      width={docSize.w}
      height={docSize.h}
      viewBox={`0 0 ${docSize.w} ${docSize.h}`}
    >
      <motion.path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="rgba(244,236,223,0.70)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        style={{ pathLength: drawnSpring }}
      />
    </svg>
  );
}
