import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Error & Empty States', () => {
  test('shows error state when API fails', async ({ page }) => {
    await loginWithMock(page);

    // Intercept timeline API to return 500
    await page.route('**/api/v1/timelines/home*', route =>
      route.fulfill({ status: 500, body: '{"error":"Internal Server Error"}' }));

    // Navigate to trigger fetch
    await page.goto('/favourites');

    // Should show error or empty state, not crash
    await expect(
      page.getByText(/failed|error|try again/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('empty notifications shows helpful message', async ({ page }) => {
    await loginWithMock(page);

    // Intercept notifications to return empty
    await page.route('**/api/v1/notifications*', route =>
      route.fulfill({ json: [] }));

    await page.goto('/notifications');

    // Should show empty state
    await expect(
      page.getByText(/no.*notification/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
