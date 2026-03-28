import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  alias: {
    '@ui': resolve(__dirname, '../../packages/ui/src'),
  },

  devServer: {
    port: 3333,
  },

  css: [new URL('../../packages/ui/src/styles/globals.css', import.meta.url).pathname],

  // SPA mode — auth tokens live client-side, all content is API-driven.
  // The spa-loading-template.html provides the initial paint (galaxy icon).
  // This is the correct architecture for a federated OAuth app (Elk does the same).
  ssr: false,

  runtimeConfig: {
    public: {
      defaultInstance: process.env.NUXT_PUBLIC_DEFAULT_INSTANCE || 'fediway.com',
    },
  },

  typescript: {
    strict: true,
    // Disabled: vite-plugin-checker 0.12.0 broken with vue-tsc 3 (missing lib files)
    // Use `npm run type-check` instead. Re-enable when vite-plugin-checker ships a fix.
    typeCheck: false,
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  imports: {
    dirs: ['composables/**'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Fediway',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A short-form social platform for the fediverse' },
        {
          'http-equiv': 'Content-Security-Policy',
          'content': `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; connect-src 'self' https: wss:; font-src 'self' data:; frame-src 'none'`,
        },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss() as any],
    envDir: new URL('.', import.meta.url).pathname,
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    optimizeDeps: {
      include: [
        'masto',
        'dexie',
        'swiper/vue',
        'swiper/modules',
        'reka-ui',
        'reka-ui/namespaced',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        '@phosphor-icons/vue',
        '@tanstack/vue-virtual',
        '@vueuse/core',
        'blurhash',
        'isomorphic-dompurify',
      ],
    },
    resolve: {
      alias: {
        '@/': new URL('../../packages/ui/src/', import.meta.url).pathname,
      },
    },
  },
});
