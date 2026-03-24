import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      // Provide the Stripe founding-member link so the <a> element renders
      // during E2E tests. Without this the env var is empty and the component
      // renders a disabled <button> instead, breaking all founding-member tests.
      NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK:
        "https://buy.stripe.com/3cI8wJ6zPaaG5XE7M33ks00",
      // Leave NEXT_PUBLIC_TURNSTILE_SITE_KEY unset (empty) so the Cloudflare
      // Turnstile widget is skipped entirely during tests. When hasTurnstile is
      // false the submit button stays enabled and shows "Join Free →" — which
      // is what the waitlist-form tests assert.
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
    },
  },
});
