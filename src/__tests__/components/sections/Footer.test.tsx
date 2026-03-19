/**
 * Footer component tests
 * Tests brand name, copyright year, nav links, and social links.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "../../../components/sections/Footer";

describe("Footer", () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it("renders the brand name", () => {
    expect(screen.getByText("Crumb")).toBeInTheDocument();
  });

  it("renders the copyright with the current year", () => {
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it("renders the Privacy Policy link", () => {
    const link = screen.getByRole("link", { name: /Privacy Policy/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/privacy");
  });

  it("renders the Terms of Service link", () => {
    const link = screen.getByRole("link", { name: /Terms of Service/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/terms");
  });

  it("renders the Contact link", () => {
    const link = screen.getByRole("link", { name: /Contact/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "mailto:contact@crumbify.co.uk");
  });

  it("renders the Instagram link", () => {
    const link = screen.getByRole("link", { name: /Instagram/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://www.instagram.com/crumbify.co.uk/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the X / Twitter link", () => {
    const link = screen.getByRole("link", { name: /X \/ Twitter/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://x.com/crumbifyco");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders the TikTok link", () => {
    const link = screen.getByRole("link", { name: /TikTok/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://www.tiktok.com/@crumbifyco");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders inside a footer element", () => {
    const footer = document.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });
});
