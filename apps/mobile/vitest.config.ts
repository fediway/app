import baseConfig from '@repo/config/vitest';
import vue from '@vitejs/plugin-vue';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(baseConfig, defineConfig({
  plugins: [vue()],
  test: {
    setupFiles: ['./test/setup/capacitor-mocks.ts'],
  },
}));
