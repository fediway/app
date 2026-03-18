<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { PhX } from '@phosphor-icons/vue';
import { DialogClose, DialogContent, DialogOverlay, DialogPortal } from 'reka-ui';
import { cn } from '../../../lib/utils';

interface Props {
  /** Max width of the dialog. Defaults to 'md' (480px). */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Show the built-in close button. Defaults to true. */
  showClose?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true,
});

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-[480px]',
  lg: 'max-w-[650px]',
  xl: 'max-w-3xl',
  full: 'max-w-[calc(100vw-2rem)]',
};
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogContent
      :class="cn(
        'fixed left-1/2 top-[10vh] z-50 w-full -translate-x-1/2 overflow-hidden rounded-2xl bg-card shadow-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
        sizeClasses[props.size],
        props.class,
      )"
    >
      <slot />

      <!-- Close button -->
      <DialogClose
        v-if="showClose"
        class="absolute right-4 top-4 rounded-full p-1.5 text-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
      >
        <PhX :size="18" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
