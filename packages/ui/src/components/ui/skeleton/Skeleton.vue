<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    class="animate-shimmer rounded bg-muted"
    :class="$props.class"
  />
</template>
