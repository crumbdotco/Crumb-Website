/**
 * E2E tests: /ref referral landing page
 *
 * Covers the three mandatory acceptance criteria:
 *  1. Valid ?u=alice renders the personalised heading "Join alice on Crumbify"
 *  2. Missing ?u= renders the generic "Join Crumbify" heading
 *  3. Invalid ?u=$$ is ignored - renders generic heading, no personalised note
 *
 * These are lightweight render assertions (no store redirect verified)
 * because the app is not installed in the test environment.
 */
import { test, expect } from "@playwright/test";

test.describe("/ref referral landing page", () => {
  test("valid ?u=alice renders personalised heading", async ({ page }) => {
    await page.goto("/ref?u=alice");
    await page.waitForLoadState("networkidle");

    // Personalised heading must be present
    await expect(
      page.getByRole("heading", { name: /Join alice on Crumbify/i })
    ).toBeVisible();

    // Eyebrow must be present
    await expect(page.getByText(/Your friend invited you/i)).toBeVisible();

    // Personalised note must be present
    await expect(
      page.getByText(/We will help you find alice/i)
    ).toBeVisible();

    // Hard design rule: no money / spend / £ figures
    const body = await page.textContent("body");
    expect(body).not.toMatch(/£\d/);
    expect(body).not.toMatch(/premium/i);
    expect(body).not.toMatch(/7 days/i);

    // No false API/OAuth claims
    expect(body).not.toMatch(/connect.*uber eats/i);
    expect(body).not.toMatch(/oauth/i);
  });

  test("missing ?u= renders generic heading without personalised note", async ({
    page,
  }) => {
    await page.goto("/ref");
    await page.waitForLoadState("networkidle");

    // Generic heading must be present
    await expect(
      page.getByRole("heading", { name: /^Join Crumbify$/i })
    ).toBeVisible();

    // Eyebrow "Your friend invited you" must NOT be visible (no referrer)
    await expect(page.getByText(/Your friend invited you/i)).not.toBeVisible();

    // Personalised note must NOT be visible
    await expect(page.getByText(/We will help you find/i)).not.toBeVisible();
  });

  test("invalid ?u=$$ is ignored - renders generic heading, no personalised note", async ({
    page,
  }) => {
    await page.goto("/ref?u=%24%24%24");
    await page.waitForLoadState("networkidle");

    // Must render generic (no attribution junk passed through)
    await expect(
      page.getByRole("heading", { name: /^Join Crumbify$/i })
    ).toBeVisible();

    // No personalised note for invalid input
    const body = await page.textContent("body");
    expect(body).not.toMatch(/We will help you find/i);
    // No raw $$ characters leaked into the rendered page as a username
    expect(body).not.toMatch(/Join \$\$\$ on Crumbify/i);
  });

  test("/invite redirects to /ref preserving username", async ({ page }) => {
    await page.goto("/invite?ref=bob");
    await page.waitForLoadState("networkidle");

    // Should have followed the redirect to /ref?u=bob
    expect(page.url()).toContain("/ref");
    expect(page.url()).toContain("u=bob");
  });

  test("/invite without param redirects to /ref", async ({ page }) => {
    await page.goto("/invite");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/ref");
  });
});
