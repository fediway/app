<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DropdownMenuItem } from 'reka-ui';
import { cn } from '../../../lib/utils';

interface Props {
  /** Red destructive styling (e.g., Report, Delete) */
  destructive?: boolean;
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  destructive: false,
  disabled: false,
});
</script>

<template>
  <DropdownMenuItem
    :disabled="props.disabled"
    :class="cn(
      'flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm outline-hidden transition-colors',
      'focus:bg-muted',
      props.destructive
        ? 'text-red hover:bg-red/10 focus:bg-red/10'
        : 'text-foreground hover:bg-muted',
      props.disabled && 'pointer-events-none opacity-50',
      props.class,
    )"
  >
    <slot />
  </DropdownMenuItem>
</template>
