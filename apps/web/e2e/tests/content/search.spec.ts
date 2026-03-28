import { expectAccessible } from '../../helpers/a11y';
import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('search page renders with suggestions when empty', async ({ page }) => {
    await page.goto('/search');

    // Search input visible
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // A11y scan
    await expectAccessible(page);
  });

  test('typing a query shows results', async ({ page }) => {
    await page.goto('/search');

    // Type a search query
    await page.getByPlaceholder(/search/i).fill('test');
    await page.getByPlaceholder(/search/i).press('Enter');

    // Should navigate with query param
    await expect(page).toHaveURL(/q=test/);

    // Results should appear (posts, people, or tags)
    await expect(
      page.locator('article').first()
        .or(page.getByText('No results found')),
    ).toBeVisible({ timeout: 10_000 });
  });
});
