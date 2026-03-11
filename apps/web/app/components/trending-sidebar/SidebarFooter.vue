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
  <footer class="px-2 py-2">
    <nav class="flex flex-wrap gap-x-3 gap-y-1">
      <a
        v-for="link in footerLinks"
        :key="link"
        href="#"
        class="text-xs text-gray-500 hover:text-gray-700 no-underline hover:underline"
      >
        {{ link }}
      </a>
    </nav>
    <p class="text-xs text-gray-400 mt-3">
      &copy; 2026 Fediway
    </p>
  </footer>
</template>
