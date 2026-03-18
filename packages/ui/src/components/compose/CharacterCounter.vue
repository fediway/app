<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  current: number;
  limit: number;
}>();

const remaining = computed(() => props.limit - props.current);
</script>

<template>
  <span
    class="text-sm"
    :class="[
      remaining < 0 ? 'font-medium text-red-500'
      : remaining <= 50 ? 'text-orange-500'
        : 'text-gray-400',
    ]"
  >
    {{ remaining }}
  </span>
</template>
