<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { PhMagnifyingGlass } from '@phosphor-icons/vue';
import { cn } from '../../../lib/utils';

interface Props {
  modelValue?: string;
  placeholder?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <div
    data-slot="search-input"
    :class="cn(
      'flex items-center gap-2.5 rounded-full bg-muted px-4 py-2.5',
      'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
      'transition-shadow',
      props.class,
    )"
  >
    <PhMagnifyingGlass :size="20" class="shrink-0 text-foreground/80" />
    <input
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      class="min-w-0 flex-1 bg-transparent text-base font-medium text-foreground placeholder:text-foreground/80 outline-none"
      @input="onInput"
    >
  </div>
</template>
