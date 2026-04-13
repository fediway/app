<script setup lang="ts">
import type { ThreadPosition } from './thread';
import { computed } from 'vue';
import Skeleton from '../ui/skeleton/Skeleton.vue';
import { isConnectedAbove, isConnectedBelow } from './thread';
import ThreadRailFrame from './ThreadRailFrame.vue';

interface Props {
  /**
   * Thread position — drives rail rendering. Defaults to `standalone`.
   * Pass shaped positions when rendering a thread-shaped loading state so
   * skeleton rows participate in the same rail topology as real statuses.
   */
  threadPosition?: ThreadPosition;
  /** Number of body lines to show. */
  lines?: number;
  /** Show the bottom 1px separator. Auto-hidden when connected below. */
  showSeparator?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  threadPosition: () => ({ kind: 'standalone' }),
  lines: 2,
  showSeparator: true,
});

const connectAbove = computed(() => isConnectedAbove(props.threadPosition));
const connectBelow = computed(() => isConnectedBelow(props.threadPosition));
</script>

<template>
  <article aria-busy="true" aria-label="Loading post">
    <div class="flex gap-3 px-4">
      <ThreadRailFrame :connect-above="connectAbove" :connect-below="connectBelow">
        <Skeleton class="h-11 w-11 rounded-full" />
      </ThreadRailFrame>

      <div class="min-w-0 flex-1 py-3">
        <div class="flex items-center gap-2 mb-2">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-3 w-20" />
        </div>
        <div class="space-y-2">
          <Skeleton v-for="n in lines" :key="n" class="h-4" :class="n === lines ? 'w-2/3' : 'w-full'" />
        </div>
      </div>
    </div>

    <div
      v-if="showSeparator && !connectBelow"
      class="h-px w-full bg-border"
    />
  </article>
</template>
