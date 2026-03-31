<script setup lang="ts">
import type { MediaAttachment, Status } from '@repo/types';
import { PhCircleNotch } from '@phosphor-icons/vue';
import { useAuth, useTimeline } from '@repo/api';
import { Button, EmptyState, Skeleton, Status as StatusComponent, useInfiniteScroll, usePullToRefresh } from '@repo/ui';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { usePostComposer } from '~/composables/usePostComposer';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({ keepalive: true });

const router = useRouter();
const { getProfilePath, getStatusPath } = useAccountData();
const { toggleFavourite, toggleReblog, handleBookmark, handleCopyLink, handleDelete, handleMute, handleBlock, handleBlockDomain, handleReport, withStoreState, store, isAuthenticated: isAuthed } = useWebActions();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();
const { open: openComposer } = usePostComposer();

const { requireAuth } = useAuthGate();
const { isAuthenticated, currentUser } = useAuth();

function isOwnPost(status: Status): boolean {
  const acct = status.reblog?.account.id ?? status.account.id;
  return !!currentUser.value && currentUser.value.id === acct;
}

// Authenticated → home timeline, unauthenticated → trending statuses
const timeline = isAuthenticated.value ? useTimeline({ type: 'home', cache: true }) : null;
const { getTrendingStatuses } = useExploreData();
const trending = !isAuthenticated.value ? getTrendingStatuses() : null;

// Unified status list
const isLoading = computed(() => timeline?.isLoading.value ?? trending?.isLoading.value ?? false);
const errorValue = computed(() => timeline?.error.value ?? trending?.error.value ?? null);

// Delayed skeleton gate — only show skeleton after 300ms to avoid flash
const showSkeleton = ref(false);
let skeletonTimer: ReturnType<typeof setTimeout> | undefined;

watch(isLoading, (loading) => {
  if (loading) {
    skeletonTimer = setTimeout(() => {
      showSkeleton.value = true;
    }, 300);
  }
  else {
    clearTimeout(skeletonTimer);
    showSkeleton.value = false;
  }
}, { immediate: true });

function getReplyParent(status: Status): Status | null {
  const displayStatus = status.reblog ?? status;
  if (!displayStatus.inReplyToId)
    return null;
  return store.get(displayStatus.inReplyToId) ?? null;
}

const rawStatuses = computed(() => {
  if (timeline)
    return timeline.statuses.value ?? [];
  return trending?.data.value ?? [];
});

// Seed the store so action toggles (favourite, reblog, bookmark) work on first click
watch(rawStatuses, (statuses) => {
  if (statuses.length) {
    store.setMany(statuses.map(s => s.reblog ?? s) as import('@repo/types').FediwayStatus[]);
  }
}, { immediate: true });

const allStatuses = withStoreState(rawStatuses);

const firstStatuses = computed(() => allStatuses.value.slice(0, 2));
const remainingStatuses = computed(() => allStatuses.value.slice(2));

function handleStatusClick(statusId: string) {
  router.push(getStatusPath(statusId));
}

const handleReply = requireAuth((statusId: string) => {
  const status = rawStatuses.value.find(s => s.id === statusId || s.reblog?.id === statusId);
  const replyTarget = status?.reblog ?? status;
  openComposer(replyTarget);
}, 'reply to this post');

function handleReblog(statusId: string) {
  toggleReblog(statusId);
}

function handleFavourite(statusId: string) {
  toggleFavourite(statusId);
}

function handleShare(statusId: string) {
  if (navigator.share) {
    navigator.share({ url: `${window.location.origin}${getStatusPath(statusId)}` });
  }
}

function handleSendMessage(status: Status) {
  openSendMessage(status);
}

function handleTagClick(tag: string) {
  router.push(`/tags/${tag}`);
}

const isLoadingMore = ref(false);

async function handleLoadMore() {
  if (!timeline || isLoadingMore.value)
    return;
  isLoadingMore.value = true;
  await timeline.loadMore();
  isLoadingMore.value = false;
}

const { sentinelRef } = useInfiniteScroll({
  enabled: computed(() => (timeline?.hasMore.value ?? false) && !isLoadingMore.value && !isLoading.value && !errorValue.value && allStatuses.value.length > 0),
  onLoadMore: handleLoadMore,
});

function handleMediaClick(attachments: MediaAttachment[], index: number) {
  openLightbox(attachments, index);
}

function handleRetry() {
  if (timeline) {
    timeline.fetch();
  }
  else {
    trending?.refetch();
  }
}

// Fetch eagerly in setup — sets isLoading=true synchronously,
// preventing flash-of-empty-state before first render
if (timeline) {
  timeline.fetch();
}

// Pull-to-refresh — only on touch devices, only for authenticated timeline
const pullContainerRef = ref<HTMLElement>();
const { isRefreshing, pullDistance, threshold, bind: bindPull } = usePullToRefresh(async () => {
  if (timeline) {
    await timeline.refresh();
  }
  else {
    trending?.refetch();
  }
});

onMounted(() => {
  if (timeline) {
    timeline.startPolling(30_000);
  }
  if (pullContainerRef.value) {
    bindPull(pullContainerRef.value);
  }
});

