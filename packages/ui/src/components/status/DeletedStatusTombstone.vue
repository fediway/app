<script setup lang="ts">
import type { ThreadPosition } from './thread';
import { PhProhibit, PhTrash } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { isConnectedAbove, isConnectedBelow } from './thread';
import ThreadRailFrame from './ThreadRailFrame.vue';

interface Props {
  /**
   * Thread position — use the same discriminated union as Status so that
   * deleted posts slot into a reply chain without disturbing rail geometry.
   */
  threadPosition?: ThreadPosition;
  /**
   * Why the post is missing. Drives the icon and copy.
   * - `deleted` — the author deleted it (trash icon)
   * - `unavailable` — blocked, suspended, or otherwise inaccessible (prohibit icon)
   */
  reason?: 'deleted' | 'unavailable';
  /** Show the bottom 1px separator. Auto-hidden when connected below. */
  showSeparator?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  threadPosition: () => ({ kind: 'standalone' }),
  reason: 'unavailable',
  showSeparator: true,
});

const connectAbove = computed(() => isConnectedAbove(props.threadPosition));
const connectBelow = computed(() => isConnectedBelow(props.threadPosition));

const icon = computed(() => (props.reason === 'deleted' ? PhTrash : PhProhibit));
const label = computed(() =>
  props.reason === 'deleted' ? 'This post was deleted' : 'This post is unavailable',
);
</script>

<template>
  <article>
    <div class="flex gap-3 px-4">
      <ThreadRailFrame :connect-above="connectAbove" :connect-below="connectBelow">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted"
          aria-hidden="true"
        >
          <component :is="icon" :size="18" class="text-muted-foreground" />
        </div>
      </ThreadRailFrame>

      <div class="min-w-0 flex-1 py-3">
        <div class="flex h-11 items-center text-sm text-muted-foreground">
          {{ label }}
        </div>
      </div>
    </div>

    <div
      v-if="showSeparator && !connectBelow"
      class="h-px w-full bg-border"
    />
  </article>
</template>
