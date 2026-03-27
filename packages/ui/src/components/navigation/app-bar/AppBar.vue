<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '../../../lib/utils';
import Button from '../../ui/button/Button.vue';
import NavIcon from '../NavIcon.vue';

interface Props {
  title?: string;
  leftIcon?: string;
  leftLabel?: string;
  rightIcon?: string;
  rightLabel?: string;
  bordered?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
});

defineEmits<{
  leftClick: [];
  rightClick: [];
}>();
</script>

<template>
  <div
    data-slot="app-bar"
    :class="cn(
      'flex h-14 items-center justify-between px-2 bg-card/80 backdrop-blur-lg border-b border-border/50',
      props.class,
    )"
  >
    <!-- Leading -->
    <div class="flex w-12 shrink-0 items-center justify-start">
      <slot name="leading">
        <Button
          v-if="leftIcon"
          variant="muted"
          size="icon"
          :aria-label="leftLabel"
          @click="$emit('leftClick')"
        >
          <NavIcon :name="(leftIcon as any)" :size="24" />
        </Button>
      </slot>
    </div>

    <!-- Title -->
    <div class="min-w-0 flex-1 text-center">
      <slot name="title">
        <h1 v-if="title" class="m-0 truncate text-lg font-semibold text-foreground">
          {{ title }}
        </h1>
      </slot>
    </div>

    <!-- Trailing -->
    <div class="flex w-12 shrink-0 items-center justify-end">
      <slot name="trailing">
        <Button
          v-if="rightIcon"
          variant="muted"
          size="icon"
          :aria-label="rightLabel"
          @click="$emit('rightClick')"
        >
          <NavIcon :name="(rightIcon as any)" :size="24" />
        </Button>
      </slot>
    </div>
  </div>
</template>
