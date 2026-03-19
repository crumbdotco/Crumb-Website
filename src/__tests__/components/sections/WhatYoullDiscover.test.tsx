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
    expect(screen.getByText(/Nando/i)).toBeInTheDocument();
    expect(screen.getByText(/Saturday 7pm/i)).toBeInTheDocument();
    expect(screen.getByText(/Main Character/i)).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("Indian")).toBeInTheDocument();
  });

  it("renders all discovery card labels", () => {
    expect(screen.getByText(/total orders this year/i)).toBeInTheDocument();
    expect(screen.getByText(/your most ordered restaurant/i)).toBeInTheDocument();
    expect(screen.getByText(/your peak ordering time/i)).toBeInTheDocument();
    expect(screen.getByText(/your food personality/i)).toBeInTheDocument();
    expect(screen.getByText(/taste match with your best friend/i)).toBeInTheDocument();
    expect(screen.getByText(/your most loved cuisine/i)).toBeInTheDocument();
  });

  it("renders the sub-descriptions for cards", () => {
    expect(screen.getByText(/That's one every 2.5 days/i)).toBeInTheDocument();
    expect(screen.getByText(/21 orders and counting/i)).toBeInTheDocument();
    expect(screen.getByText(/Every\. Single\. Week\./i)).toBeInTheDocument();
    expect(screen.getByText(/You order like the protagonist/i)).toBeInTheDocument();
    expect(screen.getByText(/Food soulmates confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/Butter chicken every time/i)).toBeInTheDocument();
  });

  it("renders inside a section element", () => {
    const section = document.querySelector("section");
    expect(section).toBeInTheDocument();
  });
});
