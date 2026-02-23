import type { Config } from 'tailwindcss';
import baseConfig from '@repo/config/tailwind';

export default {
  ...baseConfig,
  content: [
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
    './app/error.vue',
    '../../packages/ui/src/**/*.vue',
  ],
} satisfies Config;
