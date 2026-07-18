/**
 * E2E tests: Founding Member section (SITE_HANDOFF cream design)
 *
 * The redesigned founding section sits between Groups and CTA, styled
 * in the handoff language (match-card style card, 100-cap progress).
 * We mock GET /api/waitlist/founding for deterministic open/closed
 * states rather than hitting Supabase.
 */
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { mockFoundingOpen, mockFoundingClosed } from "./fixtures/api-mocks";

test.describe("Founding member section", () => {
  test("renders with an eyebrow labelled 'Founding member' (open state)", async ({
    page,
  }) => {
    await mockFoundingOpen(page);
    const home = new HomePage(page);
    await home.goto();

    await home.foundingSection.scrollIntoViewIfNeeded();
    await expect(home.foundingSection).toBeVisible();
    await expect(home.foundingSection).toContainText(/founding member/i);
  });

  test("shows remaining spots when the offer is open", async ({ page }) => {
    await mockFoundingOpen(page, { count: 30, remaining: 70, closed: false });
    const home = new HomePage(page);
    await home.goto();

    await home.foundingSection.scrollIntoViewIfNeeded();
    await expect(home.foundingSection).toContainText("70");
  });

  test("shows a closed state once all 100 spots are claimed", async ({
    page,
  }) => {
    await mockFoundingClosed(page);
    const home = new HomePage(page);
    await home.goto();

    await home.foundingSection.scrollIntoViewIfNeeded();
    await expect(home.foundingSection).toBeVisible();
    await expect(home.foundingSection).not.toContainText(/70 spots/i);
  });

  test("founding-member/success page loads", async ({ page }) => {
    await page.goto("/founding-member/success");
    await expect(page).not.toHaveURL(/404/);
    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
  });
});
