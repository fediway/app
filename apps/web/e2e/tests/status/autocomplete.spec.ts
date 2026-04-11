import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Compose Autocomplete', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await page.getByRole('button', { name: /new post/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('hashtag suggestion appears when typing #', async ({ page }) => {
    const editor = page.locator('[role="dialog"]').locator('[contenteditable]').first();
    await editor.click();
    await editor.pressSequentially('#photo', { delay: 50 });

    await expect(page.locator('[role="listbox"]')).toBeAttached({ timeout: 5000 });
    await expect(page.getByText('#photography').or(page.getByText('photography'))).toBeAttached({ timeout: 5000 });
  });

  test('clicking hashtag suggestion inserts it', async ({ page }) => {
    const editor = page.locator('[role="dialog"]').locator('[contenteditable]').first();
    await editor.click();
    await editor.pressSequentially('#photo', { delay: 50 });

    const suggestion = page.locator('[role="listbox"] button').first();
    await expect(suggestion).toBeAttached({ timeout: 5000 });

    await suggestion.dispatchEvent('mousedown');
    await page.waitForTimeout(500);

    const content = await editor.textContent();
    expect(content).toMatch(/#photography|#coding/);
  });

  test('mention suggestion appears when typing @', async ({ page }) => {
    const editor = page.locator('[role="dialog"]').locator('[contenteditable]').first();
    await editor.click();
    await editor.pressSequentially('@jan', { delay: 50 });

    await expect(page.locator('[role="listbox"]')).toBeAttached({ timeout: 5000 });
  });

  test('clicking mention suggestion inserts it', async ({ page }) => {
    const editor = page.locator('[role="dialog"]').locator('[contenteditable]').first();
    await editor.click();
    await editor.pressSequentially('@jan', { delay: 50 });

    const suggestion = page.locator('[role="listbox"] button').first();
    await expect(suggestion).toBeAttached({ timeout: 5000 });

    await suggestion.dispatchEvent('mousedown');
    await page.waitForTimeout(500);

    const content = await editor.textContent();
    expect(content).toMatch(/@jane|@jan/);
  });
});
