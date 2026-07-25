import { CAPTURE_CENTER, projectToPercent } from "./mapProjection";

describe("projectToPercent", () => {
  it("maps the capture center to 50%/50%", () => {
    const { xPct, yPct } = projectToPercent(CAPTURE_CENTER[0], CAPTURE_CENTER[1]);
    expect(xPct).toBeCloseTo(50, 5);
    expect(yPct).toBeCloseTo(50, 5);
  });

  it("maps a known lat/lng to the expected percentage", () => {
    // Blacklock spot from data.ts: { lat: 51.5175, lng: -0.078 }
    const { xPct, yPct } = projectToPercent(51.5175, -0.078);
    expect(xPct).toBeGreaterThan(50);
    expect(yPct).toBeLessThan(50);
    // Sanity-check against precomputed expected values for this projection.
    expect(xPct).toBeCloseTo(62.95, 1);
    expect(yPct).toBeCloseTo(34.4, 1);
  });

  it("moves east as longitude increases (monotonic in x)", () => {
    const west = projectToPercent(51.51, -0.12);
    const east = projectToPercent(51.51, -0.06);
    expect(east.xPct).toBeGreaterThan(west.xPct);
  });

  it("moves north as latitude increases (monotonic, decreasing y)", () => {
    const south = projectToPercent(51.505, -0.094);
    const north = projectToPercent(51.52, -0.094);
    expect(north.yPct).toBeLessThan(south.yPct);
  });
});
