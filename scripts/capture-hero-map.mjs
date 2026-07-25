// One-off capture script: renders the real Leaflet basemap (via the
// throwaway /map-capture-tmp route) with Playwright at exact CAPTURE_*
// dimensions/zoom/center, waits for every tile to finish loading, then
// converts the screenshot to WebP. Replaces the old tile-stitching approach
// in favor of letting Leaflet do the Web Mercator projection math itself.
//
// Usage: node scripts/capture-hero-map.mjs
// Requires a dev server already running at CAPTURE_BASE_URL
// (default http://localhost:3100).
import { chromium } from "@playwright/test";
import sharp from "sharp";

const CAPTURE_WIDTH = 1440;
const CAPTURE_HEIGHT = 900;
const BASE_URL = process.env.CAPTURE_BASE_URL ?? "http://localhost:3100";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
    deviceScaleFactor: 2,
  });

  await page.goto(`${BASE_URL}/map-capture-tmp`, { waitUntil: "networkidle" });

  await page.waitForFunction(() => {
    const container = document.getElementById("capture-map");
    if (!container) return false;
    const tiles = container.querySelectorAll(".leaflet-tile");
    if (tiles.length === 0) return false;
    return Array.from(tiles).every((t) => t.classList.contains("leaflet-tile-loaded"));
  }, { timeout: 30000 });

  // Give the browser a couple of frames to finish painting the last tiles.
  await page.waitForTimeout(300);

  const el = await page.$("#capture-map");
  const buffer = await el.screenshot();

  await browser.close();

  const raw = sharp(buffer);
  const meta = await raw.metadata();

  await raw
    .resize(CAPTURE_WIDTH, CAPTURE_HEIGHT)
    .webp({ quality: 80 })
    .toFile("public/media/hero-map.webp");

  console.log(
    `Wrote public/media/hero-map.webp at ${CAPTURE_WIDTH}x${CAPTURE_HEIGHT} (captured at ${meta.width}x${meta.height})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
