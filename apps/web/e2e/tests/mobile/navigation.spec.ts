import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('bottom nav is visible and has all tabs', async ({ page }) => {
    const bottomNav = page.locator('nav[aria-label="Tab navigation"]');
    await expect(bottomNav).toBeVisible({ timeout: 5000 });

    // Should have Home and Search tabs in the bottom nav
    await expect(bottomNav.getByText('Home')).toBeVisible();
    await expect(bottomNav.getByText('Search')).toBeVisible();
  });

  test('tapping Search tab navigates to search page', async ({ page }) => {
    const bottomNav = page.locator('nav[aria-label="Tab navigation"]');
    await bottomNav.getByText('Search').click();
    await expect(page).toHaveURL(/\/search/, { timeout: 5000 });
  });

  test('tapping Home tab returns to feed', async ({ page }) => {
    const bottomNav = page.locator('nav[aria-label="Tab navigation"]');

    // Navigate away first
    await bottomNav.getByText('Search').click();
    await expect(page).toHaveURL(/\/search/, { timeout: 5000 });

    // Tap Home
    await bottomNav.getByText('Home').click();
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 5000 });
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('mobile header shows back button on detail pages', async ({ page }) => {
    // Navigate to a status detail
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });

    // Back button should be visible
    await expect(page.getByLabel(/back/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('back button returns to previous page', async ({ page }) => {
    // Navigate to status detail
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });

    // Click back
    await page.getByLabel(/back/i).first().click();

    // Should return to home feed
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 5000 });
  });

  test('desktop sidebar is NOT visible on mobile', async ({ page }) => {
    await expect(page.locator('nav[aria-label="Main navigation"]')).not.toBeVisible();
  });
});
