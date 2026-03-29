import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Status Actions Menu', () => {
  test.describe('on status detail page', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
      await page.locator('article').first().dispatchEvent('click');
      await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });
    });

    test('copy link shows Copied toast', async ({ page }) => {
      const detailActions = page.getByTestId('detail-actions').last();
      await detailActions.getByLabel('More actions').click();
      await page.getByText('Copy link').click();

      await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toBeVisible({ timeout: 5000 });
    });

    test('send as message opens modal', async ({ page }) => {
      const detailActions = page.getByTestId('detail-actions').last();
      await detailActions.getByLabel('More actions').click();
      await page.getByText('Send as message').click();

      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    });

    test('own post menu shows delete option', async ({ page }) => {
      const detailActions = page.getByTestId('detail-actions').last();
      await detailActions.getByLabel('More actions').click();

      await expect(page.getByText('Delete post')).toBeVisible({ timeout: 3000 });
      // Should NOT show mute/block for own post
      await expect(page.getByText('Mute user')).not.toBeVisible();
    });

    test('other user post menu shows mute/block/report', async ({ page }) => {
      // The descendant status is by alex (not own post)
      const feed = page.locator('#main-content');
      await expect(feed.locator('article')).toHaveCount(2, { timeout: 10_000 });

      // Get the descendant's More button (second article's actions)
      const descendantMoreBtns = feed.locator('article').last().getByLabel('More actions');
      await descendantMoreBtns.click();

      await expect(page.getByText('Mute user')).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Block user')).toBeVisible();
      await expect(page.getByText('Report')).toBeVisible();
      // Should NOT show delete for other user's post
      await expect(page.getByText('Delete post')).not.toBeVisible();
    });

    test('menu closes after selecting an action', async ({ page }) => {
      const detailActions = page.getByTestId('detail-actions').last();
      await detailActions.getByLabel('More actions').click();

      // Menu should be open
      await expect(page.getByText('Copy link')).toBeVisible({ timeout: 3000 });

      // Click an action
      await page.getByText('Copy link').click();

      // Menu should close
      await expect(page.getByText('Send as message')).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('on home feed', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    });

    test('copy link from feed more menu shows toast', async ({ page }) => {
      // Open More menu on first post
      const moreBtn = page.getByLabel('More actions').first();
      await moreBtn.dispatchEvent('click');

      await expect(page.getByText('Copy link')).toBeVisible({ timeout: 3000 });
      await page.getByText('Copy link').click();

      await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toBeVisible({ timeout: 5000 });
    });

    test('copy link does not navigate away from feed', async ({ page }) => {
      const startUrl = page.url();

      const moreBtn = page.getByLabel('More actions').first();
      await moreBtn.dispatchEvent('click');
      await page.getByText('Copy link').click();

      await page.waitForTimeout(500);
      expect(page.url()).toBe(startUrl);
    });

    test('bookmark from feed shows Saved toast with View action', async ({ page }) => {
      const bookmarkBtn = page.getByLabel(/^save$/i).last();
      await bookmarkBtn.click();

      const toast = page.getByRole('status').filter({ hasText: 'Saved' });
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast.getByText('View')).toBeVisible();
    });
  });

  test.describe('on profile page (via StatusTimeline)', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithMock(page);
      await page.goto('/@jane@mock.social');
      await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    });

    test('copy link from profile feed shows Copied toast', async ({ page }) => {
      const moreBtn = page.getByLabel('More actions').first();
      await moreBtn.dispatchEvent('click');

      await expect(page.getByText('Copy link')).toBeVisible({ timeout: 3000 });
      await page.getByText('Copy link').click();

      await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toBeVisible({ timeout: 5000 });
    });
  });
});
