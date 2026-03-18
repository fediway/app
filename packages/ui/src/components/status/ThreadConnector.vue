<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    class="absolute left-8 w-0.5 bg-gray-300 dark:bg-gray-600"
    :class="$props.class"
  />
</template>
