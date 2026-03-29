import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile Compose', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('new post button opens compose modal', async ({ page }) => {
    await page.getByLabel('New Post').click();

    // Compose modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('compose modal has text input and post button', async ({ page }) => {
    await page.getByLabel('New Post').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Should have text area and post button
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /post/i })).toBeVisible();
  });
});
