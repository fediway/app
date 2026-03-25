<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    class="absolute left-8 w-0.5 bg-border"
    :class="$props.class"
  />
</template>
