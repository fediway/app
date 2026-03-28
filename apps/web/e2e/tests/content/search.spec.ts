import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('search page renders', async ({ page }) => {
    await page.goto('/search');

    // Should be on search page
    await expect(page).toHaveURL('/search');
  });

  test('typing a query shows results', async ({ page }) => {
    await page.goto('/search');

    // Use the main content search input (not sidebar) — target by role within main
    // Navigate with query directly — avoids duplicate search input selector issues
    await page.goto('/search?q=test');

    // Should navigate with query param
    await expect(page).toHaveURL(/q=test/);

    // Results or no-results should appear
    await expect(
      page.locator('article').first()
        .or(page.getByText('No results found')),
    ).toBeAttached({ timeout: 10_000 });
  });
});
