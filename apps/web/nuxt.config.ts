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

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
      ],
    },
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

  // Disable payload extraction (not needed for SPA)
  experimental: {
    payloadExtraction: false,
    defaults: {
      nuxtLink: {
        // Prefetch on interaction (hover/focus) instead of visibility — reduces idle network
        prefetchOn: { interaction: true, visibility: false },
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Fediway',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A short-form social platform for the fediverse' },
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
        'dompurify',
      ],
    },
    build: {
      // Target modern browsers — smaller output, no unnecessary polyfills
      target: 'es2022',
      // Skip compressed size reporting — speeds up builds
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          // Split heavy vendor deps into separate chunks for better caching.
          // These change rarely → long-lived browser cache.
          manualChunks(id) {
            if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror'))
              return 'vendor-tiptap';
            if (id.includes('node_modules/reka-ui'))
              return 'vendor-reka';
            if (id.includes('node_modules/swiper'))
              return 'vendor-swiper';
            if (id.includes('node_modules/@phosphor-icons'))
              return 'vendor-icons';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@/': new URL('../../packages/ui/src/', import.meta.url).pathname,
      },
    },
  },
});
