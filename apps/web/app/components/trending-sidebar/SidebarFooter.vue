<script setup lang="ts">
const internalLinks = [
  { label: 'About', to: '/settings/about' },
  { label: 'Acknowledgments', to: '/settings/acknowledgments' },
];

const externalLinks = [
  { label: 'Source', href: 'https://github.com/fediway/app' },
  { label: 'Built on Mastodon', href: 'https://joinmastodon.org' },
];
</script>

<template>
  <footer class="px-2 pb-8 pt-2">
    <nav class="flex flex-wrap gap-x-3 gap-y-1">
      <NuxtLink
        v-for="link in internalLinks"
        :key="link.label"
        :to="link.to"
        class="text-xs text-muted-foreground-subtle no-underline hover:text-muted-foreground-subtle hover:underline"
      >
        {{ link.label }}
      </NuxtLink>
      <a
        v-for="link in externalLinks"
        :key="link.label"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-muted-foreground-subtle no-underline hover:text-muted-foreground-subtle hover:underline"
      >
        {{ link.label }}
      </a>
    </nav>
    <p class="mt-3 text-xs text-muted-foreground-subtle">
      &copy; 2026 Fediway
    </p>
  </footer>
</template>
