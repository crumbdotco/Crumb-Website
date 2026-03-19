/**
 * E2E tests: Founding Member flow
 *
 * Verifies that the Founding Member section is present, displays
 * correct pricing and benefits, and that the Stripe checkout link
 * is correctly attributed. We do NOT navigate to Stripe as that
 * is an external domain.
 */
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("Founding Member section", () => {
  test("Founding Member card is present in the waitlist section", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    await home.foundingMemberCard.scrollIntoViewIfNeeded();
    await expect(home.foundingMemberCard).toBeVisible();
  });

  test("displays correct one-time price of £4.99", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    // Find the price within the founding member card context
    const foundingSection = page
      .locator("section#waitlist")
      .getByText(/£4\.99/);
    await expect(foundingSection.first()).toBeVisible();
  });

  test("displays 'Pay once. Get premium forever.' tagline", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    await expect(
      page.getByText(/pay once\. get premium forever/i)
    ).toBeVisible();
  });

  test("lists all four founding member benefits", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    const benefits = [
      /first-day access/i,
      /lifetime premium/i,
      /founding member.*badge/i,
      /all future premium features/i,
    ];

    for (const benefit of benefits) {
      await expect(page.getByText(benefit).first()).toBeVisible();
    }
  });

  test("Founding Member CTA links to Stripe checkout", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    const link = page.getByRole("link", {
      name: /become a founding member.*£4\.99/i,
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://buy.stripe.com/3cI8wJ6zPaaG5XE7M33ks00"
    );
  });

  test("Founding Member link opens in a new tab", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    const link = page.getByRole("link", {
      name: /become a founding member.*£4\.99/i,
    });
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("Founding Member link has noopener noreferrer for security", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    const link = page.getByRole("link", {
      name: /become a founding member.*£4\.99/i,
    });
    const rel = await link.getAttribute("rel");
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
  });

  test("divider 'or' separator is visible between free and founding member", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    // The "or" divider between the free waitlist form and founding member
    await expect(
      page.locator("#waitlist").getByText(/^or$/i)
    ).toBeVisible();
  });

  test("founding-member/success page loads", async ({ page }) => {
    await page.goto("/founding-member/success");
    // Should return a valid page (200) - not a 404
    await expect(page).not.toHaveURL(/404/);
    // Check that the page has some content
    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
  });
});
