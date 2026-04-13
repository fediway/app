<script setup lang="ts">
import type { Account } from '@repo/types';
import type { ThreadPosition } from './thread';
import { computed } from 'vue';
import Avatar from '../ui/avatar/Avatar.vue';
import { isConnectedAbove, isConnectedBelow } from './thread';
import ThreadRailFrame from './ThreadRailFrame.vue';

interface Props {
  /** Thread position — usually `chain-middle`, occasionally `chain-end` for tail collapse. */
  threadPosition?: ThreadPosition;
  /**
   * Up to 3 accounts to show in the overlapping avatar stack. The first
   * three are rendered; any beyond that are folded into the count.
   */
  accounts: Account[];
  /** Total number of replies hidden behind this node (drives the label). */
  hiddenCount: number;
  /** Show the bottom 1px separator. Auto-hidden when connected below. */
  showSeparator?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  threadPosition: () => ({ kind: 'chain-middle' }),
  showSeparator: true,
});

defineEmits<{
  expand: [];
}>();

const connectAbove = computed(() => isConnectedAbove(props.threadPosition));
const connectBelow = computed(() => isConnectedBelow(props.threadPosition));

const visibleAccounts = computed(() => props.accounts.slice(0, 3));

const label = computed(() => {
  const n = props.hiddenCount;
  return n === 1 ? 'Show 1 more reply' : `Show ${n} more replies`;
});
</script>

<template>
  <article>
    <button
      type="button"
      class="flex w-full gap-3 px-4 text-left transition-colors hover:bg-foreground/[0.03]"
      @click="$emit('expand')"
    >
      <ThreadRailFrame :connect-above="connectAbove" :connect-below="connectBelow">
        <div class="flex h-11 w-11 items-center justify-center" aria-hidden="true">
          <div class="flex -space-x-2">
            <div
              v-for="account in visibleAccounts"
              :key="account.id"
              class="rounded-full ring-2 ring-background"
            >
              <Avatar
                :src="account.avatar"
                :alt="account.displayName || account.username"
                size="xs"
              />
            </div>
          </div>
        </div>
      </ThreadRailFrame>

      <div class="min-w-0 flex-1 py-3">
        <div class="flex h-11 items-center text-sm font-medium text-muted-foreground">
          {{ label }}
        </div>
      </div>
    </button>

    <div
      v-if="showSeparator && !connectBelow"
      class="h-px w-full bg-border"
    />
  </article>
</template>
