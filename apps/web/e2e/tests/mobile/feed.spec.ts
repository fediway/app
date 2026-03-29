import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile Feed', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('feed posts render at mobile width', async ({ page }) => {
    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('tapping a post navigates to status detail', async ({ page }) => {
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });
  });

  test('favourite does not navigate away from feed', async ({ page }) => {
    const startUrl = page.url();

    // Find and click a favourite button
    const favBtn = page.getByLabel(/^like/i);
    await expect(favBtn.first()).toBeAttached({ timeout: 5000 });
    await favBtn.first().dispatchEvent('click');

    // Should stay on same page
    await page.waitForTimeout(500);
    expect(page.url()).toBe(startUrl);
  });

  test('bookmark does not navigate away and shows toast', async ({ page }) => {
    const startUrl = page.url();

    const bookmarkBtn = page.getByLabel(/^save$/i);
    await expect(bookmarkBtn.first()).toBeAttached({ timeout: 5000 });
    await bookmarkBtn.first().dispatchEvent('click');

    // Should stay on same page
    await page.waitForTimeout(500);
    expect(page.url()).toBe(startUrl);

    // Toast should appear
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible({ timeout: 5000 });
  });
});
