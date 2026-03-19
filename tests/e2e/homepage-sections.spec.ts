/**
 * E2E tests: Homepage sections load correctly
 *
 * Verifies that every named section is present and rendered with
 * its primary heading/content text so a user reading the page
 * gets the full marketing experience.
 */
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("Homepage sections", () => {
  test("page title is correct", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(page).toHaveTitle(/crumb/i);
  });

  test("Navbar renders brand name and waitlist CTA", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.navBrand).toBeVisible();
    await expect(home.navJoinWaitlist).toBeVisible();
  });

  test("Hero section renders headline and subheading", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.heroHeading).toBeVisible();
    await expect(home.heroSubheading).toBeVisible();
  });

  test("Hero section contains CTA link to waitlist", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const heroCTA = page.getByRole("link", { name: /join the waitlist.*free/i }).first();
    await expect(heroCTA).toBeVisible();
    await expect(heroCTA).toHaveAttribute("href", "#waitlist");
  });

  test("WhatYoullDiscover section renders heading and discovery cards", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.whatYoullDiscoverHeading.scrollIntoViewIfNeeded();
    await expect(home.whatYoullDiscoverHeading).toBeVisible();

    // Verify the section label
    await expect(page.getByText(/what you'll discover/i).first()).toBeVisible();

    // The grid should have 6 discovery cards; spot-check a couple
    await expect(page.getByText("147").first()).toBeVisible();
    await expect(page.getByText(/nando/i).first()).toBeVisible();
  });

  test("HowItWorks section renders heading and three steps", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.howItWorksHeading.scrollIntoViewIfNeeded();
    await expect(home.howItWorksHeading).toBeVisible();

    // Three step titles
    await expect(
      page.getByRole("heading", { name: /connect your accounts/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /we crunch the numbers/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /see your stats and share them/i })
    ).toBeVisible();
  });

  test("WrappedPreview section renders heading and carousel", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.wrappedPreviewHeading.scrollIntoViewIfNeeded();
    await expect(home.wrappedPreviewHeading).toBeVisible();

    // The first carousel card should show a stat
    await expect(page.getByText("You ordered").first()).toBeVisible();
  });

  test("FeaturesGrid section renders heading and four feature cards", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.featuresGridHeading.scrollIntoViewIfNeeded();
    await expect(home.featuresGridHeading).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /deep stats/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /crumb wrapped/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /discover new food/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /food soulmate/i })
    ).toBeVisible();
  });

  test("FeaturesGrid renders pricing section with Free and Premium tiers", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await page.getByText(/simple and fair/i).scrollIntoViewIfNeeded();
    await expect(page.getByText(/simple and fair/i)).toBeVisible();

    // Pricing tier headings (text-node uppercase labels in pricing cards)
    await expect(page.getByText("Free").first()).toBeVisible();
    await expect(page.getByText("Premium").first()).toBeVisible();

    // Prices
    await expect(page.getByText("£0").first()).toBeVisible();
    await expect(page.getByText(/£1\.99/i).first()).toBeVisible();
  });

  test("SocialProof section renders CTA", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.socialProofHeading.scrollIntoViewIfNeeded();
    await expect(home.socialProofHeading).toBeVisible();

    // CTA link inside the section
    const ctaLinks = page.getByRole("link", { name: /join the waitlist.*free/i });
    await expect(ctaLinks.last()).toBeVisible();
  });

  test("WaitlistSection renders heading, email input, and submit button", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.scrollToWaitlist();
    await expect(home.waitlistHeading).toBeVisible();
    await expect(home.waitlistEmailInput).toBeVisible();
    await expect(home.waitlistSubmitButton).toBeVisible();
    await expect(home.waitlistSubmitButton).toHaveText(/join free/i);
  });

  test("WaitlistSection renders Founding Member card", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.scrollToWaitlist();
    await expect(home.foundingMemberCard).toBeVisible();
    await expect(page.getByText(/pay once\. get premium forever/i)).toBeVisible();
    await expect(page.getByText(/£4\.99/i).first()).toBeVisible();
  });

  test("Footer renders logo, legal links and social icons", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.footer.scrollIntoViewIfNeeded();
    await expect(home.footer).toBeVisible();

    // Brand
    await expect(
      home.footer.getByText(/crumb/i).first()
    ).toBeVisible();

    // Legal links
    await expect(home.footerPrivacyLink).toBeVisible();
    await expect(home.footerTermsLink).toBeVisible();
    await expect(home.footerContactLink).toBeVisible();

    // Social links
    await expect(
      home.footer.getByRole("link", { name: /instagram/i })
    ).toBeVisible();
    await expect(
      home.footer.getByRole("link", { name: /x \/ twitter/i })
    ).toBeVisible();
    await expect(
      home.footer.getByRole("link", { name: /tiktok/i })
    ).toBeVisible();

    // Copyright year
    const year = new Date().getFullYear().toString();
    await expect(home.footer.getByText(new RegExp(year))).toBeVisible();
  });
});
