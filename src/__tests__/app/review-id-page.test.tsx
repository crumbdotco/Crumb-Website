/**
 * src/__tests__/app/review-id-page.test.tsx
 *
 * Pixel-fix F-53b (owner directive 2026-08-06): /review/[id] landing page id
 * validation, mirroring src/__tests__/app/u-username-page.test.tsx's shape
 * for the profile page.
 */

import { render, screen } from "@testing-library/react";
import ReviewSharePage, { generateMetadata } from "@/app/review/[id]/page";

const VALID_ID = "255378a1-cefa-472b-9508-b6c74dad852c";

describe("ReviewSharePage id validation", () => {
  it("renders the share landing for a valid UUID id", async () => {
    const element = await ReviewSharePage({ params: Promise.resolve({ id: VALID_ID }) });
    render(element);
    expect(screen.getByRole("heading", { name: "A review on Crumbify" })).toBeInTheDocument();
  });

  it("accepts an uppercase-hex UUID (case-insensitive)", async () => {
    const element = await ReviewSharePage({
      params: Promise.resolve({ id: VALID_ID.toUpperCase() }),
    });
    render(element);
    expect(screen.getByRole("heading", { name: "A review on Crumbify" })).toBeInTheDocument();
  });

  it('renders "Review not found" for a malformed id (not UUID-shaped)', async () => {
    const element = await ReviewSharePage({ params: Promise.resolve({ id: "not-a-uuid" }) });
    render(element);
    expect(screen.getByText("Review not found")).toBeInTheDocument();
  });

  it('renders "Review not found" for a pathological id (path traversal attempt)', async () => {
    const element = await ReviewSharePage({ params: Promise.resolve({ id: "../../etc" }) });
    render(element);
    expect(screen.getByText("Review not found")).toBeInTheDocument();
  });
});

describe("generateMetadata id validation", () => {
  it("titles a valid UUID id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    expect(metadata.title).toBe("A review on Crumbify");
  });

  it("falls back to a generic title for a malformed id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: "bad" }) });
    expect(metadata.title).toBe("Crumbify review");
  });

  it("sets a canonical URL built from the encoded id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    expect(metadata.alternates?.canonical).toBe(`https://crumbify.co.uk/review/${VALID_ID}`);
  });
});
