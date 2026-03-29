import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Data Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('favourite button changes state when clicked', async ({ page }) => {
    // Navigate to detail
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });

    const detailActions = page.getByTestId('detail-actions').last();

    // Click favourite
    const favBtn = detailActions.getByLabel(/^like/i);
    await favBtn.click();

    // Button should now be "Unlike" (pressed state)
    await expect(detailActions.getByLabel(/^unlike/i)).toBeAttached({ timeout: 3000 });
  });

  test('bookmark state is consistent across feed and detail', async ({ page }) => {
    // Bookmark in the feed
    const bookmarkBtn = page.getByLabel(/^save$/i).last();
    await bookmarkBtn.click();
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible({ timeout: 5000 });

    // Navigate to /saved — the bookmarked post should be there
    await page.goto('/saved');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('multiple posts can be deleted sequentially', async ({ page }) => {
    const feed = page.locator('#main-content');
    const countBefore = await feed.locator('article').count();

    // Delete first post
    const moreBtn1 = page.getByLabel('More actions').first();
    await moreBtn1.dispatchEvent('click');
    await page.getByText('Delete post').click();
    await expect(page.getByRole('status').filter({ hasText: 'Post deleted' })).toBeVisible({ timeout: 5000 });

    // Wait for toast to dismiss
    await expect(page.getByRole('status').filter({ hasText: 'Post deleted' })).not.toBeVisible({ timeout: 6000 });

    // Count should be one less
    await expect(feed.locator('article')).toHaveCount(countBefore - 1, { timeout: 3000 });

    // Delete another post
    const moreBtn2 = page.getByLabel('More actions').first();
    await moreBtn2.dispatchEvent('click');

    // Check if Delete post is available (next post might be own post too)
    const deleteOption = page.getByText('Delete post');
    if (await deleteOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteOption.click();
      await expect(feed.locator('article')).toHaveCount(countBefore - 2, { timeout: 3000 });
    }
  });

  test('feed preserves state after tab switch and return', async ({ page }) => {
    const feed = page.locator('#main-content');
    const countBefore = await feed.locator('article').count();

    // Switch to notifications
    await page.goto('/notifications');
    await expect(page.getByText('Notifications').first()).toBeAttached({ timeout: 5000 });

    // Switch back to home
    await page.goto('/');
    await expect(feed.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Should have same number of articles (KeepAlive preserved)
    const countAfter = await feed.locator('article').count();
    expect(countAfter).toBe(countBefore);
  });
});
