<script setup lang="ts">
import type { MediaAttachment, Status as StatusType } from '@repo/types';
import { PhCircleNotch } from '@phosphor-icons/vue';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import { computed } from 'vue';
import { useInfiniteScroll } from '../../composables/useInfiniteScroll';
import Status from '../status/Status.vue';
import { shapeFeedThreads } from '../status/thread';

interface Props {
  statuses: StatusType[];
  /** Loading state (initial fetch — shows skeleton) */
  loading?: boolean;
  /** Loading more pages (shows bottom spinner) */
  loadingMore?: boolean;
  /** Whether there are more statuses to load */
  hasMore?: boolean;
  /** Function to generate profile URL from account */
  getProfileUrl?: (acct: string) => string;
  /** Function to resolve a status by ID (for reply parent context) */
  getStatus?: (id: string) => StatusType | undefined;
  /** Hide link preview cards on statuses (e.g. on item pages where the card is redundant) */
  hideCards?: boolean;
  /** Current user's account ID — enables isOwnPost detection for delete */
  currentUserId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingMore: false,
  hasMore: true,
  getProfileUrl: undefined,
  getStatus: undefined,
  hideCards: false,
  currentUserId: undefined,
});

const emit = defineEmits<{
  reply: [statusId: string];
  reblog: [statusId: string];
  favourite: [statusId: string];
  bookmark: [statusId: string];
  share: [statusId: string];
  sendMessage: [status: StatusType];
  copyLink: [statusId: string];
  delete: [statusId: string];
  mute: [accountId: string];
  block: [accountId: string];
  blockDomain: [domain: string];
  report: [accountId: string];
  tagClick: [tagName: string];
  loadMore: [];
  statusClick: [statusId: string];
  profileClick: [acct: string];
  mediaClick: [attachments: MediaAttachment[], index: number];
}>();

const { sentinelRef } = useInfiniteScroll({
  enabled: computed(() => props.hasMore && !props.loadingMore && !props.loading && props.statuses.length > 0),
  onLoadMore: () => emit('loadMore'),
});

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

function checkIsOwnPost(status: StatusType): boolean {
  if (!props.currentUserId)
    return false;
  const authorId = (status.reblog ?? status).account.id;
  return authorId === props.currentUserId;
}

const threadPositions = computed(() =>
  shapeFeedThreads(props.statuses, id => props.getStatus?.(id) ?? null),
);
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
          :thread-position="threadPositions[item.index]"
          :hide-card="hideCards"
          :is-own-post="checkIsOwnPost(statuses[item.index]!)"
          @reply="emit('reply', $event)"
          @reblog="emit('reblog', $event)"
          @favourite="emit('favourite', $event)"
          @bookmark="emit('bookmark', $event)"
          @share="emit('share', $event)"
          @send-message="emit('sendMessage', $event)"
          @copy-link="emit('copyLink', $event)"
          @delete="emit('delete', $event)"
          @mute="(id) => emit('mute', id)"
          @block="(id) => emit('block', id)"
          @block-domain="(domain) => emit('blockDomain', domain)"
          @report="(id) => emit('report', id)"
          @tag-click="emit('tagClick', $event)"
          @status-click="emit('statusClick', $event)"
          @profile-click="emit('profileClick', $event)"
          @media-click="(attachments, index) => emit('mediaClick', attachments, index)"
        />
      </div>
    </div>

    <!-- Initial loading indicator -->
    <div v-if="loading" class="flex justify-center py-8">
      <PhCircleNotch :size="24" class="animate-spin text-muted-foreground" />
    </div>

    <!-- Loading more spinner (bottom of list) -->
    <div v-if="loadingMore" class="flex justify-center py-4">
      <PhCircleNotch :size="20" class="animate-spin text-muted-foreground" />
    </div>

    <!-- Infinite scroll sentinel (invisible, observed by IntersectionObserver) -->
    <div ref="sentinelRef" class="h-px" />

    <!-- Manual load more fallback -->
    <div v-if="hasMore && statuses.length > 0 && !loadingMore && !loading" class="flex justify-center py-4">
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
