// Web Mercator projection constants matching the static hero basemap capture.
// The image at /public/media/hero-map.webp was captured with a Leaflet map
// centered at CAPTURE_CENTER, at CAPTURE_ZOOM, rendered at CAPTURE_WIDTH x
// CAPTURE_HEIGHT CSS pixels. Any lat/lng can be converted to a percentage
// position within that fixed-aspect image using the same projection math.

export const CAPTURE_CENTER: [number, number] = [51.51, -0.094];
export const CAPTURE_ZOOM = 14;
export const CAPTURE_WIDTH = 1600;
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
