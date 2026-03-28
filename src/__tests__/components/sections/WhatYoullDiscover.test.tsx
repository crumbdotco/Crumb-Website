/**
 * WhatYoullDiscover component tests
 * Tests discovery cards rendering and content.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { WhatYoullDiscover } from "../../../components/sections/WhatYoullDiscover";

describe("WhatYoullDiscover", () => {
  beforeEach(() => {
    render(<WhatYoullDiscover />);
  });

  it("renders the section heading label", () => {
    expect(screen.getByText(/What you'll discover/i)).toBeInTheDocument();
  });

  it("renders the sub-heading", () => {
    expect(
      screen.getByRole("heading", { name: /Your food life, finally in numbers/i })
    ).toBeInTheDocument();
  });

  it("renders all 6 discovery card stat values", () => {
    expect(screen.getByText("147")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("8.5")).toBeInTheDocument();
    expect(screen.getByText(/Main Character/i)).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders all discovery card labels", () => {
    expect(screen.getByText(/total orders/i)).toBeInTheDocument();
    expect(screen.getByText(/restaurants mapped/i)).toBeInTheDocument();
    expect(screen.getByText(/average score/i)).toBeInTheDocument();
    expect(screen.getAllByText(/your food personality/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/taste match/i)).toBeInTheDocument();
    expect(screen.getByText(/achievements unlocked/i)).toBeInTheDocument();
  });

  it("renders the sub-descriptions for cards", () => {
    expect(screen.getByText(/That's one every 2.5 days/i)).toBeInTheDocument();
    expect(screen.getByText(/See everywhere you've been/i)).toBeInTheDocument();
    expect(screen.getByText(/Rate every restaurant your way/i)).toBeInTheDocument();
    expect(screen.getByText(/Your food personality revealed/i)).toBeInTheDocument();
    expect(screen.getByText(/Find your food soulmate/i)).toBeInTheDocument();
    expect(screen.getByText(/Earn badges as you eat/i)).toBeInTheDocument();
  });

  it("renders inside a section element", () => {
    const section = document.querySelector("section");
    expect(section).toBeInTheDocument();
  });
});
