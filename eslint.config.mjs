import antfu from '@antfu/eslint-config';

export default antfu({
  vue: true,
  typescript: true,

  // Style preferences matching the existing codebase
  stylistic: {
    semi: true,
    quotes: 'single',
  },

  // Files to ignore
  ignores: [
    'node_modules',
    'dist',
    '.output',
    '.nuxt',
    '.turbo',
    'ios',
    'android',
    '*.lock',
    'README.md',
  ],
}, {
  // Allow process.env in config files (Nuxt config, Vite config, etc.)
  files: ['**/*.config.{ts,mts,js,mjs}'],
  rules: {
    'node/prefer-global/process': 'off',
  },
});
