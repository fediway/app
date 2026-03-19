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
    class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    @click="$emit('click', name)"
  >
    <span class="font-medium text-gray-900 dark:text-gray-100">#{{ name }}</span>
    <span v-if="postCount" class="text-sm text-gray-500">{{ postCount }}</span>
  </button>
</template>
