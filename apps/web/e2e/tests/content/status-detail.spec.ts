import { expectAccessible } from '../../helpers/a11y';
import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Status Detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('clicking a post opens thread view', async ({ page }) => {
    // Wait for feed
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });

    // Click first post
    await page.locator('article').first().click();

    // Should navigate to status detail
    await expect(page).toHaveURL(/\/status\//);

    // Thread content should render
    await expect(page.locator('article').first()).toBeVisible();

    // A11y scan
    await expectAccessible(page);
  });

  test('can navigate back from thread to feed', async ({ page }) => {
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });

    // Click post
    await page.locator('article').first().click();
    await expect(page).toHaveURL(/\/status\//);

    // Go back
    await page.goBack();

    // Feed should be visible (KeepAlive)
    await expect(page.locator('article').first()).toBeVisible({ timeout: 2000 });
  });
});
