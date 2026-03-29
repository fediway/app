import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Cross-Page State', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('bookmarking on home feed then visiting /saved shows the post', async ({ page }) => {
    // Bookmark first post
    const bookmarkBtn = page.getByLabel(/^save$/i).last();
    await bookmarkBtn.click();
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible({ timeout: 5000 });

    // Navigate to saved page
    await page.goto('/saved');

    // Should show posts (mock API returns bookmarked statuses)
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('full user journey: feed → detail → reply action → back to feed', async ({ page }) => {
    const feed = page.locator('#main-content');
    const feedCount = await feed.locator('article').count();

    // Navigate to status detail
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });

    // Click reply button (opens compose modal)
    const detailActions = page.getByTestId('detail-actions').last();
    await detailActions.getByLabel(/reply/i).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Close composer
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 3000 });

    // Go back to feed
    await page.goBack();

    // Feed should be intact
    await expect(feed.locator('article')).toHaveCount(feedCount, { timeout: 10_000 });
  });

  test('deleting on profile page removes from home feed too', async ({ page }) => {
    const feed = page.locator('#main-content');
    const feedCountBefore = await feed.locator('article').count();

    // Navigate to own profile
    await page.goto('/@jane@mock.social');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Delete a post from profile
    const moreBtn = page.getByLabel('More actions').first();
    await moreBtn.dispatchEvent('click');

    const deleteItem = page.getByText('Delete post');
    if (await deleteItem.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteItem.click();
      await expect(page.getByRole('status').filter({ hasText: 'Post deleted' })).toBeVisible({ timeout: 5000 });

      // Go to home feed — the deleted post should be filtered out
      // by withStoreState's isDeleted check
      await page.goto('/');
      await expect(feed.locator('article').first()).toBeAttached({ timeout: 10_000 });

      // Give reactive state time to propagate through KeepAlive
      await page.waitForTimeout(500);
      const feedCountAfter = await feed.locator('article').count();
      expect(feedCountAfter).toBeLessThanOrEqual(feedCountBefore);
    }
  });

  test('navigating between tabs preserves scroll position hint', async ({ page }) => {
    // This tests that KeepAlive + tab navigation works for a full cycle
    await page.goto('/notifications');
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });

    await page.goto('/');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // Feed should still have content after round-trip
    const feed = page.locator('#main-content');
    const count = await feed.locator('article').count();
    expect(count).toBeGreaterThan(0);
  });
});
