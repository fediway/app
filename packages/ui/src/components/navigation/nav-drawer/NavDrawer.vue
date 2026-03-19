<script setup lang="ts">
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from 'reka-ui';

interface Props {
  open: boolean;
  title?: string;
  side?: 'left' | 'right';
}

withDefaults(defineProps<Props>(), {
  title: 'Navigation menu',
  side: 'left',
});

defineEmits<{
  'update:open': [value: boolean];
}>();
</script>

<template>
  <DialogRoot :open="open" @update:open="$emit('update:open', $event)">
    <DialogPortal>
      <!-- Backdrop -->
      <Transition
        enter-active-class="motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out"
        enter-from-class="opacity-0"
        leave-active-class="motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-in"
        leave-to-class="opacity-0"
      >
        <DialogOverlay v-if="open" class="fixed inset-0 z-50 bg-black/50" />
      </Transition>

      <!-- Panel -->
      <Transition
        enter-active-class="motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-out"
        :enter-from-class="side === 'left' ? '-translate-x-full' : 'translate-x-full'"
        leave-active-class="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-in"
        :leave-to-class="side === 'left' ? '-translate-x-full' : 'translate-x-full'"
      >
        <DialogContent
          v-if="open"
          class="fixed bottom-0 top-0 z-50 flex w-[280px] max-w-[80vw] flex-col overflow-y-auto bg-white dark:bg-gray-900"
          :class="side === 'left' ? 'left-0' : 'right-0'"
          @escape-key-down="$emit('update:open', false)"
        >
          <VisuallyHidden>
            <DialogTitle>{{ title }}</DialogTitle>
            <DialogDescription>Site navigation</DialogDescription>
          </VisuallyHidden>

          <!-- Header slot (user profile section) -->
          <div v-if="$slots.header" class="border-b border-gray-100 dark:border-gray-800">
            <slot name="header" />
          </div>

          <!-- Menu items -->
          <nav aria-label="Main menu" class="flex flex-col p-2">
            <slot />
          </nav>

          <!-- Footer slot -->
          <div v-if="$slots.footer" class="mt-auto border-t border-gray-100 dark:border-gray-800 p-2">
            <slot name="footer" />
          </div>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>
