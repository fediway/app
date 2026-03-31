import { loginWithMock } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

test.describe('Compose Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMock(page);
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });
  });

  test('composer shows character counter while typing', async ({ page }) => {
    // Open composer via desktop sidebar "New Post" button
    await page.getByText('New Post').last().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Type some content
    const textbox = page.getByRole('textbox').first();
    await textbox.fill('Hello world');

    // Character counter should be visible
    await expect(page.getByText(/\d.*characters/i).or(page.getByText(/489/)).first()).toBeAttached({ timeout: 3000 });
  });

  test('composer shows reply context when replying', async ({ page }) => {
    // Navigate to status detail
    await page.locator('article').first().dispatchEvent('click');
    await expect(page).toHaveURL(/\/@.*\/\d+/, { timeout: 10_000 });

    // Click reply button on the main status
    const detailActions = page.getByTestId('detail-actions').last();
    await detailActions.getByLabel(/reply/i).click();

    // Composer should open with reply context
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/replying to/i).first()).toBeVisible({ timeout: 3000 });
  });

  test('composer can change visibility', async ({ page }) => {
    await page.getByText('New Post').last().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Visibility selector should be present
    await expect(page.getByText('Public').or(page.getByLabel(/visibility/i)).first()).toBeAttached({ timeout: 3000 });
  });

  test('posting clears the composer', async ({ page }) => {
    await page.getByText('New Post').last().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    const textbox = page.getByRole('textbox').first();
    await textbox.fill('Test post content');

    // Click post button
    await page.getByRole('button', { name: /post/i }).click();

    // Dialog should close
    await expect(page.locator('[role="dialog"][data-state="open"]')).toHaveCount(0, { timeout: 5000 });
  });

  test('cancel with content shows discard confirmation', async ({ page }) => {
    await page.getByText('New Post').last().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    const textbox = page.getByRole('textbox').first();
    await textbox.fill('Draft that should not post');

    // Cancel — should show discard confirmation
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByText(/discard/i).first()).toBeVisible({ timeout: 3000 });

    // Confirm discard
    await page.getByRole('button', { name: /discard/i }).click();

    // All dialogs should close
    await expect(page.locator('[role="dialog"][data-state="open"]')).toHaveCount(0, { timeout: 5000 });
  });
});
