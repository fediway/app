import path from 'node:path';
import baseConfig from '@repo/config/vitest';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(baseConfig, defineConfig({
  test: {
    root: path.resolve(__dirname),
    include: ['app/composables/**/*.test.ts', 'app/stores/**/*.test.ts'],
    environment: 'happy-dom',
  },
  esbuild: {
    tsconfigRaw: '{}',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
    },
  },
}));
