/**
 * E2E tests: Waitlist form submission flows
 *
 * Uses API route mocking so tests run without a real Supabase connection.
 * Covers: happy path success, error state, and invalid email handling.
 */
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import {
  mockWaitlistSuccess,
  mockWaitlistError,
} from "./fixtures/api-mocks";

test.describe("Waitlist form", () => {
  test("email input is visible and accepts text", async ({ page }) => {
    await mockWaitlistSuccess(page);
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    await expect(home.waitlistEmailInput).toBeVisible();
    await home.waitlistEmailInput.fill("test@example.com");
    await expect(home.waitlistEmailInput).toHaveValue("test@example.com");
  });

  test("submit button is visible and enabled by default", async ({ page }) => {
    await mockWaitlistSuccess(page);
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    await expect(home.waitlistSubmitButton).toBeVisible();
    await expect(home.waitlistSubmitButton).toBeEnabled();
    await expect(home.waitlistSubmitButton).toHaveText(/join free/i);
  });

  test("successful submission shows 'You're on the list!' message", async ({
    page,
  }) => {
    await mockWaitlistSuccess(page);
    const home = new HomePage(page);
    await home.goto();

    await home.submitWaitlistEmail("success@example.com");

    // Optimistically wait for the success state
    await expect(home.waitlistSuccessMessage).toBeVisible({ timeout: 8000 });
    // Scope to #waitlist to avoid matching the SocialProof section's identical text
    await expect(
      page.locator("#waitlist").getByText(/we'll email you on launch day/i)
    ).toBeVisible();

    // Form should no longer be visible after success
    await expect(home.waitlistEmailInput).not.toBeVisible();
    await expect(home.waitlistSubmitButton).not.toBeVisible();
  });

  test("failed API call shows error message", async ({ page }) => {
    await mockWaitlistError(page);
    const home = new HomePage(page);
    await home.goto();

    await home.submitWaitlistEmail("fail@example.com");

    await expect(home.waitlistErrorMessage).toBeVisible({ timeout: 8000 });
    // Form should still be usable after an error
    await expect(home.waitlistEmailInput).toBeVisible();
  });

  test("submit button shows 'Joining...' while request is in flight", async ({
    page,
  }) => {
    // Use a slow mock so we can catch the loading state
    await page.route("**/api/waitlist", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();
    await home.waitlistEmailInput.fill("slow@example.com");

    // Click and immediately check loading text before the response arrives
    const clickPromise = home.waitlistSubmitButton.click();
    await expect(home.waitlistSubmitButton).toHaveText(/joining/i, {
      timeout: 3000,
    });
    await clickPromise;
  });

  test("submit button is disabled while loading", async ({ page }) => {
    await page.route("**/api/waitlist", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();
    await home.waitlistEmailInput.fill("disabled@example.com");

    const clickPromise = home.waitlistSubmitButton.click();
    await expect(home.waitlistSubmitButton).toBeDisabled({ timeout: 3000 });
    await clickPromise;
  });

  test("HTML5 validation blocks empty email submission", async ({ page }) => {
    await mockWaitlistSuccess(page);
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    // Click submit without filling in email
    await home.waitlistSubmitButton.click();

    // The API route must NOT have been called
    let apiCalled = false;
    await page.route("**/api/waitlist", () => {
      apiCalled = true;
    });

    // Success message must NOT appear
    await expect(home.waitlistSuccessMessage).not.toBeVisible();
    expect(apiCalled).toBe(false);
  });

  test("Founding Member external link has correct href", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.scrollToWaitlist();

    const foundingLink = page.getByRole("link", {
      name: /become a founding member.*£4\.99/i,
    });
    await expect(foundingLink).toBeVisible();
    await expect(foundingLink).toHaveAttribute(
      "href",
      "https://buy.stripe.com/3cI8wJ6zPaaG5XE7M33ks00"
    );
    await expect(foundingLink).toHaveAttribute("target", "_blank");
    await expect(foundingLink).toHaveAttribute("rel", /noopener/i);
  });
});
