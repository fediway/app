<script setup lang="ts">
import type { BadgeVariants } from '.';
import { badgeVariants } from '.';

const props = withDefaults(defineProps<{
  variant?: NonNullable<BadgeVariants['variant']>;
}>(), {
  variant: 'blue',
});
</script>

<template>
  <span :class="badgeVariants({ variant: props.variant })">
    <slot name="icon" />
    <span><slot /></span>
  </span>
</template>
