<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import type { HeadlineVariants } from '.';
import { Primitive } from 'reka-ui';
import { headlineVariants } from '.';
import { cn } from '../../../lib/utils';

interface Props extends PrimitiveProps {
  level?: HeadlineVariants['level'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'h2',
  level: 'h2',
});
</script>

<template>
  <Primitive
    data-slot="headline"
    :as="as"
    :as-child="asChild"
    :class="cn(headlineVariants({ level }), props.class)"
  >
    <slot />
  </Primitive>
</template>
