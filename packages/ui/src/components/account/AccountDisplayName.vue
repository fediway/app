<script setup lang="ts">
import type { CustomEmoji } from '@repo/types';
import { computed } from 'vue';
import { escapeRegExp, sanitizeHtml } from '../../utils/sanitize';

interface Props {
  /** Display name */
  name: string;
  /** Custom emoji in the name */
  emojis?: CustomEmoji[];
  /** Whether to render as a link */
  asLink?: boolean;
  /** URL for the link */
  href?: string;
}

const props = withDefaults(defineProps<Props>(), {
  emojis: () => [],
  asLink: false,
  href: undefined,
});

// Process display name to replace custom emoji shortcodes
const processedName = computed(() => {
  let html = sanitizeHtml(props.name);

  for (const emoji of props.emojis) {
    const pattern = new RegExp(`:${escapeRegExp(emoji.shortcode)}:`, 'g');
    html = html.replace(
      pattern,
      `<img src="${encodeURI(emoji.url)}" alt=":${escapeRegExp(emoji.shortcode)}:" class="inline-block h-4 w-4 align-text-bottom" draggable="false" />`,
    );
  }

  return html;
});
</script>

<template>
  <!-- eslint-disable vue/no-v-text-v-html-on-component -->
  <component
    :is="asLink && href ? 'a' : 'span'"
    :href="asLink && href ? href : undefined"
    class="font-semibold text-gray-900 break-words" :class="[
      asLink && href && 'no-underline hover:underline',
    ]"
    v-html="processedName"
  />
</template>
