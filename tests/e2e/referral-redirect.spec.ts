/**
 * E2E tests: /referral redirect route
 *
 * GET /referral?code=X logs the click and 302-redirects to the native
 * app store based on user agent. Target store URLs are env-dependent
 * (NEXT_PUBLIC_APP_STORE_URL / NEXT_PUBLIC_PLAY_STORE_URL) — when
 * unset, the route falls back to '/'. We assert redirect status +
 * the location header, tolerant of either the configured store URL
 * or the '/' fallback.
 *
 * Uses Playwright's `request` fixture directly (no browser/page)
 * since this is a server-side redirect, not a UI flow.
 */
import { test, expect } from "@playwright/test";

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

test.describe("/referral redirect", () => {
  test("iOS user agent with a valid code redirects (302) to the app store or '/' fallback", async ({
    request,
  }) => {
    const response = await request.get("/referral?code=teste2e", {
      headers: { "User-Agent": IOS_UA },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()["location"];
    expect(location).toBeTruthy();
    // Either the configured NEXT_PUBLIC_APP_STORE_URL or the '/' fallback.
    expect(
      location === "/" || /^https?:\/\//.test(location)
    ).toBe(true);
  });

  test("Android user agent with a valid code redirects (302) to Play Store or '/' fallback", async ({
    request,
  }) => {
    const response = await request.get("/referral?code=teste2e", {
      headers: { "User-Agent": ANDROID_UA },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()["location"];
    expect(location).toBeTruthy();
    expect(
      location === "/" || /^https?:\/\//.test(location)
    ).toBe(true);
  });

  test("invalid code redirects (302) to '/'", async ({ request }) => {
    const response = await request.get("/referral?code=!!!not-valid!!!", {
      headers: { "User-Agent": IOS_UA },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()["location"];
    expect(location).toMatch(/\/$/);
  });

  test("missing code redirects (302) to '/'", async ({ request }) => {
    const response = await request.get("/referral", {
      headers: { "User-Agent": IOS_UA },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()["location"];
    expect(location).toMatch(/\/$/);
  });

  test("desktop user agent with a valid code falls back to '/'", async ({
    request,
  }) => {
    const desktopUA =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const response = await request.get("/referral?code=teste2e", {
      headers: { "User-Agent": desktopUA },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()["location"];
    expect(location).toMatch(/\/$/);
  });
});
