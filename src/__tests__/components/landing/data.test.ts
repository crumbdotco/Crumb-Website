import { scoreColor } from "@/components/landing/data";

describe("scoreColor", () => {
  it("returns hsl(0 62% 42%) for a score of 0", () => {
    expect(scoreColor(0)).toBe("hsl(0 62% 42%)");
  });

  it("returns hsl(125 62% 42%) for a score of 10", () => {
    expect(scoreColor(10)).toBe("hsl(125 62% 42%)");
  });

  it("clamps scores above 10 down to 10", () => {
    expect(scoreColor(15)).toBe(scoreColor(10));
  });

  it("clamps negative scores up to 0", () => {
    expect(scoreColor(-5)).toBe(scoreColor(0));
  });

  it("accepts string scores", () => {
    expect(scoreColor("9.2")).toBe("hsl(115 62% 42%)");
  });

  it("computes a mid-range score correctly", () => {
    expect(scoreColor(5)).toBe("hsl(63 62% 42%)");
  });
});
