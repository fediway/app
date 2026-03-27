<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { useAuth, useTimeline } from '@repo/api';
import { Button, EmptyState, Skeleton, Status as StatusComponent } from '@repo/ui';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { usePostComposer } from '~/composables/usePostComposer';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({});

const router = useRouter();
const { getProfilePath, getStatusPath } = useAccountData();
const { toggleFavourite, toggleReblog, handleBookmark, handleCopyLink, withStoreState, store } = useWebActions();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();
const { open: openComposer } = usePostComposer();

const { isAuthenticated } = useAuth();

// Authenticated → home timeline, unauthenticated → trending statuses
const timeline = isAuthenticated.value ? useTimeline({ type: 'home' }) : null;
const { getTrendingStatuses } = useExploreData();
const trending = !isAuthenticated.value ? getTrendingStatuses() : null;

// Unified status list
const isLoading = computed(() => timeline?.isLoading.value ?? trending?.isLoading.value ?? false);
const errorValue = computed(() => timeline?.error.value ?? trending?.error.value ?? null);

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
const allStatuses = withStoreState(rawStatuses);

const firstStatuses = computed(() => allStatuses.value.slice(0, 2));
const remainingStatuses = computed(() => allStatuses.value.slice(2));

function handleStatusClick(statusId: string) {
  router.push(getStatusPath(statusId));
}

function handleReply(statusId: string) {
  const status = rawStatuses.value.find(s => s.id === statusId || s.reblog?.id === statusId);
  const replyTarget = status?.reblog ?? status;
  openComposer(replyTarget);
}

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

function handleTagClick(tag: Tag) {
  router.push(`/tags/${tag.name}`);
}

function handleLoadMore() {
  timeline?.loadMore();
}

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

onMounted(() => {
  if (timeline) {
    timeline.fetch();
    timeline.startPolling(30_000);
  }
  // trending fetches automatically via createQuery
});

onUnmounted(() => {
  timeline?.stopPolling();
});
</script>

<template>
  <section class="w-full">
    <ClientOnly>
      <div>
        <!-- Loading skeleton -->
        <div v-if="isLoading && allStatuses.length === 0" class="space-y-4 p-4">
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

        <!-- Error state -->
        <EmptyState
          v-else-if="errorValue"
          :title="errorValue.message || 'Failed to load timeline'"
          action-label="Try again"
          class="py-12"
          @action="handleRetry"
        />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!isLoading && allStatuses.length === 0"
          :title="isAuthenticated ? 'Your timeline is empty' : 'No trending posts'"
          :description="isAuthenticated ? 'Follow some people to see their posts here' : 'Check back soon for new posts'"
          class="py-12"
        />

        <!-- New posts banner (home timeline only) -->
        <div v-if="timeline && timeline.newStatusCount.value > 0" class="flex justify-center py-2">
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
          v-for="status in firstStatuses"
          :key="status.id"
          :status="status"
          :profile-url="getProfilePath(status.reblog?.account.acct ?? status.account.acct)"
          :reply-parent="getReplyParent(status)"
          @reply="handleReply"
          @reblog="handleReblog"
          @favourite="handleFavourite"
          @bookmark="handleBookmark"
          @share="handleShare"
          @copy-link="handleCopyLink"
          @send-message="handleSendMessage"
          @tag-click="handleTagClick"
          @status-click="handleStatusClick"
          @media-click="handleMediaClick"
        />

        <!-- Remaining posts -->
        <StatusComponent
          v-for="status in remainingStatuses"
          :key="status.id"
          :status="status"
          :profile-url="getProfilePath(status.reblog?.account.acct ?? status.account.acct)"
          :reply-parent="getReplyParent(status)"
          @reply="handleReply"
          @reblog="handleReblog"
          @favourite="handleFavourite"
          @bookmark="handleBookmark"
          @share="handleShare"
          @copy-link="handleCopyLink"
          @send-message="handleSendMessage"
          @tag-click="handleTagClick"
          @status-click="handleStatusClick"
          @media-click="handleMediaClick"
        />

        <!-- Load more button (home timeline only) -->
        <div v-if="timeline?.hasMore.value && allStatuses.length > 0 && !errorValue" class="flex justify-center py-4">
          <Button
            variant="muted"
            size="sm"
            :disabled="isLoading"
            @click="handleLoadMore"
          >
            {{ isLoading ? 'Loading...' : 'Load more' }}
          </Button>
        </div>
      </div>
    </ClientOnly>
  </section>
</template>
