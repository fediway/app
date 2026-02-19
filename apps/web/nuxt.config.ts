export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  devServer: {
    port: 3333,
  },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  ssr: true,

  runtimeConfig: {
    public: {
      defaultInstance: process.env.NUXT_PUBLIC_DEFAULT_INSTANCE || 'fediway.com',
    },
  },

  tailwindcss: {
    configPath: './tailwind.config.ts',
    exposeConfig: true,
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
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },

  future: {
    compatibilityVersion: 4,
  },
});
