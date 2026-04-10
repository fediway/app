<script setup lang="ts">
import type { MediaAttachment, Status } from '@repo/types';
import { PhCircleNotch } from '@phosphor-icons/vue';
import { useAuth, useTimeline } from '@repo/api';
import { EmptyState, NewPostsPill, Skeleton, Status as StatusComponent, useInfiniteScroll } from '@repo/ui';
import { useFeedType } from '~/composables/useFeedType';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { usePostComposer } from '~/composables/usePostComposer';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({ keepalive: true });

const { hidden: mobileHeaderHidden } = useScrollDirection();

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

// Feed type switching (authenticated users can pick; unauthenticated get trending only)
const { feedType } = useFeedType();

const homeTimeline = isAuthenticated.value ? useTimeline({ type: 'home', cache: true }) : null;
const publicTimeline = isAuthenticated.value ? useTimeline({ type: 'public' }) : null;
const { getTrendingStatuses } = useExploreData();
const trending = getTrendingStatuses();

const activeTimeline = computed(() => {
  if (!isAuthenticated.value)
    return null;
  if (feedType.value === 'home')
    return homeTimeline;
  if (feedType.value === 'explore')
    return publicTimeline;
  return null;
});

// Unified status list
const isLoading = computed(() => activeTimeline.value?.isLoading.value ?? trending.isLoading.value ?? false);
const errorValue = computed(() => activeTimeline.value?.error.value ?? trending.error.value ?? null);

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

const homeStatuses = computed(() => homeTimeline?.statuses.value ?? []);
const publicStatuses = computed(() => publicTimeline?.statuses.value ?? []);
const trendingStatuses = computed(() => trending.data.value ?? []);

const rawStatuses = computed(() => {
  if (!isAuthenticated.value)
    return trendingStatuses.value;
  if (feedType.value === 'home')
    return homeStatuses.value;
  if (feedType.value === 'explore')
    return publicStatuses.value;
  return trendingStatuses.value;
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
const loadMoreCooldown = ref(false);

const newPostAvatars = computed(() => {
  const pending = activeTimeline.value?.pendingStatuses.value ?? [];
  const seen = new Set<string>();
  const avatars: string[] = [];
  for (const s of pending) {
    const acct = s.account.acct;
    if (!seen.has(acct)) {
      seen.add(acct);
      avatars.push(s.account.avatar);
      if (avatars.length >= 3)
        break;
    }
  }
  return avatars;
});

function handleShowNew() {
  activeTimeline.value?.showNew();
  globalThis.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleLoadMore() {
  const tl = activeTimeline.value;
  if (!tl || isLoadingMore.value || loadMoreCooldown.value)
    return;
  isLoadingMore.value = true;
  const prevCount = tl.statuses.value?.length ?? 0;
  await tl.loadMore();
  isLoadingMore.value = false;

  // Cooldown prevents rapid re-triggering when sentinel stays visible
  if ((tl.statuses.value?.length ?? 0) === prevCount) {
    loadMoreCooldown.value = true;
    setTimeout(() => {
      loadMoreCooldown.value = false;
    }, 2000);
  }
}

const { sentinelRef } = useInfiniteScroll({
  enabled: computed(() => (activeTimeline.value?.hasMore.value ?? false) && !isLoadingMore.value && !loadMoreCooldown.value && !isLoading.value && !errorValue.value && allStatuses.value.length > 0),
  onLoadMore: handleLoadMore,
});

function handleMediaClick(attachments: MediaAttachment[], index: number) {
  openLightbox(attachments, index);
}

function handleRetry() {
  if (activeTimeline.value) {
    activeTimeline.value.fetch();
  }
  else {
    trending.refetch();
  }
}

// Fetch the active feed and switch on feed type change
function fetchActiveFeed() {
  const tl = activeTimeline.value;
  if (tl) {
    tl.fetch();
    tl.startPolling(30_000);
  }
}

// Fetch eagerly in setup
fetchActiveFeed();

// Re-fetch when feed type changes
watch(feedType, () => {
  homeTimeline?.stopPolling();
  publicTimeline?.stopPolling();
  fetchActiveFeed();
});

onActivated(() => {
  activeTimeline.value?.startPolling(30_000);
});

onDeactivated(() => {
  homeTimeline?.stopPolling();
  publicTimeline?.stopPolling();
});

onUnmounted(() => {
  homeTimeline?.stopPolling();
  publicTimeline?.stopPolling();
});
</script>

<template>
  <section class="w-full">
    <ClientOnly>
      <div
        role="feed"
        :aria-label="feedType === 'home' ? 'Home timeline' : feedType === 'explore' ? 'Explore' : 'Trending posts'"
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
            <div v-if="activeTimeline?.newStatusCount.value" role="status" class="sticky z-10 flex justify-center py-2 transition-[top] duration-300 lg:top-14" :class="mobileHeaderHidden ? 'top-0' : 'top-14'">
              <NewPostsPill
                :count="activeTimeline!.newStatusCount.value"
                :avatars="newPostAvatars"
                @click="handleShowNew"
              />
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
