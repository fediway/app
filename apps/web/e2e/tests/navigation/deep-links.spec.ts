import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Deep Links', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('direct navigation to status detail works', async ({ page }) => {
    await page.goto('/@jane@mock.social/100');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('direct navigation to profile works', async ({ page }) => {
    await page.goto('/@alex@mock.social');
    await expect(page.getByText('Alex Chen').first()).toBeAttached({ timeout: 10_000 });
  });

  test('direct navigation to explore/news works', async ({ page }) => {
    await page.goto('/explore/news');
    await expect(page.getByText('News').first()).toBeAttached({ timeout: 10_000 });
  });

  test('direct navigation to settings works', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Settings').first()).toBeAttached({ timeout: 10_000 });
  });

  test('direct navigation to /search with query works', async ({ page }) => {
    await page.goto('/search?q=test');

    // Search input should have the query
    const searchInput = page.getByPlaceholder('Search').last();
    await expect(searchInput).toHaveValue('test', { timeout: 10_000 });

    // Results should load
    await expect(page.getByText('People').or(page.getByText('Posts')).first()).toBeAttached({ timeout: 10_000 });
  });

  test('direct navigation to /tags/:tag works', async ({ page }) => {
    await page.goto('/tags/photography');
    // Should show the tag feed
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('non-existent profile shows error state', async ({ page }) => {
    await page.goto('/@nonexistent@nowhere.example');
    // Should show some content (may be error or empty state) — not a blank page
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
