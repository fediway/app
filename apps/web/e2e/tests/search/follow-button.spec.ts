import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Follow button click isolation', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
  });

  test('clicking Follow on search results does not navigate to profile', async ({ page }) => {
    await page.goto('/search?q=test');

    // Wait for account results to render with Follow buttons
    const followButton = page.getByRole('button', { name: /follow/i }).first();
    await expect(followButton).toBeAttached({ timeout: 10_000 });

    // Record current URL before clicking
    const urlBefore = page.url();

    await followButton.click();

    // Should stay on search page — not navigate to a profile
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/search');
    expect(page.url()).toBe(urlBefore);
  });

  test('clicking Follow on explore people does not navigate to profile', async ({ page }) => {
    await page.goto('/explore/people');

    // Wait for account list with Follow buttons
    const followButton = page.getByRole('button', { name: /follow/i }).first();
    await expect(followButton).toBeAttached({ timeout: 10_000 });

    const urlBefore = page.url();

    await followButton.click();

    // Should stay on explore people — not navigate to a profile
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/explore/people');
    expect(page.url()).toBe(urlBefore);
  });
});
