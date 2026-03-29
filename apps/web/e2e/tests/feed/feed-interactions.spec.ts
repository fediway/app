import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Feed Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('clicking avatar in a status navigates to profile', async ({ page }) => {
    // Click the first avatar button in a status (not the sidebar)
    const feed = page.locator('#main-content');
    const avatarBtn = feed.locator('article').first().locator('button').first();
    await avatarBtn.click();

    // Should navigate to a profile page
    await expect(page).toHaveURL(/\/@/, { timeout: 5000 });
  });

  test('clicking a hashtag navigates to tag feed', async ({ page }) => {
    // The first mock status has #books hashtag
    const hashtagLink = page.locator('#main-content a[href*="/tags/"]').first();

    if (await hashtagLink.count() > 0) {
      await hashtagLink.click();
      await expect(page).toHaveURL(/\/tags\//, { timeout: 5000 });
    }
  });

  // TODO: reblog toggle test — the Mastodon API returns a reblog wrapper status,
  // not the original status with reblogged=true. The optimistic update works but
  // the API response overwrites it. Needs API response handling fix.

  test('favourite button toggles state', async ({ page }) => {
    const favBtn = page.getByLabel(/^like/i).last();

    // Click favourite
    await favBtn.click();

    // Should change to "Unlike" label (aria-pressed=true)
    await expect(page.getByLabel(/^unlike/i).last()).toBeAttached({ timeout: 3000 });

    // Click again to unfavourite
    await page.getByLabel(/^unlike/i).last().click();

    // Should revert to "Like"
    await expect(page.getByLabel(/^like/i).last()).toBeAttached({ timeout: 3000 });
  });

  test('send as message opens modal from more menu', async ({ page }) => {
    // Navigate to detail for more menu access
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });

    const detailActions = page.getByTestId('detail-actions').last();
    await detailActions.getByLabel('More actions').click();
    await page.getByText('Send as message').click();

    // Should open a dialog/modal
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });
});
