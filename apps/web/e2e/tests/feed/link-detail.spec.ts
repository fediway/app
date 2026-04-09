import { injectAuthState } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Link Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthState(page);
  });

  test('shows link data when navigating from sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    const trendingLink = page.getByRole('link', { name: /Scientists discover breakthrough/ });
    await expect(trendingLink).toBeAttached({ timeout: 10_000 });
    await trendingLink.click();

    await expect(page).toHaveURL(/\/links\//, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: /Scientists discover/ })).toBeAttached({ timeout: 10_000 });
  });

  test('shows link data on direct page load', async ({ page }) => {
    await page.goto(`/links/${encodeURIComponent('https://example.com/article-1')}`);

    await expect(page.getByRole('heading', { name: /Scientists discover/ })).toBeAttached({ timeout: 10_000 });
  });
});
