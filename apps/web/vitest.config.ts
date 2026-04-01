import path from 'node:path';
import baseConfig from '@repo/config/vitest';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(baseConfig, defineConfig({
  test: {
    root: path.resolve(__dirname),
    include: ['app/composables/**/*.test.ts', 'app/stores/**/*.test.ts', 'server/**/__tests__/**/*.test.ts'],
    environment: 'happy-dom',
    environmentMatchGlobs: [
      ['server/**', 'node'],
    ],
  },
  esbuild: {
    tsconfigRaw: '{}',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
      '@capacitor/app': path.resolve(__dirname, 'test/__mocks__/@capacitor/app.ts'),
    },
  },
}));
