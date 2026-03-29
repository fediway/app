import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

// iPhone-sized viewport
test.use({ viewport: { width: 390, height: 844 } });

test.describe('Quick Reply (Mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    // Navigate to status detail
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+|\/status\//, { timeout: 10_000 });
  });

  // Mobile layout has both hidden desktop + visible mobile copies in DOM.
  // Scope to #main-content to get the mobile instance.
  // Use toBeAttached/dispatchEvent due to content-visibility: auto.
  const mainContent = '#main-content';

  test('quick reply pill is visible on mobile', async ({ page }) => {
    await expect(page.locator(mainContent).getByTestId('quick-reply-trigger')).toBeAttached({ timeout: 10_000 });
  });

  test('tapping pill opens full compose modal instead of inline expansion', async ({ page }) => {
    const trigger = page.locator(mainContent).getByTestId('quick-reply-trigger');
    await expect(trigger).toBeAttached({ timeout: 10_000 });
    await trigger.dispatchEvent('click');

    // Should open the full compose modal (not inline expansion)
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Write a reply')).toBeVisible();

    // Inline expansion should NOT be present — no quick-reply submit button
    await expect(page.getByTestId('quick-reply-submit')).not.toBeVisible();
  });
});
