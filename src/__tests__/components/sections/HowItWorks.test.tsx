/**
 * HowItWorks component tests
 * Tests the three-step process rendering and content.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { HowItWorks } from "../../../components/sections/HowItWorks";

jest.mock("../../../components/ui/ethereal-shadow", () => ({
  EtherealShadow: ({ color, sizing }: { color?: string; sizing?: string }) => (
    <canvas data-testid="ethereal-shadow" data-color={color} data-sizing={sizing} />
  ),
}));

jest.mock("lucide-react", () => ({
  Smartphone: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="icon-smartphone" className={className} width={size} height={size} />
  ),
  BarChart3: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="icon-barchart3" className={className} width={size} height={size} />
  ),
  Share2: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="icon-share2" className={className} width={size} height={size} />
  ),
}));

describe("HowItWorks", () => {
  beforeEach(() => {
    render(<HowItWorks />);
  });

  it("renders the section label", () => {
    expect(screen.getByText(/How it works/i)).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    expect(
      screen.getByRole("heading", { name: /Three steps to your stats/i })
    ).toBeInTheDocument();
  });

  it("renders the step numbers", () => {
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders all step titles", () => {
    expect(screen.getByText("Connect your accounts")).toBeInTheDocument();
    expect(screen.getByText("We crunch the numbers")).toBeInTheDocument();
    expect(screen.getByText("See your stats and share them")).toBeInTheDocument();
  });

  it("renders all step descriptions", () => {
    expect(
      screen.getByText(/Link your Uber Eats and Just Eat accounts in seconds/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Crumb pulls your full order history and builds your taste profile/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Get your personalised stats, Wrapped, food personality/i)
    ).toBeInTheDocument();
  });

  it("renders the privacy note", () => {
    expect(
      screen.getByText(/Your order data is stored locally on your device and never shared with us/i)
    ).toBeInTheDocument();
  });

  it("renders the EtherealShadow background component", () => {
    expect(screen.getByTestId("ethereal-shadow")).toBeInTheDocument();
  });

  it("renders the EtherealShadow with fill sizing", () => {
    const shadow = screen.getByTestId("ethereal-shadow");
    expect(shadow).toHaveAttribute("data-sizing", "fill");
  });

  it("renders all three step icons", () => {
    expect(screen.getByTestId("icon-smartphone")).toBeInTheDocument();
    expect(screen.getByTestId("icon-barchart3")).toBeInTheDocument();
    expect(screen.getByTestId("icon-share2")).toBeInTheDocument();
  });
});
