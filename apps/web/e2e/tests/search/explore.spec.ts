import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Explore', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('explore page loads trending tags', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.getByText('For you').first()).toBeAttached({ timeout: 5000 });

    // Should show trending tags
    await expect(page.getByText('#photography').or(page.getByText('photography')).first()).toBeAttached({ timeout: 5000 });
  });

  test('explore news tab shows links', async ({ page }) => {
    await page.goto('/explore/news');

    // Should show news/links
    await expect(page.getByText('News').first()).toBeAttached({ timeout: 5000 });
  });

  test('explore people tab shows accounts or loading', async ({ page }) => {
    await page.goto('/explore/people');

    // Should show skeleton loading, accounts, or empty state
    await expect(page.getByText('People').first()).toBeAttached({ timeout: 5000 });
  });

  test('clicking a trending tag navigates to tag feed', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.getByText('For you').first()).toBeAttached({ timeout: 5000 });

    // Click a tag — use dispatchEvent for content-visibility hidden elements
    const tagLink = page.getByText('#photography').or(page.getByText('photography')).first();
    await tagLink.dispatchEvent('click');

    await expect(page).toHaveURL(/\/tags\//, { timeout: 5000 });
  });

  test('search from explore navigates to search page', async ({ page }) => {
    await page.goto('/explore');

    const searchInput = page.getByPlaceholder('Search...').last();
    await searchInput.fill('test');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/\/search\?q=test/, { timeout: 5000 });
  });
});
