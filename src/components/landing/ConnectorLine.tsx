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

/**
 * Catmull-Rom to cubic Bezier conversion.
 * Given 4 points p0..p3 (the segment is p1->p2), returns the two cubic control
 * points [cp1, cp2] that approximate the Catmull-Rom spline with the given tension.
 * Control point Y values are clamped between p1.y and p2.y so the path stays
 * monotonically descending and the fractionAtY binary search remains valid.
 */
function catmullToBezier(
  p0: Anchor, p1: Anchor, p2: Anchor, p3: Anchor, tension: number
): { cp1: Anchor; cp2: Anchor } {
  const t = tension;
  const cp1x = p1.cx + (p2.cx - p0.cx) / (6 * t);
  const cp1y = p1.cy + (p2.cy - p0.cy) / (6 * t);
  const cp2x = p2.cx - (p3.cx - p1.cx) / (6 * t);
  const cp2y = p2.cy - (p3.cy - p1.cy) / (6 * t);

  // Clamp Y between the two anchor Y values to prevent local reversals
  const minY = Math.min(p1.cy, p2.cy);
  const maxY = Math.max(p1.cy, p2.cy);
  return {
    cp1: { cx: cp1x, cy: Math.max(minY, Math.min(maxY, cp1y)) },
    cp2: { cx: cp2x, cy: Math.max(minY, Math.min(maxY, cp2y)) },
  };
}

/**
 * Build the cubic-bezier path string for DESKTOP (> 768px).
 * Inserts 2 intermediate waypoints per anchor-pair, alternating left/right of
 * the straight line, then runs a Catmull-Rom-to-cubic-Bezier pass over the full
 * point list so the whole path is continuously wavy with no straight runs.
 * Waypoints only offset X — Y is strictly monotone. No random values.
 */
function buildPathDesktop(anchors: Anchor[], docW: number): string {
  if (anchors.length < 2) return "";

  // Build an expanded list of points: anchors + 2 waypoints between each pair
  const pts: Anchor[] = [];
  pts.push({ cx: anchors[0].cx, cy: anchors[0].cy - 60 });

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    const dy = b.cy - a.cy;

    // Horizontal swing offset magnitude — deterministic, based on segment index
    const swingA = docW * (i % 2 === 0 ? 0.12 : 0.10);
    const swingB = docW * (i % 2 === 0 ? 0.14 : 0.16);

    // Direction: alternates per segment so the path weaves left/right
    const dirA = i % 2 === 0 ? 1 : -1;
    const dirB = -dirA;

    // Midpoint X — lerp between anchor centres
    const midCx = (a.cx + b.cx) / 2;

    // Waypoint 1: 33% of the way down, offset in dirA
    const rawWp1x = midCx + dirA * swingA;
    const rawWp2x = midCx + dirB * swingB;

    // Central band — most headlines live here; push waypoints outside it
    const bandLeft = docW * 0.30;
    const bandRight = docW * 0.62;
    const pushExtra = docW * 0.08; // extra outward nudge once snapped to band edge

    function pushOutOfBand(x: number, parity: number): number {
      if (x >= bandLeft && x <= bandRight) {
        // Snap to nearest band edge, then push further outward
        const distLeft = x - bandLeft;
        const distRight = bandRight - x;
        if (distLeft <= distRight || parity % 2 === 0) {
          return bandLeft - pushExtra; // push left
        } else {
          return bandRight + pushExtra; // push right
        }
      }
      return x;
    }

    const wp1: Anchor = {
      cx: pushOutOfBand(rawWp1x, i * 2),
      cy: a.cy + dy * 0.33,
    };
    // Waypoint 2: 67% of the way down, offset in dirB
    const wp2: Anchor = {
      cx: pushOutOfBand(rawWp2x, i * 2 + 1),
      cy: a.cy + dy * 0.67,
    };

    pts.push(wp1, wp2);

    // Push the destination anchor (except the last one, added after the loop)
    if (i < anchors.length - 2) {
      pts.push({ cx: anchors[i + 1].cx, cy: anchors[i + 1].cy });
    }
  }

  // Add final anchor and a short tail below it
  const last = anchors[anchors.length - 1];
  pts.push({ cx: last.cx, cy: last.cy });
  pts.push({ cx: last.cx, cy: last.cy + 120 });

  // Now emit SVG path using Catmull-Rom -> cubic Bezier (tension 0.9)
  const tension = 0.9;
  const parts: string[] = [];
  parts.push(`M ${pts[0].cx.toFixed(1)},${pts[0].cy.toFixed(1)}`);

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const { cp1, cp2 } = catmullToBezier(p0, p1, p2, p3, tension);
    parts.push(
      `C ${cp1.cx.toFixed(1)},${cp1.cy.toFixed(1)} ` +
        `${cp2.cx.toFixed(1)},${cp2.cy.toFixed(1)} ` +
        `${p2.cx.toFixed(1)},${p2.cy.toFixed(1)}`
    );
  }

  return parts.join(" ");
}

