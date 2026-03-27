<script setup lang="ts">
import type { MediaAttachment, Status as StatusType } from '@repo/types';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import { computed } from 'vue';
import Status from '../status/Status.vue';

interface Props {
  statuses: StatusType[];
  /** Loading state */
  loading?: boolean;
  /** Whether there are more statuses to load */
  hasMore?: boolean;
  /** Function to generate profile URL from account */
  getProfileUrl?: (acct: string) => string;
  /** Function to resolve a status by ID (for reply parent context) */
  getStatus?: (id: string) => StatusType | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: true,
  getProfileUrl: undefined,
  getStatus: undefined,
});

const emit = defineEmits<{
  reply: [statusId: string];
  reblog: [statusId: string];
  favourite: [statusId: string];
  bookmark: [statusId: string];
  share: [statusId: string];
  sendMessage: [status: StatusType];
  tagClick: [tagName: string];
  loadMore: [];
  statusClick: [statusId: string];
  profileClick: [acct: string];
  mediaClick: [attachments: MediaAttachment[], index: number];
}>();

const virtualizer = useWindowVirtualizer(computed(() => ({
  count: props.statuses.length,
  estimateSize: () => 200,
  overscan: 5,
})));

const totalSize = computed(() => virtualizer.value.getTotalSize());
const virtualItems = computed(() => virtualizer.value.getVirtualItems());

function getProfileUrlForStatus(status: StatusType): string | undefined {
  if (props.getProfileUrl) {
    const displayStatus = status.reblog ?? status;
    return props.getProfileUrl(displayStatus.account.acct);
  }
  return undefined;
}

function getReplyParent(status: StatusType): StatusType | null {
  const displayStatus = status.reblog ?? status;
  if (!displayStatus.inReplyToId || !props.getStatus) {
    return null;
  }
  return props.getStatus(displayStatus.inReplyToId) ?? null;
}
</script>

<template>
  <div class="timeline">
    <!-- Empty state -->
    <div v-if="!loading && statuses.length === 0" class="text-center py-12 text-muted-foreground">
      <p>No posts yet</p>
    </div>

    <!-- Virtualized status list -->
    <div
      v-else-if="statuses.length > 0"
      :style="{ height: `${totalSize}px`, width: '100%', position: 'relative' }"
    >
      <div
        v-for="item in virtualItems"
        :key="statuses[item.index]!.id"
        :ref="(el) => { if (el) virtualizer.measureElement(el as HTMLElement) }"
        :data-index="item.index"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${item.start}px)`,
        }"
      >
        <Status
          :status="statuses[item.index]!"
          :profile-url="getProfileUrlForStatus(statuses[item.index]!)"
          :reply-parent="getReplyParent(statuses[item.index]!)"
          @reply="emit('reply', $event)"
          @reblog="emit('reblog', $event)"
          @favourite="emit('favourite', $event)"
          @bookmark="emit('bookmark', $event)"
          @share="emit('share', $event)"
          @send-message="emit('sendMessage', $event)"
          @tag-click="emit('tagClick', $event)"
          @status-click="emit('statusClick', $event)"
          @profile-click="emit('profileClick', $event)"
          @media-click="(attachments, index) => emit('mediaClick', attachments, index)"
        />
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
    </div>

    <!-- Load more button -->
    <div v-else-if="hasMore && statuses.length > 0" class="flex justify-center py-4">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-accent transition-colors"
        @click="emit('loadMore')"
      >
        Load more
      </button>
    </div>
  </div>
</template>
