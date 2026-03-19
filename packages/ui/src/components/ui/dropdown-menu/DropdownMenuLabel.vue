<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DropdownMenuLabel } from 'reka-ui';
import { cn } from '../../../lib/utils';

interface Props {
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <DropdownMenuLabel
    :class="cn('px-4 py-1.5 text-xs font-medium text-foreground/60', props.class)"
  >
    <slot />
  </DropdownMenuLabel>
</template>
