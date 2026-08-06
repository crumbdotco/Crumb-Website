/**
 * src/__tests__/app/place-id-page.test.tsx
 *
 * Pixel-fix F-53b (owner directive 2026-08-06): /place/[id] landing page id
 * validation, mirroring src/__tests__/app/u-username-page.test.tsx's shape
 * for the profile page. place_id is a Google Places id, not a UUID - see
 * PLACE_ID_PATTERN's own comment for the charset/length rationale (mirrors
 * the app repo's services/deeplinks/parse-place-id.ts exactly).
 */

import { render, screen } from "@testing-library/react";
import PlaceSharePage, { generateMetadata } from "@/app/place/[id]/page";

const VALID_ID = "ChIJN1t_tDeuEmsRUsoyG83frY4";

describe("PlaceSharePage id validation", () => {
  it("renders the share landing for a valid Google Places id", async () => {
    const element = await PlaceSharePage({ params: Promise.resolve({ id: VALID_ID }) });
    render(element);
    expect(screen.getByRole("heading", { name: "A place on Crumbify" })).toBeInTheDocument();
  });

  it("accepts an id containing underscores and hyphens", async () => {
    const element = await PlaceSharePage({
      params: Promise.resolve({ id: "place_name-123" }),
    });
    render(element);
    expect(screen.getByRole("heading", { name: "A place on Crumbify" })).toBeInTheDocument();
  });

  it('renders "Place not found" for an id containing disallowed characters', async () => {
    const element = await PlaceSharePage({
      params: Promise.resolve({ id: "../../etc/passwd" }),
    });
    render(element);
    expect(screen.getByText("Place not found")).toBeInTheDocument();
  });

  it('renders "Place not found" for an id exceeding the 300-char length cap', async () => {
    const element = await PlaceSharePage({
      params: Promise.resolve({ id: "a".repeat(301) }),
    });
    render(element);
    expect(screen.getByText("Place not found")).toBeInTheDocument();
  });

  it("accepts an id exactly at the 300-char length cap", async () => {
    const element = await PlaceSharePage({
      params: Promise.resolve({ id: "a".repeat(300) }),
    });
    render(element);
    expect(screen.getByRole("heading", { name: "A place on Crumbify" })).toBeInTheDocument();
  });
});

describe("generateMetadata id validation", () => {
  it("titles a valid id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    expect(metadata.title).toBe("A place on Crumbify");
  });

  it("falls back to a generic title for a malformed id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: "../bad" }) });
    expect(metadata.title).toBe("Crumbify place");
  });

  it("sets a canonical URL built from the encoded id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    expect(metadata.alternates?.canonical).toBe(`https://crumbify.co.uk/place/${VALID_ID}`);
  });
});
