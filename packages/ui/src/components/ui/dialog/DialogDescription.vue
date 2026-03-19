<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DialogDescription } from 'reka-ui';
import { cn } from '../../../lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <DialogDescription :class="cn('text-sm text-foreground/60', props.class)">
    <slot />
  </DialogDescription>
</template>
