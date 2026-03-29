import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const appDir = fileURLToPath(new URL('..', import.meta.url));

/**
 * Playwright config for Fediway E2E tests.
 *
 * IMPORTANT: Tests run against a PRODUCTION BUILD (nuxt preview),
 * not the dev server. This ensures fast hydration and catches
 * production-only issues (code-splitting, env vars, tree-shaking).
 *
 * Local workflow:
 *   1. VITE_API_MODE=mock npx turbo run build --filter=@repo/web
 *   2. cd apps/web && npx nuxt preview --port 3000
 *   3. cd apps/web && npm run test:e2e
 *
 * CI workflow:
 *   Build happens in a prior step, Playwright starts preview automatically.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 30_000,

  reporter: isCI
    ? [['html', { open: 'never' }], ['github']]
    : 'list',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    contextOptions: {
      reducedMotion: 'reduce',
      permissions: ['clipboard-read', 'clipboard-write'],
    },
  },

  expect: {
    timeout: 10_000,
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

  // Serve the pre-built app. Build must happen BEFORE tests.
  // Locally: reuseExistingServer=true skips if preview is already running.
  // CI: starts fresh (reuseExistingServer=false).
  webServer: {
    command: 'npx nuxt preview --port 3000',
    url: 'http://localhost:3000',
    timeout: 30_000,
    reuseExistingServer: !isCI,
    cwd: appDir,
    stdout: isCI ? 'pipe' : 'ignore',
  },
});
