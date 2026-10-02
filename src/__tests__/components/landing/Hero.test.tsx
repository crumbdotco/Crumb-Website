/**
 * src/__tests__/components/landing/Hero.test.tsx
 *
 * The free waitlist ended on 2026-10-02: the hero must not render an email
 * signup (WaitlistForm removed), and must keep the store badges block.
 */

import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/landing/Hero";

jest.mock("@/components/landing/HeroMap", () => ({ HeroMap: () => <div data-testid="hero-map" /> }));

describe("Hero", () => {
  it("renders no email input and no waitlist form", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector(".waitlist-form")).toBeNull();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.textContent ?? "").not.toMatch(/waitlist/i);
  });

  it("still renders the store badges block", () => {
    render(<Hero />);
    expect(screen.getByTestId("store-badges")).toBeInTheDocument();
  });
});
