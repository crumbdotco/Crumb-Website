/**
 * E2E tests: Navbar navigation and scroll-to-section links
 *
 * Verifies that clicking the navbar CTA and hero CTAs scrolls the
 * page to the #waitlist section and brings the section into view.
 */
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("Navbar navigation", () => {
  test("navbar is visible at the top of the page", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
    // The nav should be fixed at the top
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThanOrEqual(5);
  });

  test("navbar brand 'crumb' is displayed", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.navBrand).toBeVisible();
    await expect(home.navBrand).toHaveText("crumb");
  });

  test("navbar 'Join the waitlist' link points to #waitlist", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.navJoinWaitlist).toHaveAttribute("href", "#waitlist");
  });

  test("clicking navbar 'Join the waitlist' scrolls to waitlist section", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.navJoinWaitlist.click();
    // After anchor scroll, the waitlist section should be in the viewport
    await expect(home.waitlistSection).toBeInViewport({ ratio: 0.1 });
  });

  test("clicking hero CTA scrolls to waitlist section", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // The first hero CTA link
    const heroCTA = page
      .getByRole("link", { name: /join the waitlist.*free/i })
      .first();
    await heroCTA.click();
    await expect(home.waitlistSection).toBeInViewport({ ratio: 0.1 });
  });

  test("navbar becomes styled after scrolling past threshold", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    const nav = page.locator("nav");

    // Before scroll: should not have backdrop class
    const classesBefore = await nav.getAttribute("class");
    expect(classesBefore).toContain("bg-transparent");

    // Scroll down past 60px threshold
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(400);

    // After scroll: nav should change styling (backdrop/background applied)
    const classesAfter = await nav.getAttribute("class");
    // The scrolled state applies bg-crumb-cream/90 and backdrop-blur
    expect(classesAfter).toContain("backdrop-blur");
  });

  test("'#waitlist' anchor links in FeaturesGrid point correctly", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    // Both pricing CTA buttons link to #waitlist
    const waitlistLinks = page.getByRole("link", {
      name: /join the waitlist/i,
    });
    const count = await waitlistLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      await expect(waitlistLinks.nth(i)).toHaveAttribute("href", "#waitlist");
    }
  });
});
