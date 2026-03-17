<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { DividerVariants } from '.';
import { dividerVariants } from '.';
import { cn } from '../../../lib/utils';

interface Props {
  orientation?: DividerVariants['orientation'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
});
</script>

<template>
  <div
    data-slot="divider"
    :role="orientation === 'vertical' ? 'separator' : 'separator'"
    :aria-orientation="orientation ?? undefined"
    :class="cn(dividerVariants({ orientation }), props.class)"
  />
</template>
