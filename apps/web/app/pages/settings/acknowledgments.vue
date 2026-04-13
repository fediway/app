<script setup lang="ts">
import { PageHeader } from '@repo/ui';

usePageHeader({ title: 'Acknowledgments' });

useHead({
  title: 'Acknowledgments · Fediway',
});

interface Entry {
  name: string;
  description: string;
  license: string;
  url: string;
}

interface Group {
  heading: string;
  description?: string;
  entries: Entry[];
}

// Curated list of the major dependencies Fediway is built on. Full license
// manifest is generated at build time and linked at the bottom.
const groups: Group[] = [
  {
    heading: 'Protocol and API',
    description: 'Fediway speaks the Mastodon HTTP API and participates in the Fediverse.',
    entries: [
      {
        name: 'Mastodon',
        description: 'The social server whose API Fediway is built on.',
        license: 'AGPL-3.0',
        url: 'https://joinmastodon.org',
      },
      {
        name: 'ActivityPub',
        description: 'The W3C standard protocol underpinning the Fediverse.',
        license: 'W3C Recommendation',
        url: 'https://activitypub.rocks',
      },
      {
        name: 'masto.js',
        description: 'TypeScript client library for the Mastodon API.',
        license: 'MIT',
        url: 'https://github.com/neet/masto.js',
      },
    ],
  },
  {
    heading: 'Framework',
    entries: [
      {
        name: 'Vue',
        description: 'The progressive JavaScript framework.',
        license: 'MIT',
        url: 'https://vuejs.org',
      },
      {
        name: 'Nuxt',
        description: 'The Vue meta-framework used by the Fediway web app.',
        license: 'MIT',
        url: 'https://nuxt.com',
      },
      {
        name: 'Vite',
        description: 'The build tool for the mobile app and packages.',
        license: 'MIT',
        url: 'https://vitejs.dev',
      },
      {
        name: 'Capacitor',
        description: 'The native runtime for iOS and Android builds.',
        license: 'MIT',
        url: 'https://capacitorjs.com',
      },
    ],
  },
  {
    heading: 'User interface',
    entries: [
      {
        name: 'Tailwind CSS',
        description: 'Utility-first CSS framework.',
        license: 'MIT',
        url: 'https://tailwindcss.com',
      },
      {
        name: 'Reka UI',
        description: 'Unstyled accessible primitives (the engine behind shadcn-vue).',
        license: 'MIT',
        url: 'https://reka-ui.com',
      },
      {
        name: 'Phosphor Icons',
        description: 'The icon set used throughout Fediway.',
        license: 'MIT',
        url: 'https://phosphoricons.com',
      },
      {
        name: 'Tiptap',
        description: 'The rich-text editor powering the post composer.',
        license: 'MIT',
        url: 'https://tiptap.dev',
      },
    ],
  },
  {
    heading: 'Data and state',
    entries: [
      {
        name: 'Dexie',
        description: 'IndexedDB wrapper for the offline cache.',
        license: 'Apache-2.0',
        url: 'https://dexie.org',
      },
      {
        name: 'VueUse',
        description: 'Collection of Vue composition utilities.',
        license: 'MIT',
        url: 'https://vueuse.org',
      },
      {
        name: 'TanStack Virtual',
        description: 'Virtualization engine for the feed.',
        license: 'MIT',
        url: 'https://tanstack.com/virtual',
      },
    ],
  },
];
</script>

<template>
  <div class="w-full max-w-2xl">
    <PageHeader title="Acknowledgments" show-back class="lg:hidden" />

    <div class="px-4 py-6 space-y-8">
      <section>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Fediway is built on open source software. These are the major
          projects we depend on — thank you to their authors and contributors.
        </p>
      </section>

      <section
        v-for="group in groups"
        :key="group.heading"
      >
        <h2 class="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {{ group.heading }}
        </h2>
        <p
          v-if="group.description"
          class="mb-3 text-xs text-muted-foreground"
        >
          {{ group.description }}
        </p>
        <ul class="-mx-2 space-y-1">
          <li
            v-for="entry in group.entries"
            :key="entry.name"
          >
            <a
              :href="entry.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
            >
              <div class="min-w-0 flex-1">
                <div class="text-sm font-semibold text-foreground">
                  {{ entry.name }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ entry.description }}
                </div>
              </div>
              <span class="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {{ entry.license }}
              </span>
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Full manifest
        </h2>
        <p class="text-sm text-muted-foreground leading-relaxed">
          The complete list of every dependency and its license is published
          in the Fediway repository.
        </p>
        <a
          href="https://github.com/fediway/app/blob/main/package.json"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-block text-sm font-semibold text-galaxy-500 dark:text-galaxy-400 hover:underline"
        >
          View full dependency list &rsaquo;
        </a>
      </section>
    </div>
  </div>
</template>
