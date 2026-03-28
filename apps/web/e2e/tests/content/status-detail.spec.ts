import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Status Detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('clicking a post opens thread view', async ({ page }) => {
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    // dispatchEvent bypasses content-visibility: auto visibility check
    await page.locator('article').first().dispatchEvent('click');

    // Should navigate to status detail
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });

    // Thread content should render
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('can navigate back from thread to feed', async ({ page }) => {
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });

    // Go back
    await page.goBack();

    // Feed should be available
    await expect(page.locator('article').first()).toBeAttached({ timeout: 5000 });
  });
});
