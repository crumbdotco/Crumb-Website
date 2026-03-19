/**
 * Hero component tests
 * Tests rendering, content, links, and key text elements.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Hero } from "../../../components/sections/Hero";

// Mock child components
jest.mock("../../../components/shared/FlowingBackground", () => ({
  FlowingBackground: () => <div data-testid="flowing-background" />,
}));

jest.mock("../../../components/sections/PhoneMockup", () => ({
  PhoneMockup: () => <div data-testid="phone-mockup" />,
}));

describe("Hero", () => {
  beforeEach(() => {
    render(<Hero />);
  });

  it("renders the main headline text", () => {
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/See exactly how/i)).toBeInTheDocument();
    expect(screen.getByText(/you really eat/i)).toBeInTheDocument();
  });

  it("renders the label badge", () => {
    expect(
      screen.getByText(/Spotify Wrapped - but for food delivery/i)
    ).toBeInTheDocument();
  });

  it("renders the sub-headline description", () => {
    expect(screen.getByText(/Connect your Uber Eats and Just Eat accounts/i)).toBeInTheDocument();
  });

  it("renders the CTA link pointing to #waitlist", () => {
    const ctaLink = screen.getByRole("link", { name: /join the waitlist/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "#waitlist");
  });

  it("renders the platform availability text", () => {
    expect(screen.getByText(/Available on iOS & Android/i)).toBeInTheDocument();
  });

  it("renders the social proof micro-line", () => {
    expect(screen.getByText(/Built by students · Launching in the UK/i)).toBeInTheDocument();
  });

  it("renders the FlowingBackground component", () => {
    expect(screen.getByTestId("flowing-background")).toBeInTheDocument();
  });

  it("renders the PhoneMockup component", () => {
    expect(screen.getByTestId("phone-mockup")).toBeInTheDocument();
  });

  it("renders inside a section element", () => {
    const section = document.querySelector("section");
    expect(section).toBeInTheDocument();
  });
});
