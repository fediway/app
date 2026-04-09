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
  /** Full-screen on mobile viewports (< lg breakpoint). Defaults to false. */
  fullScreenMobile?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true,
  fullScreenMobile: false,
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
      class="fixed inset-0 z-[200] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogContent
      :class="cn(
        'fixed z-[200] w-full overflow-hidden bg-card shadow-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        // Mobile full-screen mode
        fullScreenMobile
          ? [
            'top-0 left-0 right-0 h-dvh rounded-none',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'lg:inset-auto lg:h-auto lg:left-1/2 lg:top-[10vh] lg:-translate-x-1/2 lg:rounded-2xl',
            'lg:data-[state=closed]:zoom-out-95 lg:data-[state=open]:zoom-in-95',
            'lg:data-[state=closed]:slide-out-to-top-2 lg:data-[state=open]:slide-in-from-top-2',
          ]
          : [
            'left-1/2 top-[10vh] -translate-x-1/2 rounded-2xl',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
          ],
        sizeClasses[props.size],
        props.class,
      )"
    >
      <slot />

      <!-- Close button -->
      <DialogClose
        v-if="showClose"
        class="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
      >
        <PhX :size="18" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
