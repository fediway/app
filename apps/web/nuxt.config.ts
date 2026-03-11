import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  devServer: {
    port: 3333,
  },

  css: [new URL('../../packages/ui/src/styles/globals.css', import.meta.url).pathname],

  ssr: true,

  runtimeConfig: {
    public: {
      defaultInstance: process.env.NUXT_PUBLIC_DEFAULT_INSTANCE || 'fediway.com',
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
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
      title: 'Fediway',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A short-form social platform for the fediverse' },
        {
          'http-equiv': 'Content-Security-Policy',
          'content': `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; connect-src 'self' https:; font-src 'self' data:; frame-src 'none'`,
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
    resolve: {
      alias: {
        '@/': new URL('../../packages/ui/src/', import.meta.url).pathname,
      },
    },
  },
});
