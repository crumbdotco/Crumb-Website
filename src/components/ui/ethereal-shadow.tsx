"use client";
import { useEffect, useRef } from "react";

interface EtherealShadowProps {
  color?: string;
  animation?: { scale?: number; speed?: number };
  noise?: { opacity?: number; scale?: number };
  sizing?: "fill" | "contain";
}

export function EtherealShadow({
  color = "rgba(139, 115, 85, 0.4)",
  animation = { scale: 60, speed: 40 },
  noise = { opacity: 0.3, scale: 1 },
  sizing = "fill",
}: EtherealShadowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();

    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const blobCount = 4;
    const blobs = Array.from({ length: blobCount }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.15 + Math.random() * 0.2,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      phase: (i / blobCount) * Math.PI * 2,
    }));

    const speed = (animation.speed ?? 40) / 1000;
    const blobScale = (animation.scale ?? 60) / 100;

    const draw = (time: number) => {
      const { width, height } = canvas;
      if (width === 0 || height === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (const blob of blobs) {
        blob.x += blob.vx + Math.sin(time * speed * 0.001 + blob.phase) * 0.0002;
        blob.y += blob.vy + Math.cos(time * speed * 0.001 + blob.phase * 1.3) * 0.0002;

        if (blob.x < -0.2) blob.x = 1.2;
        if (blob.x > 1.2) blob.x = -0.2;
        if (blob.y < -0.2) blob.y = 1.2;
        if (blob.y > 1.2) blob.y = -0.2;

        const cx = blob.x * width;
        const cy = blob.y * height;
        const r = blob.radius * Math.min(width, height) * blobScale;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color.replace(/[\d.]+\)$/, "0.15)"));
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      // Noise overlay
      if (noise.opacity && noise.opacity > 0) {
        const noiseScale = noise.scale ?? 1;
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const noiseAmount = noise.opacity * 40;
        const step = Math.max(1, Math.round(4 / noiseScale));

        for (let i = 0; i < data.length; i += 4 * step) {
          const n = (Math.random() - 0.5) * noiseAmount;
          data[i] = Math.min(255, Math.max(0, data[i] + n));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, [color, animation.scale, animation.speed, noise.opacity, noise.scale]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${sizing === "fill" ? "w-full h-full" : ""}`}
      style={{ display: "block" }}
    />
  );
}
