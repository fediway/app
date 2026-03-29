import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Status Detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('clicking a post opens thread view', async ({ page }) => {
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');

    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('can navigate back from thread to feed', async ({ page }) => {
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });

    await page.goBack();
    await expect(page.locator('article').first()).toBeAttached({ timeout: 5000 });
  });

  test('can favourite a reply in the thread view', async ({ page }) => {
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });

    // Wait for descendant to load — scope to #main-content to avoid dual-layout double count
    const feed = page.locator('#main-content');
    await expect(feed.locator('article')).toHaveCount(2, { timeout: 10_000 });

    // Favourite the descendant — URL should not change
    const startUrl = page.url();
    const lastLikeBtn = page.getByLabel(/^like/i).last();
    await lastLikeBtn.click();

    await page.waitForTimeout(500);
    expect(page.url()).toBe(startUrl);
  });

  test('copy link shows Copied toast', async ({ page }) => {
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });

    const detailActions = page.getByTestId('detail-actions').last();
    await detailActions.getByLabel('More actions').click();
    await page.getByText('Copy link').click();

    await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toBeVisible({ timeout: 5000 });
  });
});
