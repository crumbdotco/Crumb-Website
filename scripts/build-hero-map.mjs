// One-off build script: stitches CARTO Voyager raster tiles into a static
// basemap image for the hero section, replacing the live Leaflet map.
// Run with: node scripts/build-hero-map.mjs
//
// Produces public/media/hero-map.webp at CAPTURE_WIDTH x CAPTURE_HEIGHT
// (see src/components/landing/mapProjection.ts), centered at CAPTURE_CENTER
// and rendered at CAPTURE_ZOOM, matching the projection math used to place
// pins on top of the image.
import sharp from "sharp";

// Keep these in sync with src/components/landing/mapProjection.ts.
const CAPTURE_CENTER = [51.51, -0.094];
const CAPTURE_ZOOM = 14;
const CAPTURE_WIDTH = 1440;
const CAPTURE_HEIGHT = 900;
const TILE_SIZE = 256;
const OVERSAMPLE = 2; // fetch @2x tiles, downscale at the end for crispness

function lngToX(lng, zoom) {
  return ((lng + 180) / 360) * TILE_SIZE * 2 ** zoom;
}
function latToY(lat, zoom) {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    TILE_SIZE *
    2 ** zoom
  );
}

async function main() {
  const centerX = lngToX(CAPTURE_CENTER[1], CAPTURE_ZOOM);
  const centerY = latToY(CAPTURE_CENTER[0], CAPTURE_ZOOM);

  const outW = CAPTURE_WIDTH * OVERSAMPLE;
  const outH = CAPTURE_HEIGHT * OVERSAMPLE;
  const cx = centerX * OVERSAMPLE;
  const cy = centerY * OVERSAMPLE;
  const tilePx = TILE_SIZE * OVERSAMPLE;

  const left = cx - outW / 2;
  const top = cy - outH / 2;
  const right = cx + outW / 2;
  const bottom = cy + outH / 2;

  const tileXStart = Math.floor(left / tilePx);
  const tileXEnd = Math.floor((right - 1) / tilePx);
  const tileYStart = Math.floor(top / tilePx);
  const tileYEnd = Math.floor((bottom - 1) / tilePx);

  const subdomains = ["a", "b", "c", "d"];
  const composites = [];
  let idx = 0;
  for (let ty = tileYStart; ty <= tileYEnd; ty++) {
    for (let tx = tileXStart; tx <= tileXEnd; tx++) {
      const s = subdomains[idx % subdomains.length];
      idx++;
      const url = `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${CAPTURE_ZOOM}/${tx}/${ty}@2x.png`;
      const res = await fetch(url, { headers: { "User-Agent": "crumbify-hero-map-build/1.0" } });
      if (!res.ok) throw new Error(`Tile fetch failed ${url}: ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      composites.push({
        input: buf,
        left: Math.round(tx * tilePx - left),
        top: Math.round(ty * tilePx - top),
      });
    }
  }

  const canvas = sharp({
    create: {
      width: outW,
      height: outH,
      channels: 3,
      background: "#EFE5D6",
    },
  }).composite(composites);

  await canvas
    .resize(CAPTURE_WIDTH, CAPTURE_HEIGHT)
    .webp({ quality: 78 })
    .toFile("public/media/hero-map.webp");

  console.log(`Wrote public/media/hero-map.webp at ${CAPTURE_WIDTH}x${CAPTURE_HEIGHT} (from ${outW}x${outH} @2x tiles)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
