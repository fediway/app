<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    class="animate-pulse rounded bg-muted"
    :class="$props.class"
  />
</template>
