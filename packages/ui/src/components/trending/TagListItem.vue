<script setup lang="ts">
defineProps<{
  name: string;
  postCount?: number | string;
}>();

defineEmits<{
  click: [name: string];
}>();
</script>

<template>
  <button
    class="flex w-full items-center justify-between rounded-full px-3 py-2 text-left transition-colors hover:bg-muted cursor-pointer"
    @click="$emit('click', name)"
  >
    <span class="min-w-0 truncate text-sm font-medium text-foreground">#{{ name }}</span>
    <span v-if="postCount" class="shrink-0 text-sm text-muted-foreground">{{ postCount }}</span>
  </button>
</template>
