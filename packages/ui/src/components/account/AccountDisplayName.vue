<script setup lang="ts">
import type { CustomEmoji } from '@repo/types';
import type { HTMLAttributes } from 'vue';
import { computed } from 'vue';
import { renderCustomEmojis } from '../../utils/customEmojis';

interface Props {
  /** Display name — caller is responsible for fallback (e.g. `displayName || username`). */
  name: string;
  /** Custom emoji definitions from the account. */
  emojis?: readonly CustomEmoji[];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  emojis: () => [],
});

const processedName = computed(() =>
  renderCustomEmojis(props.name, props.emojis, 'inline-block h-4 w-4 align-text-bottom'),
);
</script>

<template>
  <span class="break-words" :class="props.class" v-html="processedName" />
</template>
