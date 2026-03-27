<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../../../lib/utils';

interface Option {
  value: string;
  label: string;
}

interface Props {
  modelValue: string;
  options: Option[];
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div
    data-slot="segmented-control"
    :class="cn('flex gap-2', props.class)"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors"
      :class="[
        modelValue === option.value
          ? 'bg-foreground text-background'
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
      ]"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
