const base = require('@repo/config/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...base,
  content: [
    '../../packages/ui/src/**/*.{vue,ts}',
    './stories/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
  ],
};
