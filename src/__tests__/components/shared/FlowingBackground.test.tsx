/**
 * FlowingBackground component tests
 * Tests SVG rendering, path generation, and animation props.
 */
import React from "react";
import { render } from "@testing-library/react";
import { FlowingBackground } from "../../../components/shared/FlowingBackground";

describe("FlowingBackground", () => {
  it("renders without crashing", () => {
    expect(() => render(<FlowingBackground />)).not.toThrow();
  });

  it("renders the container div with correct classes", () => {
    const { container } = render(<FlowingBackground />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("absolute");
    expect(wrapper.className).toContain("inset-0");
    expect(wrapper.className).toContain("overflow-hidden");
    expect(wrapper.className).toContain("pointer-events-none");
  });

  it("renders an SVG element", () => {
    const { container } = render(<FlowingBackground />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders 15 path elements (the line count)", () => {
    const { container } = render(<FlowingBackground />);
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(15);
  });

  it("each path has a d attribute starting with M (valid SVG moveto)", () => {
    const { container } = render(<FlowingBackground />);
    const paths = container.querySelectorAll("path");
    paths.forEach((path) => {
      expect(path.getAttribute("d")).toBeTruthy();
      expect(path.getAttribute("d")).toMatch(/^M/);
    });
  });

  it("each path has the correct stroke color", () => {
    const { container } = render(<FlowingBackground />);
    const paths = container.querySelectorAll("path");
    paths.forEach((path) => {
      expect(path.getAttribute("stroke")).toBe("rgba(180,160,140,0.15)");
    });
  });

  it("each path has stroke-width of 1.5", () => {
    const { container } = render(<FlowingBackground />);
    const paths = container.querySelectorAll("path");
    paths.forEach((path) => {
      expect(path.getAttribute("stroke-width")).toBe("1.5");
    });
  });

  it("each path has fill set to none", () => {
    const { container } = render(<FlowingBackground />);
    const paths = container.querySelectorAll("path");
    paths.forEach((path) => {
      expect(path.getAttribute("fill")).toBe("none");
    });
  });

  it("SVG has the correct viewBox", () => {
    const { container } = render(<FlowingBackground />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 3840 1080");
  });

  it("SVG has preserveAspectRatio set to none", () => {
    const { container } = render(<FlowingBackground />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("preserveAspectRatio")).toBe("none");
  });
});
