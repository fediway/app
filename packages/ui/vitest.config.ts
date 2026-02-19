import path from 'node:path';
import baseConfig from '@repo/config/vitest';
import vue from '@vitejs/plugin-vue';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(baseConfig, defineConfig({
  plugins: [vue()],
  test: {
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '@repo/types': path.resolve(__dirname, '../types/src'),
    },
  },
}));
