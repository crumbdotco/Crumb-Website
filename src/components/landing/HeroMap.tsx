import Image from "next/image";
import { HERE_POSITION, scoreColor, spots } from "./data";
import { projectToPercent } from "./mapProjection";

export function HeroMap() {
  const herePos = projectToPercent(HERE_POSITION[0], HERE_POSITION[1]);

  return (
    <div id="lmap" aria-hidden="true">
      <Image
        src="/media/hero-map.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
      <div
        className="here2"
        style={{ left: `${herePos.xPct}%`, top: `${herePos.yPct}%` }}
      >
        <div className="r" />
        <div className="d" />
      </div>
      {spots.map((s, i) => {
        const pos = projectToPercent(s.lat, s.lng);
        return (
          <div
            key={s.name}
            className="pinwrap floaty"
            style={{
              left: `${pos.xPct}%`,
              top: `${pos.yPct}%`,
              animationDelay: `${(i * 0.5).toFixed(1)}s`,
            }}
          >
            <div className="puck" style={{ background: scoreColor(s.score) }}>
              <b>{s.score}</b>
            </div>
            <div className="lab">
              <div className="n">{s.name}</div>
              <div className="c">{s.context}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
