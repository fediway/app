import path from 'node:path';
import baseConfig from '@repo/config/vitest';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(baseConfig, defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
    setupFiles: ['test/cache/setup.ts'],
  },
  resolve: {
    alias: {
      '@repo/types': path.resolve(__dirname, '../types/src'),
    },
  },
}));
