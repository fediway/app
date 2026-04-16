<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <section class="border-b border-border px-4 py-4">
    <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {{ title }}
    </h2>
    <p v-if="description" class="-mt-1 mb-3 text-xs text-muted-foreground">
      {{ description }}
    </p>
    <slot />
  </section>
</template>
