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
    class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
    @click="$emit('click', name)"
  >
    <span class="font-medium text-foreground">#{{ name }}</span>
    <span v-if="postCount" class="text-sm text-muted-foreground">{{ postCount }}</span>
  </button>
</template>
