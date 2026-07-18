/**
 * E2E tests: Mobile responsive layout (SITE_HANDOFF cream design)
 *
 * Run at 390x844 (iPhone 12/13 viewport, matches 02-SECTIONS.md's
 * <=560px breakpoint). Verifies the burger menu, two-step drawer
 * open, hero pin labels hidden, and stacked store badges.
 */
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.use({ viewport: { width: 390, height: 844 } });

test.describe("Mobile responsive layout", () => {
  test("page loads without horizontal overflow", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test("burger is visible and nav links are hidden", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.burger).toBeVisible();
    await expect(home.navLinks.first()).toBeHidden();
  });

  test("burger opens the two-step mobile drawer", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Step 1: .show is applied so the drawer becomes flex/displayed.
    // Step 2 (next frame): .open animates it into view.
    await home.burger.click();
    await expect(home.mobileNav).toHaveClass(/show/);
    await expect(home.mobileNav).toHaveClass(/open/);
    await expect(home.burger).toHaveClass(/open/);
  });

  test("mobile drawer lists all four nav links plus get-app button", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.openMobileMenu();

    const links = home.mobileNav.locator("a");
    await expect(links).toHaveText([
      "How it works",
      "The feed",
      "Discover",
      "Groups",
    ]);
    await expect(home.mobileNav.locator(".btn")).toHaveText(/get the app/i);
  });

  test("clicking a drawer link closes the menu", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.openMobileMenu();
    await home.mobileNav.locator("a").filter({ hasText: "How it works" }).click();

    await expect(home.mobileNav).not.toHaveClass(/open/);
  });

  test("hero pin labels are hidden on mobile", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // .pinwrap .lab is set to display:none at <=560px (02-SECTIONS.md).
    const labels = page.locator(".pinwrap .lab");
    const count = await labels.count();
    for (let i = 0; i < count; i++) {
      await expect(labels.nth(i)).toBeHidden();
    }
  });

  test("store badges stack full-width on mobile", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.ctaIn.scrollIntoViewIfNeeded();
    const badges = home.ctaIn.locator(".store");
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);

    if (count >= 2) {
      const firstBox = await badges.nth(0).boundingBox();
      const secondBox = await badges.nth(1).boundingBox();
      expect(firstBox).not.toBeNull();
      expect(secondBox).not.toBeNull();
      // Stacked (or wrapped full-width): each badge should be a
      // meaningful fraction of the 390px viewport, not tiny inline chips.
      expect(firstBox!.width).toBeGreaterThan(120);
      expect(secondBox!.width).toBeGreaterThan(120);
    }
  });
});
