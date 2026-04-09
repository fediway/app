import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Quick Reply (Mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });
  });

  test('mobile reply bar is visible on status detail', async ({ page }) => {
    await expect(page.getByText(/reply to @/i)).toBeAttached({ timeout: 10_000 });
  });

  test('tapping reply bar opens compose modal', async ({ page }) => {
    const replyBar = page.getByText(/reply to @/i);
    await expect(replyBar).toBeAttached({ timeout: 10_000 });
    await replyBar.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });
});
