/**
 * PhoneMockup component tests
 * Tests the static mock phone UI content.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { PhoneMockup } from "../../../components/sections/PhoneMockup";

describe("PhoneMockup", () => {
  beforeEach(() => {
    render(<PhoneMockup />);
  });

  it("renders the status bar time", () => {
    expect(screen.getByText("9:41")).toBeInTheDocument();
  });

  it("renders the greeting text", () => {
    expect(screen.getByText("Good evening,")).toBeInTheDocument();
  });

  it("renders the user name", () => {
    expect(screen.getByText("Ali")).toBeInTheDocument();
  });

  it("renders the total orders count", () => {
    expect(screen.getByText("147")).toBeInTheDocument();
  });

  it("renders the total orders label", () => {
    expect(screen.getByText("total orders")).toBeInTheDocument();
  });

  it("renders the top spot label and restaurant", () => {
    expect(screen.getByText("Top spot")).toBeInTheDocument();
    // "Nando's" appears in both top spot quick stat and recent orders
    expect(screen.getAllByText("Nando's").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the favourite cuisine", () => {
    expect(screen.getByText("Favourite")).toBeInTheDocument();
    expect(screen.getByText("Sushi")).toBeInTheDocument();
  });

  it("renders the week chart heading", () => {
    expect(screen.getByText("This week")).toBeInTheDocument();
  });

  it("renders 7 bar chart columns for days of week", () => {
    // The bars are divs with dynamic height styles
    const bars = document.querySelectorAll('[style*="height"]');
    expect(bars.length).toBeGreaterThanOrEqual(7);
  });

  it("renders the day labels", () => {
    const days = ["M", "T", "W", "F", "S"];
    days.forEach((day) => {
      // Multiple T and S exist — use getAllByText
      expect(screen.getAllByText(day).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders the recent orders heading", () => {
    expect(screen.getByText("Recent orders")).toBeInTheDocument();
  });

  it("renders Nando's recent order details", () => {
    expect(screen.getByText("Butterfly Chicken")).toBeInTheDocument();
    expect(screen.getByText("Uber Eats")).toBeInTheDocument();
  });

  it("renders Wagamama recent order", () => {
    expect(screen.getByText("Wagamama")).toBeInTheDocument();
    expect(screen.getByText("Katsu Curry")).toBeInTheDocument();
    expect(screen.getByText("Just Eat")).toBeInTheDocument();
  });

  it("renders tab bar navigation items", () => {
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Social")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });
});
