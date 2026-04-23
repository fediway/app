import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Follow button never renders for current user', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('search results — own account row has no Follow button', async ({ page }) => {
    await page.goto('/search?q=jane');

    const ownProfileLink = page.locator('a[href="/@jane"]').first();
    await expect(ownProfileLink).toBeAttached({ timeout: 10_000 });

    const followButtonInOwnRow = ownProfileLink.getByRole('button', { name: /follow/i });
    await expect(followButtonInOwnRow).toHaveCount(0);
  });

  test('explore/people — own account row has no Follow button', async ({ page }) => {
    await page.goto('/explore/people');
    await expect(page.getByRole('button', { name: /follow/i }).first()).toBeAttached({ timeout: 10_000 });

    // The row containing Jane's @jane handle should not contain a Follow button.
    const ownRow = page.locator('div').filter({ hasText: '@jane' }).filter({ hasText: 'Jane Doe' }).last();
    await expect(ownRow.getByRole('button', { name: /^follow$/i })).toHaveCount(0);
  });
});
