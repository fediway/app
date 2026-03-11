<script setup lang="ts">
import type { TagItemVariants } from '.';
import { tagItemVariants } from '.';

const props = withDefaults(defineProps<{
  variant?: NonNullable<TagItemVariants['variant']>;
}>(), {
  variant: 'blue',
});
</script>

<template>
  <span :class="tagItemVariants({ variant: props.variant })">
    <slot name="icon" />
    <span><slot /></span>
  </span>
</template>
