<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col">
    <!-- Profile section -->
    <div v-if="$slots.profile" class="px-2">
      <slot name="profile" />
    </div>

    <!-- Primary action (e.g., "New Post" button) -->
    <div v-if="$slots.action" class="my-3 px-4">
      <slot name="action" />
    </div>

    <!-- Navigation menu -->
    <nav class="flex flex-col gap-1 px-2">
      <slot />
    </nav>

    <!-- Footer -->
    <div v-if="$slots.footer" class="mt-auto px-2">
      <slot name="footer" />
    </div>
  </div>
</template>
