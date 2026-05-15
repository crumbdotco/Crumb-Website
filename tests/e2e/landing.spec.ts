import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders all sections desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for preloader fadeout
    await page.waitForTimeout(2000);

    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText(/Your food/i)).toBeVisible();
    await expect(page.getByText(/Now in TestFlight/i)).toBeVisible();
    await expect(page.locator('#features')).toBeVisible();
    await expect(page.locator('#discover')).toBeVisible();
    await expect(page.locator('#download')).toBeVisible();
    await expect(page.getByText(/App Store/i)).toBeVisible();

    // No spend language anywhere
    const body = await page.textContent('body');
    expect(body).not.toMatch(/£\d/);
    expect(body).not.toMatch(/total spent/i);
    expect(body).not.toMatch(/connect your/i);
  });

  test('renders mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    await expect(page.locator('header')).toBeVisible();
    // Hamburger button present
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();
    // Mobile feature stack visible
    await expect(page.locator('#features-mobile')).toBeAttached();
  });

  test('mobile menu opens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(1500);

    await page.getByRole('button', { name: /open menu/i }).click();
    await expect(page.getByRole('link', { name: 'Features' })).toBeVisible();
  });
});
