/**
 * SocialProof component tests
 * Tests headline, trust signals, CTA, and footer note rendering.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { SocialProof } from "../../../components/sections/SocialProof";

describe("SocialProof", () => {
  beforeEach(() => {
    render(<SocialProof />);
  });

  it("renders the section label", () => {
    expect(screen.getByText(/Trust/i)).toBeInTheDocument();
  });

  it("renders the headline", () => {
    expect(
      screen.getByRole("heading", { name: /Built for food lovers/i })
    ).toBeInTheDocument();
  });

  it("renders all three trust signal headings", () => {
    expect(screen.getByText(/Data stored on your device/i)).toBeInTheDocument();
    expect(screen.getByText(/Read-only access/i)).toBeInTheDocument();
    expect(screen.getByText(/No passwords needed/i)).toBeInTheDocument();
  });

  it("renders all three trust signal sub-texts", () => {
    expect(screen.getByText(/Your order history never leaves your phone/i)).toBeInTheDocument();
    expect(screen.getByText(/We never see your delivery app passwords/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Apple, Google, or email OTP/i)).toBeInTheDocument();
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
