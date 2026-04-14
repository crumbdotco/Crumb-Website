function generateLines(width: number, height: number, count: number): string[] {
  const paths: string[] = [];
  for (let i = 1; i <= count; i++) {
    const baseY = (i / (count + 1)) * height;
    const amp1 = 12 + (i % 3) * 8;
    const amp2 = 8 + ((i + 1) % 4) * 6;
    const phase = (i * 37) % 100;
    let d = `M -50 ${baseY}`;
    const segments = 10;
    for (let j = 1; j <= segments; j++) {
      const x = (j / segments) * (width * 2 + 100) - 50;
      const t = j / segments;
      const y =
        baseY +
        Math.sin(t * 6.28 + phase * 0.1) * amp1 +
        Math.cos(t * 9.42 + phase * 0.15) * amp2;
      d += ` Q ${x - 35} ${y + (j % 2 ? 6 : -6)}, ${x} ${y}`;
    }
    paths.push(d);
  }
  return paths;
}

const lines = generateLines(1920, 1080, 12);

export function FlowingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 will-change-transform">
      <svg
        className="h-full w-[200%] will-change-transform"
        viewBox="0 0 3840 1080"
        preserveAspectRatio="none"
        style={{ animation: "flow-scroll 50s linear infinite" }}
      >
        {lines.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="rgba(139,115,85,0.12)"
            strokeWidth={2}
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}
