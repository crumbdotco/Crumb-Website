import { type Page } from "@playwright/test";

/**
 * Intercept the founding-member counter API with an "open" response
 * (spots remaining, not yet closed).
 */
export async function mockFoundingOpen(
  page: Page,
  overrides: Partial<{ count: number; remaining: number; closed: boolean }> = {}
) {
  const body = {
    count: 42,
    remaining: 58,
    closed: false,
    ...overrides,
  };
  await page.route("**/api/waitlist/founding", (route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

/**
 * Intercept the founding-member counter API with a "closed" response
 * (all 100 founding spots claimed).
 */
export async function mockFoundingClosed(page: Page) {
  await page.route("**/api/waitlist/founding", (route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: 100, remaining: 0, closed: true }),
    });
  });
}
