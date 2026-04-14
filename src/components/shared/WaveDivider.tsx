type WaveVariant = "cream-to-dark" | "dark-to-cream" | "cream-to-dark-complex";

const waves: Record<WaveVariant, { top: string; bottom: string; topFill: string; bottomFill: string }> = {
  "cream-to-dark": {
    top: "M0,0 L0,61 Q360,120 720,61 Q1080,0 1440,61 L1440,0 Z",
    bottom: "M0,59 Q360,120 720,59 Q1080,-1 1440,59 L1440,120 L0,120 Z",
    topFill: "#E0D5C9",
    bottomFill: "#3D2B1F",
  },
  "dark-to-cream": {
    top: "M0,0 L0,61 Q360,0 720,61 Q1080,120 1440,61 L1440,0 Z",
    bottom: "M0,59 Q360,-1 720,59 Q1080,120 1440,59 L1440,120 L0,120 Z",
    topFill: "#3D2B1F",
    bottomFill: "#E0D5C9",
  },
  "cream-to-dark-complex": {
    top: "M0,0 L0,81 Q240,120 480,81 Q720,40 960,81 Q1200,120 1440,81 L1440,0 Z",
    bottom: "M0,79 Q240,120 480,79 Q720,39 960,79 Q1200,120 1440,79 L1440,120 L0,120 Z",
    topFill: "#E0D5C9",
    bottomFill: "#3D2B1F",
  },
};

export function WaveDivider({ variant }: { variant: WaveVariant }) {
  const w = waves[variant];
  return (
    <div className="wave-divider relative z-1">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={w.top} fill={w.topFill} />
        <path d={w.bottom} fill={w.bottomFill} />
      </svg>
    </div>
  );
}
