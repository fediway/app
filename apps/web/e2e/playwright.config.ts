import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [['html', { open: 'never' }], ['github']]
    : 'list',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // SPA: don't wait for 'load' — the app hydrates client-side and may redirect
    navigationTimeout: 15_000,
    actionTimeout: 10_000,
    launchOptions: {
      // Slower CI machines need more time
      slowMo: isCI ? 50 : 0,
    },
    // Disable animations for deterministic assertions and screenshots
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: 'disabled',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
    {
      name: 'mobile',
      use: devices['iPhone 15'],
    },
  ],

  // Start the dev server before tests
  // In CI, start the dev server automatically.
  // Locally, run `npm run dev:web:mock` in a separate terminal.
  ...(isCI
    ? {
        webServer: {
          command: 'VITE_API_MODE=mock npx nuxt dev --port 3333',
          url: 'http://localhost:3000',
          timeout: 120_000,
          cwd: fileURLToPath(new URL('..', import.meta.url)),
          stdout: 'pipe',
        },
      }
    : {}),
});
