/**
 * E2E tests: Homepage sections load correctly (SITE_HANDOFF cream design)
 *
 * Verifies every section from the ported design is present, in order,
 * with its key copy/markup. Selectors and copy are sourced from
 * SITE_HANDOFF/site/Crumbify.html + 02-SECTIONS.md.
 */
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("Homepage sections", () => {
  test("header nav renders brand and anchor links", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.header).toBeVisible();
    await expect(home.navBrand).toContainText("Crumbify");
    await expect(home.navLinks).toHaveText([
      "How it works",
      "The feed",
      "Discover",
      "Groups",
    ]);
    await expect(home.navGetAppButton).toHaveText(/get the app/i);
  });

  test("hero renders headline and store badges", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.heroHeading).toBeVisible();
    await expect(home.heroHeading).toContainText("Your city, scored");
    await expect(home.heroHeading.locator("em.s")).toContainText("you trust");
  });

  test("manifesto section renders", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.manifesto.scrollIntoViewIfNeeded();
    await expect(home.manifesto).toContainText(
      /friend who always knows/i
    );
  });

  test("how it works section lists 5 steps", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.howSection.scrollIntoViewIfNeeded();
    await expect(home.howSection).toBeVisible();
    await expect(home.howListItems).toHaveCount(5);

    const titles = ["Post it", "Friends see it", "Discover", "Save it", "Go eat"];
    for (const title of titles) {
      await expect(
        home.howSection.getByRole("heading", { name: title, exact: true })
      ).toBeVisible();
    }
  });

  test("feed section has two marquee rows with feed cards", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.feedSection.scrollIntoViewIfNeeded();
    await expect(home.feedSection).toBeVisible();
    await expect(home.rowA).toBeVisible();
    await expect(home.rowB).toBeVisible();

    const cardCount = await home.feedCards.count();
    expect(cardCount).toBeGreaterThan(0);
    await expect(home.feedCards.first()).toHaveClass(/fcard/);
  });

  test("band caption renders 'Every bite tells a story.'", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.bandCaption.scrollIntoViewIfNeeded();
    await expect(home.bandCaption).toHaveText("Every bite tells a story.");
  });

  test("discover / taste match section renders match card with 87%", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.discoverSection.scrollIntoViewIfNeeded();
    await expect(home.discoverSection).toBeVisible();
    await expect(home.matchCard).toContainText("87%");
    await expect(home.matchCard).toContainText("You and Zayn, matched");
  });

  test("groups section renders group card with Friday dinner", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.groupsSection.scrollIntoViewIfNeeded();
    await expect(home.groupsSection).toBeVisible();
    await expect(home.groupCard).toContainText("Friday dinner");
    await expect(home.groupCard).toContainText("4 friends deciding");
  });

  test("founding section renders", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.foundingSection.scrollIntoViewIfNeeded();
    await expect(home.foundingSection).toBeVisible();
  });

  test("cta section renders 'one tap away'", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.ctaIn.scrollIntoViewIfNeeded();
    await expect(home.ctaIn).toContainText("one tap away");
  });

  test("footer renders with CARTO attribution", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.footer.scrollIntoViewIfNeeded();
    await expect(home.footer).toBeVisible();
    await expect(home.footer).toContainText(
      /Map data.*OpenStreetMap contributors, tiles.*CARTO/
    );
    await expect(home.footer).toContainText("Crumbify LTD");
  });

  test("sections render in the expected top-to-bottom order", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();

    const ids = await page.evaluate(() =>
      Array.from(document.querySelectorAll("section[id], header#hdr, footer"))
        .map((el) => el.id || el.tagName.toLowerCase())
    );

    const expectedOrder = ["hdr", "how", "feed", "discover", "groups", "footer"];
    for (let i = 0; i < expectedOrder.length - 1; i++) {
      expect(ids.indexOf(expectedOrder[i])).toBeLessThan(
        ids.indexOf(expectedOrder[i + 1])
      );
    }
  });
});
