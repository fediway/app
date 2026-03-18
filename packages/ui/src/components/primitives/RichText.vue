<script setup lang="ts">
import type { CustomEmoji } from '@repo/types';
import { computed } from 'vue';
import { escapeRegExp, sanitizeHtml } from '../../utils/sanitize';

const props = withDefaults(defineProps<Props>(), {
  emojis: () => [],
});

const QUOTE_RE = /"/g;

interface Props {
  /** HTML content to render */
  content: string;
  /** Custom emoji map for replacement */
  emojis?: CustomEmoji[];
}

// Process content to replace custom emoji shortcodes with images
const processedContent = computed(() => {
  let html = sanitizeHtml(props.content);

  for (const emoji of props.emojis) {
    const pattern = new RegExp(`:${escapeRegExp(emoji.shortcode)}:`, 'g');
    html = html.replace(
      pattern,
      `<img src="${encodeURI(emoji.url).replace(QUOTE_RE, '%22')}" alt=":${escapeRegExp(emoji.shortcode)}:" class="inline-block h-5 w-5 align-text-bottom" draggable="false" />`,
    );
  }

  return html;
});
</script>

<template>
  <div
    class="rich-text leading-relaxed break-words"
    v-html="processedContent"
  />
</template>

<style>
.rich-text a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: rgb(156 163 175);
}

.rich-text a:hover {
  text-decoration-color: currentColor;
}

.rich-text p {
  margin: 0;
}

.rich-text p + p {
  margin-top: 0.75rem;
}

.rich-text .mention,
.rich-text .hashtag {
  text-decoration: none;
  font-weight: 500;
}

.rich-text .mention:hover,
.rich-text .hashtag:hover {
  text-decoration: underline;
}

.rich-text .invisible {
  display: none;
}

.rich-text .ellipsis::after {
  content: '...';
}
</style>
