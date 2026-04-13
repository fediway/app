<script setup lang="ts">
import type { CustomEmoji } from '@repo/types';
import Avatar from '../ui/avatar/Avatar.vue';
import ThreadRailFrame from './ThreadRailFrame.vue';

interface Props {
  src?: string | null;
  alt?: string;
  emojis?: CustomEmoji[];
  connectAbove?: boolean;
  connectBelow?: boolean;
}

withDefaults(defineProps<Props>(), {
  src: null,
  alt: 'Avatar',
  emojis: () => [],
  connectAbove: false,
  connectBelow: false,
});

defineEmits<{
  click: [];
}>();
</script>

<template>
  <ThreadRailFrame :connect-above="connectAbove" :connect-below="connectBelow">
    <button
      type="button"
      class="shrink-0 cursor-pointer"
      @click.stop="$emit('click')"
    >
      <Avatar :src="src" :alt="alt" size="md" />
    </button>
  </ThreadRailFrame>
</template>
