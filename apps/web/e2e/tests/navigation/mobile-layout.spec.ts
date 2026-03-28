import { expect, test } from '../../helpers/base';

// iPhone-sized viewport
test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile Layout', () => {
  test('shows auth pill at bottom when logged out', async ({ page }) => {
    await page.goto('/');

    // Sign in link should be visible in the bottom pill
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible({ timeout: 10_000 });

    // Desktop sidebar should NOT be visible
    await expect(page.locator('nav[aria-label="Main navigation"]')).not.toBeVisible();
  });

  test('mobile header is hidden when logged out', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible({ timeout: 10_000 });

    // Header (app-bar) should NOT be visible when logged out
    await expect(page.locator('[data-slot="app-bar"]')).not.toBeVisible();
  });

  test('feed content renders at mobile width', async ({ page }) => {
    await page.goto('/');

    // Posts should render at mobile width
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });
});
