/**
 * SocialProof component tests
 * Tests headline, description, CTA, and footer note rendering.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { SocialProof } from "../../../components/sections/SocialProof";

describe("SocialProof", () => {
  beforeEach(() => {
    render(<SocialProof />);
  });

  it("renders the headline", () => {
    expect(screen.getByText(/Ready to see yours\?/i)).toBeInTheDocument();
  });

  it("renders the description text", () => {
    expect(
      screen.getByText(/Crumb is launching soon in the UK. Join the waitlist now/i)
    ).toBeInTheDocument();
  });

  it("renders the CTA link", () => {
    const cta = screen.getByRole("link", { name: /Join the waitlist - it's free/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "#waitlist");
  });

  it("renders the no-spam note", () => {
    expect(
      screen.getByText(/No spam. We'll email you on launch day and nothing else./i)
    ).toBeInTheDocument();
  });

  it("renders inside a section element", () => {
    const section = document.querySelector("section");
    expect(section).toBeInTheDocument();
  });
});
