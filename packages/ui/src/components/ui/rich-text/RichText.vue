<script setup lang="ts">
import type { CustomEmoji } from '@repo/types';
import type { StatusMention } from '../../../utils/content-links';
import { computed } from 'vue';
import { extractTagName, resolveMentionAcct } from '../../../utils/content-links';
import { renderCustomEmojis } from '../../../utils/customEmojis';

interface Props {
  /** HTML content to render */
  content: string;
  /** Custom emoji map for replacement */
  emojis?: CustomEmoji[];
  /** Status mentions for resolving @mention links */
  mentions?: StatusMention[];
}

const props = withDefaults(defineProps<Props>(), {
  emojis: () => [],
  mentions: () => [],
});

const emit = defineEmits<{
  mentionClick: [acct: string];
  hashtagClick: [tag: string];
}>();

const processedContent = computed(() =>
  renderCustomEmojis(props.content, props.emojis),
);

function handleContentClick(e: MouseEvent) {
  // Allow modifier keys to work normally (Cmd-click to open in new tab)
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
    return;

  const anchor = (e.target as HTMLElement).closest('a');
  if (!anchor)
    return;

  const href = anchor.getAttribute('href');
  if (!href)
    return;

  // 1. Mention
  if (anchor.classList.contains('mention') || anchor.classList.contains('u-url')) {
    const acct = resolveMentionAcct(href, anchor.textContent ?? '', props.mentions);
    if (acct) {
      e.preventDefault();
      e.stopPropagation();
      emit('mentionClick', acct);
      return;
    }
  }

  // 2. Hashtag
  if (anchor.classList.contains('hashtag')) {
    const tag = extractTagName(href, anchor.textContent ?? '');
    if (tag) {
      e.preventDefault();
      e.stopPropagation();
      emit('hashtagClick', tag);
      return;
    }
  }

  // 3. External link — ensure safe attributes, let browser handle
  if (!anchor.getAttribute('target')) {
    anchor.setAttribute('target', '_blank');
  }
  if (!anchor.getAttribute('rel')?.includes('noopener')) {
    anchor.setAttribute('rel', 'noopener noreferrer');
  }
}
</script>

<template>
  <div
    class="rich-text font-content leading-snug break-words"
    @click="handleContentClick"
    v-html="processedContent"
  />
</template>

<style>
.rich-text a {
  color: var(--galaxy-500);
  text-decoration: none;
}

.rich-text a:hover {
  text-decoration: underline;
}

.rich-text p {
  margin: 0;
}

.rich-text p + p {
  margin-top: 0.5em;
}

.rich-text .mention,
.rich-text .hashtag {
  color: var(--galaxy-500);
  text-decoration: none;
  font-weight: 600;
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

:where(.dark, .dark *) .rich-text a,
:where(.dark, .dark *) .rich-text .mention,
:where(.dark, .dark *) .rich-text .hashtag {
  color: var(--galaxy-400);
}
</style>
