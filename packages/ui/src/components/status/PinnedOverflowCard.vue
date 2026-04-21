<script setup lang="ts">
import type { Status as StatusType } from '@repo/types';
import type { HTMLAttributes } from 'vue';
import { PhImage, PhPushPin } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { cn } from '../../lib/utils';

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [statusId: string];
}>();

const HTML_TAG_RE = /<[^>]*>/g;

interface Props {
  status: StatusType;
  class?: HTMLAttributes['class'];
}

const excerpt = computed(() => {
  const spoiler = props.status.spoilerText?.trim();
  if (spoiler)
    return spoiler;
  return props.status.content.replace(HTML_TAG_RE, ' ').replace(/\s+/g, ' ').trim();
});

const mediaCount = computed(() => props.status.mediaAttachments.length);
</script>

<template>
  <button
    type="button"
    :class="cn(
      'flex flex-col text-left rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/20 hover:bg-foreground/[0.03] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
      props.class,
    )"
    :aria-label="`Pinned post: ${excerpt.slice(0, 120)}`"
    @click="emit('click', status.id)"
  >
    <div class="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      <PhPushPin :size="10" weight="fill" />
      Pinned
    </div>
    <p class="mt-1.5 text-sm leading-snug text-foreground line-clamp-3 break-words">
      {{ excerpt }}
    </p>
    <div
      v-if="mediaCount > 0"
      class="mt-2 flex items-center gap-1 text-xs text-muted-foreground"
    >
      <PhImage :size="12" />
      <span>{{ mediaCount }} {{ mediaCount === 1 ? 'photo' : 'photos' }}</span>
    </div>
  </button>
</template>
