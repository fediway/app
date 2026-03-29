import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Delete Post', () => {
  test.describe('home feed', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    });

    test('deleting a post removes it from the feed', async ({ page }) => {
      // Count articles in the desktop main content (avoids double-counting mobile layout)
      const feed = page.locator('#main-content');
      const countBefore = await feed.locator('article').count();

      // Delete first post (own post by jane)
      const moreBtn = page.getByLabel('More actions').first();
      await moreBtn.dispatchEvent('click');
      const deleteItem = page.getByText('Delete post');
      await expect(deleteItem).toBeVisible({ timeout: 3000 });
      await deleteItem.click();

      // Toast should appear
      await expect(page.getByRole('status').filter({ hasText: 'Post deleted' })).toBeVisible({ timeout: 5000 });

      // Post should be removed from the feed
      await expect(feed.locator('article')).toHaveCount(countBefore - 1, { timeout: 3000 });
    });

    test('undo restores the deleted post back to the feed', async ({ page }) => {
      const feed = page.locator('#main-content');
      const countBefore = await feed.locator('article').count();

      // Delete
      const moreBtn = page.getByLabel('More actions').first();
      await moreBtn.dispatchEvent('click');
      await page.getByText('Delete post').click();

      // Post removed
      await expect(feed.locator('article')).toHaveCount(countBefore - 1, { timeout: 3000 });

      // Undo
      await page.getByRole('status').getByText('Undo').click();

      // Post restored
      await expect(feed.locator('article')).toHaveCount(countBefore, { timeout: 3000 });
    });

    test('delete shows undo toast on own post', async ({ page }) => {
      const moreBtn = page.getByLabel('More actions').first();
      await moreBtn.dispatchEvent('click');

      const deleteItem = page.getByText('Delete post');
      await expect(deleteItem).toBeVisible({ timeout: 3000 });
      await deleteItem.click();

      const toast = page.getByRole('status').filter({ hasText: 'Post deleted' });
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast.getByText('Undo')).toBeVisible();
    });

    test('delete undo restores the post', async ({ page }) => {
      const moreBtn = page.getByLabel('More actions').first();
      await moreBtn.dispatchEvent('click');
      const deleteItem = page.getByText('Delete post');
      await expect(deleteItem).toBeVisible({ timeout: 3000 });
      await deleteItem.click();

      const undoBtn = page.getByRole('status').getByText('Undo');
      await expect(undoBtn).toBeVisible({ timeout: 5000 });
      await undoBtn.click();

      await expect(page.getByRole('status').filter({ hasText: 'Post deleted' })).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('status detail', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
      // Navigate to own post detail (first post is by jane)
      await page.locator('article').first().dispatchEvent('click');
      await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });
    });

    test('own post shows delete in more menu on detail page', async ({ page }) => {
      // Target the main status actions specifically (not descendant statuses)
      const detailActions = page.getByTestId('detail-actions').last();
      const moreBtn = detailActions.getByLabel('More actions');
      await moreBtn.click();

      await expect(page.getByText('Delete post')).toBeVisible({ timeout: 5000 });
    });

    test('delete from detail page shows undo toast', async ({ page }) => {
      const detailActions = page.getByTestId('detail-actions').last();
      const moreBtn = detailActions.getByLabel('More actions');
      await moreBtn.click();
      await page.getByText('Delete post').click();

      const toast = page.getByRole('status').filter({ hasText: 'Post deleted' });
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast.getByText('Undo')).toBeVisible();
    });

    test('deleting the focused post on detail page navigates away', async ({ page }) => {
      // Delete via the main status actions
      const detailActions = page.getByTestId('detail-actions').last();
      await detailActions.getByLabel('More actions').click();
      await page.getByText('Delete post').click();

      // Should show undo toast
      await expect(page.getByRole('status').filter({ hasText: 'Post deleted' })).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('profile page', () => {
    test('own posts on profile show delete option', async ({ page }) => {
      await loginWithMock(page);
      await page.goto('/@jane@mock.social');
      await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

      // Wait for posts to load in profile feed
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

      // Open More menu on a post in the profile feed
      const moreBtn = page.getByLabel('More actions').first();
      await moreBtn.dispatchEvent('click');

      // Should show Delete post (own post on own profile)
      await expect(page.getByText('Delete post')).toBeVisible({ timeout: 3000 });
    });
  });
});
