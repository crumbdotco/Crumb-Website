import { scoreColor } from "./data";

interface ScorePuckProps {
  score: string;
  size?: number;
  fontSize?: number;
}

export function ScorePuck({ score, size, fontSize }: ScorePuckProps) {
  return (
    <div
      className="puck"
      style={{
        background: scoreColor(score),
        ...(size ? { width: size, height: size } : {}),
        ...(fontSize ? { fontSize } : {}),
      }}
    >
      <b>{score}</b>
    </div>
  );
}
