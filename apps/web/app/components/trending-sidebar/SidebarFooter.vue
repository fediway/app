<script setup lang="ts">
const footerLinks = [
  'About',
  'Terms',
  'Privacy',
  'Cookies',
  'Accessibility',
];
</script>

<template>
  <footer class="px-2 pb-8 pt-2">
    <nav class="flex flex-wrap gap-x-3 gap-y-1">
      <a
        v-for="link in footerLinks"
        :key="link"
        href="#"
        class="text-xs text-muted-foreground-subtle no-underline hover:text-muted-foreground-subtle hover:underline"
      >
        {{ link }}
      </a>
    </nav>
    <p class="mt-3 text-xs text-muted-foreground-subtle">
      &copy; 2026 Fediway
    </p>
  </footer>
</template>
