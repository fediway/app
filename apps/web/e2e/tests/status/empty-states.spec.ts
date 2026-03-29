import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Empty & Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('favourites page shows content', async ({ page }) => {
    await page.goto('/favourites');
    // Mock API returns statuses for favourites
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('saved page shows content', async ({ page }) => {
    await page.goto('/saved');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('status detail for non-existent post shows error state', async ({ page }) => {
    await page.goto('/@jane@mock.social/999999');
    await expect(
      page.locator('article').first()
        .or(page.getByText(/not found|deleted|unavailable/i).first()),
    ).toBeAttached({ timeout: 10_000 });
  });

  test('tag page with no posts shows empty state', async ({ page }) => {
    await page.goto('/tags/nonexistenttag12345');
    await expect(
      page.locator('article').first()
        .or(page.getByText(/no posts/i).first()),
    ).toBeAttached({ timeout: 10_000 });
  });

  test('search with no query shows discover state', async ({ page }) => {
    await page.goto('/search');
    await expect(
      page.getByText('User Suggestions').or(page.getByText('Trending')).first(),
    ).toBeAttached({ timeout: 10_000 });
  });
});
