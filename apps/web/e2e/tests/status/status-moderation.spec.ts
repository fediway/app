import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Status Moderation', () => {
  test.describe('menu visibility', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    });

    test('own post shows delete, not mute/block/report', async ({ page }) => {
      // First post is by jane (own post)
      const moreBtn = page.getByLabel('More actions').first();
      await moreBtn.dispatchEvent('click');

      await expect(page.getByText('Delete post')).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Mute user')).not.toBeVisible();
      await expect(page.getByText('Block user')).not.toBeVisible();
      await expect(page.getByText('Report')).not.toBeVisible();
    });

    test('other user post shows mute/block/report, not delete', async ({ page }) => {
      // Second post is by alex (other user)
      const feed = page.locator('#main-content');
      const alexPost = feed.locator('article').nth(1);
      const moreBtn = alexPost.getByLabel('More actions');
      await moreBtn.dispatchEvent('click');

      await expect(page.getByText('Mute user')).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Block user')).toBeVisible();
      await expect(page.getByText('Report')).toBeVisible();
      await expect(page.getByText('Delete post')).not.toBeVisible();
    });

    test('remote user post shows block domain option', async ({ page }) => {
      // Last post is by bob@remote.social
      const feed = page.locator('#main-content');
      const remotePost = feed.locator('article').last();
      const moreBtn = remotePost.getByLabel('More actions');
      await moreBtn.dispatchEvent('click');

      await expect(page.getByText('Block domain')).toBeVisible({ timeout: 3000 });
    });

    test('local user post does not show block domain option', async ({ page }) => {
      // Second post is by alex@mock.social (same domain as jane)
      const feed = page.locator('#main-content');
      const alexPost = feed.locator('article').nth(1);
      const moreBtn = alexPost.getByLabel('More actions');
      await moreBtn.dispatchEvent('click');

      await expect(page.getByText('Mute user')).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Block domain')).not.toBeVisible();
    });
  });

  test.describe('mute action', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    });

    test('mute user from dropdown shows toast', async ({ page }) => {
      const feed = page.locator('#main-content');
      const alexPost = feed.locator('article').nth(1);
      await alexPost.getByLabel('More actions').click();

      await page.getByText('Mute user').click();

      await expect(
        page.getByRole('status').filter({ hasText: /muted/i }),
      ).toBeVisible({ timeout: 5000 });
    });

    test('mute calls correct API endpoint', async ({ page }) => {
      let muteCalled = false;
      await page.route(/\/api\/v1\/accounts\/\d+\/mute$/, async (route) => {
        muteCalled = true;
        await route.fulfill({
          json: { id: '2', muting: true, blocking: false, following: false },
        });
      });

      const feed = page.locator('#main-content');
      const alexPost = feed.locator('article').nth(1);
      await alexPost.getByLabel('More actions').click();
      await page.getByText('Mute user').click();

      await page.waitForTimeout(1000);
      expect(muteCalled).toBe(true);
    });
  });

  test.describe('block action', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    });

    test('block user from dropdown shows toast', async ({ page }) => {
      const feed = page.locator('#main-content');
      const alexPost = feed.locator('article').nth(1);
      await alexPost.getByLabel('More actions').click();

      await page.getByText('Block user').click();

      await expect(
        page.getByRole('status').filter({ hasText: /blocked/i }),
      ).toBeVisible({ timeout: 5000 });
    });

    test('block calls correct API endpoint', async ({ page }) => {
      let blockCalled = false;
      await page.route(/\/api\/v1\/accounts\/\d+\/block$/, async (route) => {
        blockCalled = true;
        await route.fulfill({
          json: { id: '2', blocking: true, muting: false, following: false },
        });
      });

      const feed = page.locator('#main-content');
      const alexPost = feed.locator('article').nth(1);
      await alexPost.getByLabel('More actions').click();
      await page.getByText('Block user').click();

      await page.waitForTimeout(1000);
      expect(blockCalled).toBe(true);
    });
  });

  test.describe('block domain action', () => {
    test('block domain from dropdown shows toast', async ({ page }) => {
      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

      const feed = page.locator('#main-content');
      const remotePost = feed.locator('article').last();
      await remotePost.getByLabel('More actions').click();

      await page.getByText('Block domain').click();

      await expect(
        page.getByRole('status').filter({ hasText: /blocked/i }),
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('report action', () => {
    test('report from dropdown shows toast', async ({ page }) => {
      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

      const feed = page.locator('#main-content');
      const alexPost = feed.locator('article').nth(1);
      await alexPost.getByLabel('More actions').click();

      await page.getByText('Report').click();

      await expect(
        page.getByRole('status').filter({ hasText: /report/i }),
      ).toBeVisible({ timeout: 5000 });
    });

    test('report calls correct API endpoint', async ({ page }) => {
      let reportCalled = false;
      await page.route(/\/api\/v1\/reports$/, async (route) => {
        reportCalled = true;
        await route.fulfill({
          json: { id: 'report-1', action_taken: false, category: 'other' },
        });
      });

      await loginWithMock(page);
      await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

      const feed = page.locator('#main-content');
      const alexPost = feed.locator('article').nth(1);
      await alexPost.getByLabel('More actions').click();
      await page.getByText('Report').click();

      await page.waitForTimeout(1000);
      expect(reportCalled).toBe(true);
    });
  });
});
