<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { PhStar } from '@phosphor-icons/vue';
import { cn } from '../../../lib/utils';

interface Props {
  value: number;
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <div
    data-slot="average-rating"
    :class="cn('inline-flex items-center gap-1 text-sm text-foreground', props.class)"
  >
    <span>{{ value.toFixed(1) }}</span>
    <PhStar :size="20" weight="fill" class="text-yellow" />
  </div>
</template>
