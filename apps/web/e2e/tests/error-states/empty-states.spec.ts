import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Page Loading', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('favourites page loads with content', async ({ page }) => {
    await page.goto('/favourites');
    await expect(page).toHaveURL('/favourites');
    // Should show mock favourites (articles) or empty state
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('notifications page loads with content', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL('/notifications');
    // Should show mock notifications
    await expect(page.getByText(/favourited|boosted|followed/i).first()).toBeAttached({ timeout: 10_000 });
  });

  test('bookmarks page loads with content', async ({ page }) => {
    await page.goto('/saved');
    await expect(page).toHaveURL('/saved');
    // Should show mock bookmarks (articles) or empty state
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });
});
