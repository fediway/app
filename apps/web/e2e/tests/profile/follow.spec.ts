import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Follow', () => {
  test('can see follow button on profile', async ({ page }) => {
    // Intercept follow API
    await page.route(/\/api\/v1\/accounts\/\d+\/follow$/, async (route) => {
      await route.fulfill({
        json: {
          id: '1',
          following: true,
          followedBy: false,
          blocking: false,
          muting: false,
          requested: false,
        },
      });
    });

    await loginWithMock(page);

    // Navigate to profile
    await page.goto('/@jane@mock.social');
    await expect(page.getByText('Jane Doe').first()).toBeAttached({ timeout: 10_000 });

    // Follow button should be visible (may say Follow or Following depending on relationship mock)
    await expect(
      page.getByRole('button', { name: /follow/i }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
