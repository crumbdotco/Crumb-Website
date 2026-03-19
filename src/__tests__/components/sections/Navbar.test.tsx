/**
 * Navbar component tests
 * Tests initial render, scroll behavior, and CTA link.
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Navbar } from "../../../components/sections/Navbar";

jest.mock("framer-motion", () => ({
  motion: {
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...props}>{children}</span>
    ),
    a: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <a {...props}>{children}</a>
    ),
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("Navbar", () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  it("renders the brand name 'crumb'", () => {
    render(<Navbar />);
    expect(screen.getByText("crumb")).toBeInTheDocument();
  });

  it("renders the CTA link pointing to #waitlist", () => {
    render(<Navbar />);
    const link = screen.getByRole("link", { name: /Join the waitlist/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#waitlist");
  });

  it("renders inside a nav element", () => {
    render(<Navbar />);
    const nav = document.querySelector("nav");
    expect(nav).toBeInTheDocument();
  });

  it("starts with transparent background (not scrolled)", () => {
    render(<Navbar />);
    const nav = document.querySelector("nav");
    // bg-transparent is applied when not scrolled
    expect(nav?.className).toContain("bg-transparent");
  });

  it("applies scrolled class after scrolling past 60px", () => {
    render(<Navbar />);
    Object.defineProperty(window, "scrollY", { value: 100, configurable: true });

    act(() => {
      fireEvent.scroll(window);
    });

    const nav = document.querySelector("nav");
    // When scrolled, the background class changes
    expect(nav?.className).toContain("bg-crumb-cream");
    expect(nav?.className).not.toContain("bg-transparent");
  });

  it("reverts to transparent when scroll goes back below 60px", () => {
    render(<Navbar />);

    // Scroll past threshold first
    Object.defineProperty(window, "scrollY", { value: 100, configurable: true });
    act(() => {
      fireEvent.scroll(window);
    });

    // Now scroll back
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    act(() => {
      fireEvent.scroll(window);
    });

    const nav = document.querySelector("nav");
    expect(nav?.className).toContain("bg-transparent");
  });

  it("removes the scroll event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = render(<Navbar />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
