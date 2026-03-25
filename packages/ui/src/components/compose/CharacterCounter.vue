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
    aria-live="polite"
    :aria-label="`${remaining} characters remaining`"
    class="text-sm"
    :class="[
      remaining < 0 ? 'font-medium text-red'
      : remaining <= 50 ? 'text-foreground'
        : 'text-muted-foreground',
    ]"
  >
    {{ remaining }}
  </span>
</template>
