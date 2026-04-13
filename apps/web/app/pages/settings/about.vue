<script setup lang="ts">
import { PageHeader } from '@repo/ui';

usePageHeader({ title: 'About' });

useHead({
  title: 'About · Fediway',
});
</script>

<template>
  <div class="w-full max-w-2xl">
    <PageHeader title="About" show-back class="lg:hidden" />

    <div class="px-4 py-6 space-y-8">
      <section>
        <h1 class="text-2xl font-bold text-foreground">
          Fediway
        </h1>
      </section>

      <section>
        <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Built on Mastodon
        </h2>
        <p class="text-sm text-foreground leading-relaxed">
          Fediway uses the Mastodon API. Your Fediway account lives on
          <span class="font-semibold">fediway.com</span> — a Mastodon server —
          and you can also sign in with any other Mastodon server you already
          have an account on.
        </p>
        <a
          href="https://joinmastodon.org"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-block text-sm font-semibold text-galaxy-500 dark:text-galaxy-400 hover:underline"
        >
          Learn more about Mastodon &rsaquo;
        </a>
      </section>

      <section>
        <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Version
        </h2>
        <p class="text-sm text-foreground">
          0.1.0-beta
        </p>
      </section>

      <section>
        <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Links
        </h2>
        <div class="-mx-2 space-y-1">
          <NuxtLink
            to="/settings/acknowledgments"
            class="flex items-center justify-between rounded-full px-3 py-2.5 transition-colors hover:bg-muted"
          >
            <span class="text-sm text-foreground">Open source acknowledgments</span>
            <span class="text-sm text-muted-foreground">&rsaquo;</span>
          </NuxtLink>
          <a
            href="https://github.com/fediway/app"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between rounded-full px-3 py-2.5 transition-colors hover:bg-muted"
          >
            <span class="text-sm text-foreground">Source code on GitHub</span>
            <span class="text-sm text-muted-foreground">&rsaquo;</span>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
