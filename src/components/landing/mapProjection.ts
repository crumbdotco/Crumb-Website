// Web Mercator projection constants matching the static hero basemap capture.
// The image at /public/media/hero-map.webp was captured with a Leaflet map
// centered at CAPTURE_CENTER, at CAPTURE_ZOOM, rendered at CAPTURE_WIDTH x
// CAPTURE_HEIGHT CSS pixels. Any lat/lng can be converted to a percentage
// position within that fixed-aspect image using the same projection math.
//
// CAPTURE_WIDTH/CAPTURE_HEIGHT are intentionally set to the 1440x900
// reference viewport's exact aspect ratio (1.6). Pins are positioned with
// `left/top: <pct>%` on elements that are children of the #lmap container
// (not the <img> itself), so the percentage is relative to the CONTAINER's
// box, not the underlying image's pixel grid. The <img> uses
// object-fit: cover, which only maps 1:1 (no crop) onto the container when
// the image's aspect ratio matches the container's aspect ratio exactly -
// otherwise cover crops the image and the "percent of image" / "percent of
// container" mapping used here would drift out of sync with the basemap
// underneath. Keep this ratio equal to the hero's expected aspect ratio at
// the primary reference viewport (currently 1440/900 = 1.6). If the capture
// script (scripts/build-hero-map.mjs) changes these dimensions, update both
// together and re-run the script to regenerate public/media/hero-map.webp.
export const CAPTURE_CENTER: [number, number] = [51.51, -0.094];
export const CAPTURE_ZOOM = 14;
export const CAPTURE_WIDTH = 1440;
export const CAPTURE_HEIGHT = 900;

const TILE_SIZE = 256;

function lngToX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * TILE_SIZE * 2 ** zoom;
}

function latToY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    TILE_SIZE *
    2 ** zoom
  );
}

export interface PixelPercent {
  xPct: number;
  yPct: number;
}

/**
 * Projects a lat/lng into a percentage position (0-100) within the captured
 * basemap image, using the same center/zoom/dimensions as the capture.
 */
export function projectToPercent(
  lat: number,
  lng: number,
  center: [number, number] = CAPTURE_CENTER,
  zoom: number = CAPTURE_ZOOM,
  width: number = CAPTURE_WIDTH,
  height: number = CAPTURE_HEIGHT
): PixelPercent {
  const centerX = lngToX(center[1], zoom);
  const centerY = latToY(center[0], zoom);

  const pointX = lngToX(lng, zoom);
  const pointY = latToY(lat, zoom);

  const pixelX = width / 2 + (pointX - centerX);
  const pixelY = height / 2 + (pointY - centerY);

  return {
    xPct: (pixelX / width) * 100,
    yPct: (pixelY / height) * 100,
  };
}