// KeepAlive lifecycle — pause/resume polling when tab switches
onActivated(() => {
  if (timeline) {
    timeline.startPolling(30_000);
  }
});

onDeactivated(() => {
  timeline?.stopPolling();
});

onUnmounted(() => {
  timeline?.stopPolling();
});
</script>

<template>
  <section ref="pullContainerRef" class="w-full">
    <!-- Pull-to-refresh indicator -->
    <div
      v-if="pullDistance > 0 || isRefreshing"
      class="flex items-center justify-center overflow-hidden text-sm text-muted-foreground transition-[height]"
      :style="{ height: isRefreshing ? '48px' : `${pullDistance}px` }"
    >
      <span v-if="isRefreshing" class="flex items-center gap-2">
        <PhCircleNotch :size="16" class="animate-spin" />
        Refreshing
      </span>
      <span v-else>
        {{ pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh' }}
      </span>
    </div>

    <ClientOnly>
      <div
        role="feed"
        :aria-label="isAuthenticated ? 'Home timeline' : 'Trending posts'"
        :aria-busy="showSkeleton && allStatuses.length === 0"
      >
        <Transition name="fade-content" mode="out-in">
          <!-- Loading skeleton -->
          <div v-if="showSkeleton && allStatuses.length === 0" key="skeleton" class="space-y-4 p-4">
            <div v-for="i in 3" :key="i" class="space-y-3">
              <div class="flex items-center gap-3">
                <Skeleton class="size-10 rounded-full" />
                <div class="space-y-1.5">
                  <Skeleton class="h-4 w-32" />
                  <Skeleton class="h-3 w-20" />
                </div>
              </div>
              <Skeleton class="h-16 w-full" />
              <Skeleton class="h-8 w-48" />
            </div>
          </div>

          <!-- Error state (only when no data — stale data is better than an error screen) -->
          <EmptyState
            v-else-if="errorValue && allStatuses.length === 0"
            key="error"
            :title="errorValue.message || 'Failed to load timeline'"
            action-label="Try again"
            class="py-12"
            @action="handleRetry"
          />

          <!-- Empty state -->
          <EmptyState
            v-else-if="!isLoading && allStatuses.length === 0"
            key="empty"
            :title="isAuthenticated ? 'Your timeline is empty' : 'No trending posts'"
            :description="isAuthenticated ? 'Follow some people to see their posts here' : 'Check back soon for new posts'"
            class="py-12"
          />

          <!-- Feed content -->
          <div v-else key="content">
            <!-- New posts banner (home timeline only) -->
            <div v-if="timeline && timeline.newStatusCount.value > 0" role="status" class="flex justify-center py-2">
              <Button
                variant="secondary"
                size="sm"
                @click="timeline.showNew()"
              >
                {{ timeline.newStatusCount.value }} new {{ timeline.newStatusCount.value === 1 ? 'post' : 'posts' }}
              </Button>
            </div>

            <!-- First 2 posts -->
            <StatusComponent
              v-for="(status, index) in firstStatuses"
              :key="status.id"
              :status="status"
              :profile-url="getProfilePath(status.reblog?.account.acct ?? status.account.acct)"
              :reply-parent="getReplyParent(status)"
              :authenticated="isAuthed"
              :is-own-post="isOwnPost(status)"
              :feed-position="index + 1"
              @reply="handleReply"
              @reblog="handleReblog"
              @favourite="handleFavourite"
              @bookmark="handleBookmark"
              @share="handleShare"
              @copy-link="handleCopyLink"
              @delete="handleDelete"
              @mute="handleMute"
              @block="handleBlock"
              @block-domain="handleBlockDomain"
              @report="handleReport"
              @send-message="handleSendMessage"
              @tag-click="handleTagClick"
              @status-click="handleStatusClick"
              @profile-click="(acct) => router.push(getProfilePath(acct))"
              @media-click="handleMediaClick"
            />

            <!-- Remaining posts -->
            <StatusComponent
              v-for="(status, index) in remainingStatuses"
              :key="status.id"
              :status="status"
              :profile-url="getProfilePath(status.reblog?.account.acct ?? status.account.acct)"
              :reply-parent="getReplyParent(status)"
              :authenticated="isAuthed"
              :is-own-post="isOwnPost(status)"
              :feed-position="index + firstStatuses.length + 1"
              @reply="handleReply"
              @reblog="handleReblog"
              @favourite="handleFavourite"
              @bookmark="handleBookmark"
              @share="handleShare"
              @copy-link="handleCopyLink"
              @delete="handleDelete"
              @mute="handleMute"
              @block="handleBlock"
              @block-domain="handleBlockDomain"
              @report="handleReport"
              @send-message="handleSendMessage"
              @tag-click="handleTagClick"
              @status-click="handleStatusClick"
              @profile-click="(acct) => router.push(getProfilePath(acct))"
              @media-click="handleMediaClick"
            />

            <!-- Loading more spinner -->
            <div v-if="isLoadingMore" class="flex justify-center py-4">
              <PhCircleNotch :size="20" class="animate-spin text-muted-foreground" />
            </div>

            <!-- Infinite scroll sentinel -->
            <div ref="sentinelRef" class="h-px" />
          </div>
        </Transition>
      </div>
    </ClientOnly>
  </section>
</template>
