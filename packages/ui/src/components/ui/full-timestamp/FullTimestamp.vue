<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  datetime: string;
}>();

const formatted = computed(() => {
  const date = new Date(props.datetime);
  if (Number.isNaN(date.getTime()))
    return '';
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
});
</script>

<template>
  <time v-if="formatted" :datetime="datetime" class="text-sm text-gray-400 dark:text-gray-500">
    {{ formatted }}
  </time>
</template>
