/**
 * E2E tests: Navbar navigation and scroll-to-section anchors
 *
 * Verifies anchor links (#how #feed #discover #groups) scroll their
 * targets into view, and the header gains `.solid` after scrolling
 * past the 40px threshold (see 04-MOTION.md onScroll()).
 */
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("Navbar navigation", () => {
  test("header is fixed at the top of the page", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.header).toBeVisible();
    const box = await home.header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThanOrEqual(5);
  });

  test("header has no 'solid' class before scrolling", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.header).not.toHaveClass(/solid/);
  });

  test("header gains 'solid' class after scrolling past threshold", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(300);

    await expect(home.header).toHaveClass(/solid/);
  });

  test("nav links point to the correct anchors", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const hrefs = await home.navLinks.evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute("href"))
    );
    expect(hrefs).toEqual(["#how", "#feed", "#discover", "#groups"]);
  });

  test("clicking 'How it works' scrolls #how into view", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.clickNavLink("How it works");
    await expect(home.howSection).toBeInViewport({ ratio: 0.1 });
  });

  test("clicking 'The feed' scrolls #feed into view", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.clickNavLink("The feed");
    await expect(home.feedSection).toBeInViewport({ ratio: 0.1 });
  });

  test("clicking 'Discover' scrolls #discover into view", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.clickNavLink("Discover");
    await expect(home.discoverSection).toBeInViewport({ ratio: 0.1 });
  });

  test("clicking 'Groups' scrolls #groups into view", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.clickNavLink("Groups");
    await expect(home.groupsSection).toBeInViewport({ ratio: 0.1 });
  });
});
