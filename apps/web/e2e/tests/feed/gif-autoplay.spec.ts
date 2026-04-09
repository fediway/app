import { Buffer } from 'node:buffer';
import { injectAuthState } from '../../helpers/auth';
import { expect, test } from '../../helpers/base';

const main = '#main-content';

const TINY_MP4 = Buffer.from(
  'AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAA'
  + 'ABtZGF0AAAAMmWIhD///8PAnFAAFDBgAABSgABBi0eAApLDAoLMgQEBA'
  + 'KCgAAACGaAB4ABAAAAwBs',
  'base64',
);

test.describe('GIF Autoplay', () => {
  test('GIF has correct autoplay attributes when enabled', async ({ page }) => {
    // Intercept the mock video URL with a real tiny MP4
    await page.route('**/animation.mp4', route =>
      route.fulfill({ body: TINY_MP4, contentType: 'video/mp4' }));

    await injectAuthState(page);
    await page.goto('/');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    await page.locator(main).getByText('Check out this GIF!').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    const video = page.locator(`${main} video`).first();
    await expect(video).toBeAttached({ timeout: 5000 });

    const state = await video.evaluate((el: HTMLVideoElement) => ({
      autoplay: el.autoplay,
      muted: el.muted,
      loop: el.loop,
      paused: el.paused,
      readyState: el.readyState,
    }));

    expect(state.autoplay).toBe(true);
    expect(state.muted).toBe(true);
    expect(state.loop).toBe(true);
  });

  test('GIF does NOT have autoplay when disabled in settings', async ({ page }) => {
    await page.route('**/animation.mp4', route =>
      route.fulfill({ body: TINY_MP4, contentType: 'video/mp4' }));

    await injectAuthState(page);
    await page.addInitScript(() => {
      localStorage.setItem('fediway-settings', JSON.stringify({
        privacy: { defaultVisibility: 'public', sensitiveMedia: false },
        media: { mediaVisibility: 'default', autoplayGifs: false, reduceMotion: false },
      }));
    });

    await page.goto('/');
    await expect(page.locator('article').first()).toBeAttached({ timeout: 10_000 });

    await page.locator(main).getByText('Check out this GIF!').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const video = page.locator(`${main} video`).first();
    await expect(video).toBeAttached({ timeout: 5000 });

    const state = await video.evaluate((el: HTMLVideoElement) => ({
      autoplay: el.autoplay,
      paused: el.paused,
    }));

    expect(state.autoplay).toBe(false);
    expect(state.paused).toBe(true);
  });
});
