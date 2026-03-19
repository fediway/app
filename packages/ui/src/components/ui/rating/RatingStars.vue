<script setup lang="ts">
import { PhStar } from '@phosphor-icons/vue';

withDefaults(defineProps<{
  value: number;
  max?: number;
}>(), {
  max: 5,
});
</script>

<template>
  <div class="inline-flex gap-0.5">
    <PhStar
      v-for="i in max"
      :key="i"
      :size="20"
      :weight="i <= value ? 'fill' : 'regular'"
      :class="i <= value ? 'text-yellow' : 'text-foreground/20'"
    />
  </div>
</template>
