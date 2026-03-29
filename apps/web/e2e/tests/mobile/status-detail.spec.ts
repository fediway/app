import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile Status Detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    // Navigate to status detail
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });
  });

  test('status detail shows post content', async ({ page }) => {
    await expect(page.locator('article').first()).toBeAttached({ timeout: 5000 });
  });

  test('quick reply opens compose modal on mobile', async ({ page }) => {
    // Scope to main content to avoid dual-layout strict mode
    const main = page.locator('#main-content');
    const trigger = main.getByTestId('quick-reply-trigger');
    await expect(trigger).toBeAttached({ timeout: 10_000 });
    await trigger.dispatchEvent('click');

    // Should open full compose modal (not inline expansion)
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('action buttons are present on detail page', async ({ page }) => {
    await expect(page.getByLabel(/like/i).first()).toBeAttached({ timeout: 5000 });
    await expect(page.getByLabel(/reply/i).first()).toBeAttached({ timeout: 5000 });
  });
});
