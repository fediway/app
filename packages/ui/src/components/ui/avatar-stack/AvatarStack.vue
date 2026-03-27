<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';
import { cn } from '../../../lib/utils';

export interface AvatarStackItem {
  src?: string | null;
  alt?: string;
  initial?: string;
}

interface Props {
  avatars: AvatarStackItem[];
  max?: number;
  label?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  max: 5,
  label: undefined,
});

const visibleAvatars = computed(() => props.avatars.slice(0, props.max));
const overflowCount = computed(() => Math.max(0, props.avatars.length - props.max));
</script>

<template>
  <div
    data-slot="avatar-stack"
    :class="cn('flex items-center', props.class)"
  >
    <!-- Overlapping avatars -->
    <div class="flex items-center pr-1.5">
      <div
        v-for="(avatar, i) in visibleAvatars"
        :key="i"
        class="relative shrink-0 size-7 rounded-full border border-background overflow-hidden bg-muted"
        :class="{ '-ml-1.5': i > 0 }"
      >
        <img
          v-if="avatar.src"
          :src="avatar.src"
          :alt="avatar.alt ?? ''"
          decoding="async"
          class="size-full object-cover"
        >
        <span
          v-else
          class="flex size-full items-center justify-center text-sm text-muted-foreground"
        >
          {{ avatar.initial ?? '?' }}
        </span>
      </div>

      <!-- Overflow indicator -->
      <div
        v-if="overflowCount > 0"
        class="relative shrink-0 size-7 -ml-1.5 rounded-full border border-background bg-muted flex items-center justify-center"
      >
        <span class="text-xs font-medium text-muted-foreground">
          +{{ overflowCount > 99 ? '99' : overflowCount }}
        </span>
      </div>
    </div>

    <!-- Label -->
    <span v-if="label" class="text-sm text-muted-foreground">
      {{ label }}
    </span>
  </div>
</template>
