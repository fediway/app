import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile Explore', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('search page renders with input', async ({ page }) => {
    const bottomNav = page.locator('nav[aria-label="Tab navigation"]');
    await bottomNav.getByText('Search').click();
    await expect(page).toHaveURL(/\/search/, { timeout: 5000 });

    // Use first() — mobile copy is first in DOM and attached
    await expect(page.getByPlaceholder('Search').first()).toBeAttached({ timeout: 5000 });
  });

  test('can type in search and see results', async ({ page }) => {
    const bottomNav = page.locator('nav[aria-label="Tab navigation"]');
    await bottomNav.getByText('Search').click();
    await expect(page).toHaveURL(/\/search/, { timeout: 5000 });

    // Fill the first (mobile) search input
    const searchInput = page.getByPlaceholder('Search').first();
    await searchInput.dispatchEvent('focus');
    await searchInput.fill('test');
    await page.keyboard.press('Enter');

    await expect(page.getByText('People').or(page.getByText('Posts')).first()).toBeAttached({ timeout: 10_000 });
  });

  test('explore page tabs work', async ({ page }) => {
    await page.goto('/explore');

    // Use first() to target the mobile layout copy
    await expect(page.getByText('For you').first()).toBeAttached({ timeout: 5000 });
    await expect(page.getByText('News').first()).toBeAttached({ timeout: 5000 });

    // Click News tab — dispatchEvent since content-visibility may hide it
    await page.getByText('News').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/explore\/news/, { timeout: 5000 });

    await page.getByText('Tags').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/explore\/tags/, { timeout: 5000 });
  });
});
