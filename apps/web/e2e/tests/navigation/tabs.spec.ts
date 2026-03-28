import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('can navigate between tabs', async ({ page }) => {
    // Home — posts visible
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });

    // Search
    await page.goto('/search');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Notifications
    await page.goto('/notifications');
    await expect(page.getByText(/notifications/i).first()).toBeVisible();

    // Back to Home — should be instant (KeepAlive)
    await page.goto('/');
    await expect(page.locator('article').first()).toBeVisible({ timeout: 2000 });
  });

  test('KeepAlive preserves feed state on tab switch', async ({ page }) => {
    // Wait for feed to load
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });

    // Count posts
    const initialCount = await page.locator('article').count();
    expect(initialCount).toBeGreaterThan(0);

    // Navigate away
    await page.goto('/search');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Navigate back
    await page.goto('/');

    // Posts should be immediately visible (cached, not re-fetching)
    await expect(page.locator('article').first()).toBeVisible({ timeout: 2000 });

    // Same number of posts (no re-fetch)
    const returnCount = await page.locator('article').count();
    expect(returnCount).toBe(initialCount);
  });
});
