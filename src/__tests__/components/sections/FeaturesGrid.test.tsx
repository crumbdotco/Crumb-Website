/**
 * FeaturesGrid component tests
 * Tests feature cards, pricing section, and all content.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { FeaturesGrid } from "../../../components/sections/FeaturesGrid";

jest.mock("lucide-react", () => ({
  BarChart3: ({ size }: { size?: number }) => <svg data-testid="icon-barchart3" width={size} />,
  Map: ({ size }: { size?: number }) => <svg data-testid="icon-map" width={size} />,
  Star: ({ size }: { size?: number }) => <svg data-testid="icon-star" width={size} />,
  Gift: ({ size }: { size?: number }) => <svg data-testid="icon-gift" width={size} />,
  Heart: ({ size }: { size?: number }) => <svg data-testid="icon-heart" width={size} />,
  MessageCircle: ({ size }: { size?: number }) => <svg data-testid="icon-messagecircle" width={size} />,
  Check: ({ size }: { size?: number }) => <svg data-testid="icon-check" width={size} />,
  Crown: ({ size }: { size?: number }) => <svg data-testid="icon-crown" width={size} />,
}));

describe("FeaturesGrid", () => {
  beforeEach(() => {
    render(<FeaturesGrid />);
  });

  it("renders the Features section label", () => {
    expect(screen.getByText("Features")).toBeInTheDocument();
  });

  it("renders the Features heading", () => {
    expect(
      screen.getByRole("heading", { name: /Everything you need/i })
    ).toBeInTheDocument();
  });

  it("renders all 6 feature card titles", () => {
    expect(screen.getByText("Deep Stats")).toBeInTheDocument();
    expect(screen.getByText("Restaurant Map")).toBeInTheDocument();
    expect(screen.getByText("Reviews & Ratings")).toBeInTheDocument();
    // "Crumb Wrapped" appears in both the feature card h3 and the free tier list
    expect(screen.getAllByText("Crumb Wrapped").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Food Soulmate")).toBeInTheDocument();
    expect(screen.getByText("Friends & Chat")).toBeInTheDocument();
  });

  it("renders feature card descriptions", () => {
    expect(
      screen.getByText(/Total orders, top restaurants, cuisine breakdown/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/See every restaurant you've ordered from on a map/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Rate restaurants, tag occasions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your year in food delivery/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Match with friends by taste compatibility/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Add friends, compare stats/i)
    ).toBeInTheDocument();
  });

  it("renders the Pricing section label", () => {
    expect(screen.getByText("Pricing")).toBeInTheDocument();
  });

  it("renders the Pricing heading", () => {
    expect(
      screen.getByRole("heading", { name: /Simple and fair/i })
    ).toBeInTheDocument();
  });

  it("renders the Free tier price", () => {
    expect(screen.getByText("£0")).toBeInTheDocument();
  });

  it("renders the Premium tier price", () => {
    expect(screen.getByText("£4.99")).toBeInTheDocument();
  });

  it("renders all free tier features", () => {
    expect(screen.getByText("All core stats & graphs")).toBeInTheDocument();
    expect(screen.getByText("Restaurant reviews & map")).toBeInTheDocument();
    // "Crumb Wrapped" appears in both the feature card h3 and the free tier list
    expect(screen.getAllByText("Crumb Wrapped").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Friend soulmate matching")).toBeInTheDocument();
    expect(screen.getByText("Want to Try list (up to 10)")).toBeInTheDocument();
    expect(screen.getByText("Achievement badges")).toBeInTheDocument();
  });

  it("renders all premium tier features", () => {
    expect(screen.getByText("Everything in Free")).toBeInTheDocument();
    expect(screen.getByText("Ad-free experience")).toBeInTheDocument();
    expect(screen.getByText("Year & Lifetime stats")).toBeInTheDocument();
    expect(screen.getByText("Photo reviews")).toBeInTheDocument();
    expect(screen.getByText("Friend recommendations")).toBeInTheDocument();
    expect(screen.getByText("Unlimited Want to Try")).toBeInTheDocument();
    expect(screen.getByText("Random soulmate matching")).toBeInTheDocument();
  });

  it("renders the annual premium price", () => {
    expect(screen.getByText(/£49.99\/year/i)).toBeInTheDocument();
  });

  it("renders Free tier CTA link pointing to #waitlist", () => {
    const freeLink = screen.getByRole("link", { name: /Join the waitlist/i });
    expect(freeLink).toHaveAttribute("href", "#waitlist");
  });

  it("renders Premium tier CTA link pointing to #waitlist", () => {
    const premiumLink = screen.getByRole("link", { name: /Start free, upgrade later/i });
    expect(premiumLink).toHaveAttribute("href", "#waitlist");
  });

  it("renders the Founding Member link pointing to #waitlist", () => {
    const foundingLink = screen.getByRole("link", { name: /become a Founding Member/i });
    expect(foundingLink).toHaveAttribute("href", "#waitlist");
  });

  it("renders per-month labels for pricing tiers", () => {
    // Both Free and Premium show "/ month"
    expect(screen.getAllByText(/\/ month/i).length).toBeGreaterThanOrEqual(1);
  });
});