/**
 * Build the cubic-bezier path string for MOBILE (<= 768px).
 * Routes down the LEFT margin area (x oscillating ~16-64px from left edge),
 * using the REAL measured cy values so it still "reaches" each anchor's height.
 * Small decorative loops every 3rd segment. Never crosses centered content.
 */
function buildPathMobile(anchors: Anchor[]): string {
  if (anchors.length < 2) return "";

  // Left-edge x positions: hug the true screen gutter (leftmost ~14px).
  // Mobile sections have 16px left padding, so the line must stay below 14px
  // to avoid entering the text area.
  const xNear = 5;  // closest to left edge (px)
  const xFar = 12;  // furthest inward (px) — still well inside the 16px text padding

  const parts: string[] = [];

  // Start above the first anchor's y, at the near-edge x
  const first = anchors[0];
  parts.push(`M ${xNear.toFixed(1)},${(first.cy - 60).toFixed(1)}`);

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    const dy = b.cy - a.cy;

    // Alternate x positions along the left gutter
    const ax = i % 2 === 0 ? xNear : xFar;
    const bx = i % 2 === 0 ? xFar : xNear;

    const cp1y = a.cy + dy * 0.33;
    const cp2y = a.cy + dy * 0.67;

    // Control points oscillate gently within the same narrow gutter range
    const cp1x = i % 2 === 0 ? xFar : xNear;
    const cp2x = i % 2 === 0 ? xNear : xFar;

    // No decorative loops on mobile — any loop would push into the text area
    parts.push(
      `C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ` +
        `${cp2x.toFixed(1)},${cp2y.toFixed(1)} ` +
        `${bx.toFixed(1)},${b.cy.toFixed(1)}`
    );
  }

  const last = anchors[anchors.length - 1];
  const lastX = (anchors.length - 1) % 2 === 0 ? xFar : xNear;
  parts.push(`S ${lastX.toFixed(1)},${(last.cy + 80).toFixed(1)} ${lastX.toFixed(1)},${(last.cy + 120).toFixed(1)}`);

  return parts.join(" ");
}

/** Build the correct path based on viewport width. */
function buildPath(anchors: Anchor[], docW: number): string {
  if (typeof window !== "undefined" && window.innerWidth <= 768) {
    return buildPathMobile(anchors);
  }
  return buildPathDesktop(anchors, docW);
}

/** Returns true when the viewport is in mobile width (<= 768px). */
function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth <= 768;
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
  const [isMobile, setIsMobile] = useState(false);
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
    const mobile = isMobileViewport();
    setIsMobile(mobile);
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

  const strokeW = isMobile ? 3 : 4;

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
          stroke="rgba(244,236,223,0.45)"
          strokeWidth={strokeW}
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
        stroke="rgba(244,236,223,0.45)"
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        style={{ pathLength: drawnSpring }}
      />
    </svg>
  );
}
