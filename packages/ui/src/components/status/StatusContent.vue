<script setup lang="ts">
import type { CustomEmoji } from '@repo/types';
import type { StatusMention } from '../../utils/content-links';
import { computed, ref, watch } from 'vue';
import { RichText } from '../ui/rich-text';

interface Props {
  /** HTML content */
  content: string;
  /** Content warning/spoiler text */
  spoilerText?: string;
  /** Custom emoji */
  emojis?: CustomEmoji[];
  /** Status mentions for resolving @mention links */
  mentions?: StatusMention[];
  /** Whether content is collapsed behind CW */
  collapsed?: boolean;
  /** Max lines before "Show more" truncation (0 = no limit) */
  maxLines?: number;
}

const props = withDefaults(defineProps<Props>(), {
  spoilerText: '',
  emojis: () => [],
  mentions: () => [],
  collapsed: false,
  maxLines: 0,
});

const emit = defineEmits<{
  toggleCollapse: [];
  mentionClick: [acct: string];
  hashtagClick: [tag: string];
}>();

const hasSpoiler = computed(() => props.spoilerText.length > 0);
const isCollapsed = ref(props.collapsed || hasSpoiler.value);
const isTruncated = ref(props.maxLines > 0);
const contentRef = ref<HTMLElement>();

// Detect if content actually overflows the line clamp
function checkOverflow() {
  const el = contentRef.value;
  if (!el || !props.maxLines)
    return;
  isTruncated.value = el.scrollHeight > el.clientHeight;
}

const isExpanded = ref(false);

watch(() => props.collapsed, (val) => {
  isCollapsed.value = val;
});

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  emit('toggleCollapse');
}
</script>

<template>
  <div class="status-content">
    <!-- Content Warning -->
    <div v-if="hasSpoiler" class="mb-2">
      <RichText
        :content="spoilerText"
        :emojis="emojis"
        :mentions="mentions"
        class="text-foreground"
        @mention-click="emit('mentionClick', $event)"
        @hashtag-click="emit('hashtagClick', $event)"
      />
      <button
        type="button"
        class="mt-2 px-3 py-1 text-sm font-medium text-muted-foreground bg-muted rounded hover:bg-accent transition-colors"
        @click="toggleCollapse"
      >
        {{ isCollapsed ? 'Show more' : 'Show less' }}
      </button>
    </div>

    <!-- Main Content -->
    <div
      v-show="!hasSpoiler || !isCollapsed"
      :class="{ 'mt-2': hasSpoiler }"
    >
      <div
        ref="contentRef"
        :style="maxLines && !isExpanded ? { display: '-webkit-box', WebkitLineClamp: maxLines, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined"
      >
        <RichText
          :content="content"
          :emojis="emojis"
          :mentions="mentions"
          class="text-foreground"
          @mention-click="emit('mentionClick', $event)"
          @hashtag-click="emit('hashtagClick', $event)"
          @vue:mounted="checkOverflow"
        />
      </div>
      <button
        v-if="maxLines && isTruncated && !isExpanded"
        type="button"
        class="mt-2 cursor-pointer rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        @click.stop="isExpanded = true"
      >
        Show more
      </button>
    </div>
  </div>
</template>
