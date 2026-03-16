<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { Primitive } from 'reka-ui';
import { cn } from '../../../lib/utils';

interface Props extends PrimitiveProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
});
</script>

<template>
  <Primitive
    data-slot="button-text"
    :as="as"
    :as-child="asChild"
    :class="cn(
      'inline-flex h-9 cursor-pointer items-center py-2.5',
      'text-base font-semibold text-primary',
      'underline decoration-secondary hover:decoration-primary',
      'transition-colors outline-none',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
  >
    <slot />
  </Primitive>
</template>
