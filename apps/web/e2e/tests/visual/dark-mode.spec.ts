import { expect, test } from '../../helpers/base';

test.describe('Dark Mode', () => {
  test('dark mode applies dark class to html', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(true);

    // Content should still render
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('light mode has no dark class', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(hasDarkClass).toBe(false);
  });
});
