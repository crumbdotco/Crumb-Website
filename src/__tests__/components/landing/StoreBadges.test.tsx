/**
 * src/__tests__/components/landing/StoreBadges.test.tsx
 *
 * Pixel-fix F-53 fix-round r1:
 * - F53-R1: badges must be self-styling (real pill chrome, sized icon)
 *   wherever mounted, not dependent on an ambient `.landing` ancestor class
 *   - verified here structurally (real anchors, sized icon wrapper), since
 *   jsdom does not compute actual CSS from Tailwind classes.
 * - F53-R2: both badges must ALWAYS resolve to a real, working href - never
 *   a bare "#" and never a non-interactive disabled element - falling back
 *   to the site's founding-member join CTA when a store env var is unset.
 */

import { render, screen } from "@testing-library/react";
import { StoreBadges } from "@/components/landing/StoreBadges";

describe("StoreBadges", () => {
  const originalAppStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL;
  const originalPlayStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_STORE_URL = originalAppStoreUrl;
    process.env.NEXT_PUBLIC_PLAY_STORE_URL = originalPlayStoreUrl;
  });

  describe("when neither store URL env var is set (pre-launch on both stores)", () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_APP_STORE_URL;
      delete process.env.NEXT_PUBLIC_PLAY_STORE_URL;
    });

    it("renders exactly two anchors, never a disabled/non-interactive element", () => {
      render(<StoreBadges />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);
    });

    it('the App Store badge falls back to the working /#founding CTA, never a bare "#"', () => {
      render(<StoreBadges />);
      const appStoreLink = screen.getByRole("link", { name: /App Store/i });
      expect(appStoreLink).toHaveAttribute("href", "/#founding");
    });

    it("the App Store badge's visible label reads Coming soon, matching its aria-label and the Play badge's convention (fix-round r2, F53-N3)", () => {
      render(<StoreBadges />);
      const appStoreLink = screen.getByRole("link", { name: /App Store/i });
      expect(appStoreLink).toHaveTextContent("Coming soon");
      expect(appStoreLink).not.toHaveTextContent("Download on the");
    });

    it('the Google Play badge falls back to the working /#founding CTA too, never a bare "#" or a disabled span', () => {
      render(<StoreBadges />);
      const playLink = screen.getByRole("link", { name: /Google Play/i });
      expect(playLink).toHaveAttribute("href", "/#founding");
      expect(playLink).not.toHaveAttribute("aria-disabled");
    });
  });

  describe("when both store URL env vars are set (both stores live)", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_APP_STORE_URL = "https://apps.apple.com/app/crumbify/id123456789";
      process.env.NEXT_PUBLIC_PLAY_STORE_URL =
        "https://play.google.com/store/apps/details?id=com.crumbify.app";
    });

    it("the App Store badge links to the real App Store URL", () => {
      render(<StoreBadges />);
      const appStoreLink = screen.getByRole("link", { name: /App Store/i });
      expect(appStoreLink).toHaveAttribute(
        "href",
        "https://apps.apple.com/app/crumbify/id123456789",
      );
    });

    it("the Google Play badge links to the real Play Store URL", () => {
      render(<StoreBadges />);
      const playLink = screen.getByRole("link", { name: /Google Play/i });
      expect(playLink).toHaveAttribute(
        "href",
        "https://play.google.com/store/apps/details?id=com.crumbify.app",
      );
    });
  });

  describe("className prop (fix-round r2, F53-N1: CTA.tsx recentring)", () => {
    it("merges an optional className onto the wrapper without dropping the base layout classes", () => {
      const { getByTestId } = render(<StoreBadges className="justify-center" />);
      const wrapper = getByTestId("store-badges");
      expect(wrapper.className).toMatch(/justify-center/);
      expect(wrapper.className).toMatch(/flex-wrap/);
    });

    it("renders with no extra classes when className is omitted (homepage Hero.tsx usage)", () => {
      const { getByTestId } = render(<StoreBadges />);
      const wrapper = getByTestId("store-badges");
      expect(wrapper.className).not.toMatch(/justify-center/);
    });
  });

  // F53-R3-1 fix (pixel-fix wave 1 round-3 re-review, MED): the r2 fix for
  // F53-N1 (homepage gold-on-black labels + near-invisible ink-on-black
  // hover, caused by unlayered landing.css beating a plain `text-white`
  // Tailwind utility) had NO test asserting the colour utility itself - only
  // the `!` (important) modifier stands between the homepage and that
  // regression recurring, and jsdom cannot see the cascade outcome directly.
  // This asserts the anchor className carries an important-flagged
  // text-white utility in either valid Tailwind v3/v4 spelling, so deleting
  // the `!` (or an upgrade codemod rewriting it) fails this suite instead of
  // shipping silently.
  describe("important-flagged colour utility (F53-R3-1: guards the F53-N1 homepage regression)", () => {
    it("both badge anchors carry an important-flagged text-white utility (base + hover), each independently guarded (R4-WEB-1 fix: boundary-anchored so the hover token cannot satisfy the base assertion)", () => {
      const { container } = render(<StoreBadges />);
      const anchors = container.querySelectorAll("a");
      expect(anchors).toHaveLength(2);
      anchors.forEach((anchor) => {
        // Unlayered CSS (landing.css) beats layered Tailwind utilities
        // regardless of specificity - only an `!important`-flagged utility
        // survives that cascade, in either the legacy leading-`!` spelling
        // or Tailwind v4's trailing-`!` spelling.
        //
        // R4-WEB-1 fix: these regexes are whitespace/boundary-anchored so
        // the BASE utility and the HOVER utility are each independently
        // guarded. The previous unanchored /!text-white|text-white!/ still
        // matched the substring inside "hover:!text-white" even when the
        // base utility's own `!` was removed, so stripping the important
        // flag from the base colour alone (the exact F53-N1 symptom - gold-
        // on-black homepage labels) passed this suite silently.
        expect(anchor.className).toMatch(/(^|\s)(!text-white|text-white!)(\s|$)/);
        expect(anchor.className).toMatch(/(^|\s)(hover:!text-white|hover:text-white!)(\s|$)/);
      });
    });
  });

  describe("icon sizing (F53-R1: the raw SVGs in data.ts carry no width/height of their own)", () => {
    it("each icon is wrapped in an explicitly sized container, not left to the SVG's own (nonexistent) intrinsic size", () => {
      const { container } = render(<StoreBadges />);
      const iconWrappers = container.querySelectorAll("a > span:first-child");
      expect(iconWrappers).toHaveLength(2);
      iconWrappers.forEach((wrapper) => {
        expect(wrapper.className).toMatch(/h-\[27px\]/);
        expect(wrapper.className).toMatch(/w-\[27px\]/);
        expect(wrapper.querySelector("svg")).not.toBeNull();
      });
    });
  });
});
