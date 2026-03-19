import { type Page } from "@playwright/test";

/**
 * Intercept the waitlist API with a successful mock response.
 * This prevents Supabase calls during tests and makes the submission
 * flow deterministic.
 */
export async function mockWaitlistSuccess(page: Page) {
  await page.route("**/api/waitlist", (route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Intercept the waitlist API with an error mock response.
 */
export async function mockWaitlistError(page: Page) {
  await page.route("**/api/waitlist", (route) => {
    return route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Server error" }),
    });
  });
}
