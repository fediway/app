<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { ref, watch } from 'vue';
import { cn } from '../../../lib/utils';
import { AnimatedCount } from '../animated-count';

interface Props {
  count?: number | null;
  ariaLabel?: string;
  ariaPressed?: boolean;
  animation?: 'pop' | 'spin' | 'settle';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  count: null,
  ariaLabel: undefined,
  ariaPressed: undefined,
  animation: undefined,
});

const isAnimating = ref(false);

const animationClassMap = {
  pop: 'animate-action-pop',
  spin: 'animate-action-spin',
  settle: 'animate-action-settle',
} as const;

watch(() => props.ariaPressed, (newVal, oldVal) => {
  if (oldVal === false && newVal === true && props.animation) {
    isAnimating.value = true;
  }
});

function onAnimationEnd() {
  isAnimating.value = false;
}
</script>

<template>
  <button
    type="button"
    data-slot="button-action"
    :aria-label="ariaLabel"
    :aria-pressed="ariaPressed"
    :class="cn(
      'inline-flex min-h-[44px] items-center gap-[6px]',
      'cursor-pointer text-muted-foreground transition-colors',
      'hover:text-foreground',
      'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
  >
    <span
      :class="cn(
        'inline-flex size-5 shrink-0 items-center justify-center',
        isAnimating && animation && animationClassMap[animation],
      )"
      @animationend="onAnimationEnd"
    >
      <slot />
    </span>
    <AnimatedCount v-if="count != null" :count="count" class="text-sm" />
  </button>
</template>
