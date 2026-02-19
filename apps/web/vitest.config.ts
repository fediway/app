import path from 'node:path';
import baseConfig from '@repo/config/vitest';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(baseConfig, defineConfig({
  test: {
    root: path.resolve(__dirname),
    include: ['composables/**/*.test.ts', 'stores/**/*.test.ts'],
    environment: 'happy-dom',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname),
    },
  },
}));
