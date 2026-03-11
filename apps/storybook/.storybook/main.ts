import type { StorybookConfig } from '@storybook/vue3-vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: 'vue-component-meta',
    },
  },

  stories: [
    '../stories/**/*.stories.@(ts|tsx)',
  ],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],

  async viteFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias as Record<string, string>,
      '@': resolve(__dirname, '../../../packages/ui/src'),
    };

    // Allow Vite to serve files from the monorepo root
    config.server = config.server || {};
    config.server.fs = {
      ...config.server.fs,
      allow: [resolve(__dirname, '../../..')],
    };

    // Add Vue plugin if not already present
    config.plugins = config.plugins || [];
    config.plugins.push(vue());

    return config;
  },
};

export default config;
