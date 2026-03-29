import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Protected Routes', () => {
  test('unauthenticated user on /notifications redirects to login', async ({ page }) => {
    await page.goto('/notifications');
    // Should redirect to login or show sign-in prompt
    await expect(
      page.getByRole('link', { name: /sign in/i })
        .or(page.getByText(/sign in/i).first()),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated user on /messages redirects to login', async ({ page }) => {
    await page.goto('/messages');
    await expect(
      page.getByRole('link', { name: /sign in/i })
        .or(page.getByText(/sign in/i).first()),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated user on /favourites redirects to login', async ({ page }) => {
    await page.goto('/favourites');
    await expect(
      page.getByRole('link', { name: /sign in/i })
        .or(page.getByText(/sign in/i).first()),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated user can browse /explore', async ({ page }) => {
    await page.goto('/explore');
    // Explore should be accessible without auth
    await expect(page.getByText('For you').first()).toBeAttached({ timeout: 10_000 });
  });

  test('unauthenticated user on profile redirects to login', async ({ page }) => {
    await page.goto('/@jane@mock.social');
    await expect(
      page.getByRole('link', { name: /sign in/i })
        .or(page.getByText(/sign in/i).first()),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('authenticated user sees feed on home', async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });
});
