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
        class="text-xs text-foreground/40 no-underline hover:text-foreground/60 hover:underline"
      >
        {{ link }}
      </a>
    </nav>
    <p class="mt-3 text-xs text-foreground/30">
      &copy; 2026 Fediway
    </p>
  </footer>
</template>
