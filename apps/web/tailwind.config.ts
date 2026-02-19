import type { Config } from 'tailwindcss';
import baseConfig from '@repo/config/tailwind';

export default {
  ...baseConfig,
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './error.vue',
    '../../packages/ui/src/**/*.vue',
  ],
} satisfies Config;
