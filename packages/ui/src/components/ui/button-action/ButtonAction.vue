<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../../../lib/utils';

interface Props {
  count?: number | null;
  ariaLabel?: string;
  ariaPressed?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  count: null,
  ariaLabel: undefined,
  ariaPressed: undefined,
});

const TRAILING_ZERO_RE = /\.0$/;

function formatCount(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(TRAILING_ZERO_RE, '')}m`;
  if (n >= 1_000)
    return `${(n / 1_000).toFixed(1).replace(TRAILING_ZERO_RE, '')}k`;
  return n.toString();
}
</script>

<template>
  <button
    type="button"
    data-slot="button-action"
    :aria-label="ariaLabel"
    :aria-pressed="ariaPressed"
    :class="cn(
      'inline-flex items-center gap-[6px]',
      'cursor-pointer text-gray-500 dark:text-gray-400 transition-colors',
      'hover:text-foreground',
      'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
  >
    <span class="inline-flex size-5 shrink-0 items-center justify-center">
      <slot />
    </span>
    <span
      v-if="count != null"
      class="text-sm tabular-nums"
    >
      {{ formatCount(count) }}
    </span>
  </button>
</template>
