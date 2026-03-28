import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('can navigate between tabs', async ({ page }) => {
    // Home — posts visible
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Search — verify URL and page loaded
    await page.goto('/search');
    await expect(page).toHaveURL('/search');

    // Notifications — verify page loaded
    await page.goto('/notifications');
    await expect(page).toHaveURL('/notifications');

    // Back to Home — should be instant (KeepAlive)
    await page.goto('/');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 2000 });
  });

  test('KeepAlive preserves feed state on tab switch', async ({ page }) => {
    // Wait for feed to load
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Count posts
    const initialCount = await page.locator('article').count();
    expect(initialCount).toBeGreaterThan(0);

    // Navigate away and back
    await page.goto('/search');
    await expect(page).toHaveURL('/search');
    await page.goto('/');

    // Posts should be immediately available (cached, not re-fetching)
    await expect(page.locator('article').first()).toBeAttached({ timeout: 2000 });

    // Same number of posts (no re-fetch)
    const returnCount = await page.locator('article').count();
    expect(returnCount).toBe(initialCount);
  });
});
