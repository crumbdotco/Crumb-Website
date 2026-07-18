import { appleSvg, gplaySvg } from "./data";

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || "#";
const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "#";

export function StoreBadges() {
  return (
    <div className="stores">
      <a className="store" href={APP_STORE_URL} aria-label="Download on the App Store">
        <span className="g" dangerouslySetInnerHTML={{ __html: appleSvg }} />
        <span className="tx">
          <small>Download on the</small>
          <b>App Store</b>
        </span>
      </a>
      <a className="store" href={PLAY_STORE_URL} aria-label="Get it on Google Play">
        <span className="g" dangerouslySetInnerHTML={{ __html: gplaySvg }} />
        <span className="tx">
          <small>Get it on</small>
          <b>Google Play</b>
        </span>
      </a>
    </div>
  );
}
