<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { useStatusActions, useStatusStore, useTimeline } from '@repo/api';
import { Button, EmptyState, Skeleton, Status as StatusComponent, useToast } from '@repo/ui';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { usePostComposer } from '~/composables/usePostComposer';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({ keepalive: true });

const router = useRouter();
const { getProfileUrl } = useAccountData();
const store = useStatusStore();
const { toast } = useToast();
const { toggleFavourite, toggleReblog, toggleBookmark } = useStatusActions({
  onError: () => toast.error('Action failed', 'Please try again.'),
});
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();
const { open: openComposer } = usePostComposer();

const timeline = useTimeline({ type: 'home' });

function getReplyParent(status: Status): Status | null {
  const displayStatus = status.reblog ?? status;
  if (!displayStatus.inReplyToId)
    return null;
  return store.get(displayStatus.inReplyToId) ?? null;
}

if (import.meta.client) {
  timeline.fetch();
}

const rawStatuses = computed(() => timeline.statuses.value ?? []);
const allStatuses = computed(() =>
  rawStatuses.value.map((s) => {
    const id = s.reblog?.id ?? s.id;
    const stored = store.get(id);
    if (!stored)
      return s;
    if (s.reblog)
      return { ...s, reblog: { ...s.reblog, ...stored } } as Status;
    return { ...s, ...stored } as Status;
  }),
);

// Split statuses for inserting follow suggestions after second post
const firstStatuses = computed(() => allStatuses.value.slice(0, 2));
const remainingStatuses = computed(() => allStatuses.value.slice(2));

function handleStatusClick(statusId: string) {
  router.push(`/status/${statusId}`);
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

function handleBookmark(statusId: string) {
  toggleBookmark(statusId);
}

function handleShare(statusId: string) {
  if (navigator.share) {
    navigator.share({ url: `${window.location.origin}/status/${statusId}` });
  }
}

function handleSendMessage(status: Status) {
  openSendMessage(status);
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${tag.name}`);
}

function handleLoadMore() {
  timeline.loadMore();
}

function handleMediaClick(attachments: MediaAttachment[], index: number) {
  openLightbox(attachments, index);
}

onActivated(() => {
  timeline.startPolling(30_000);
});

onDeactivated(() => {
  timeline.stopPolling();
});
</script>

<template>
  <section class="w-full py-2">
    <!-- Client-only: timeline data is fetched client-side -->
    <ClientOnly>
      <div>
        <!-- Loading skeleton -->
        <div v-if="timeline.isLoading.value && allStatuses.length === 0" class="space-y-4 p-4">
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
          v-else-if="timeline.error.value"
          :title="timeline.error.value.message || 'Failed to load timeline'"
          action-label="Try again"
          class="py-12"
          @action="timeline.fetch()"
        />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!timeline.isLoading.value && allStatuses.length === 0"
          title="Your timeline is empty"
          description="Follow some people to see their posts here"
          class="py-12"
        />

        <!-- New posts banner -->
        <div v-if="timeline.newStatusCount.value > 0" class="flex justify-center py-2">
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
          :profile-url="getProfileUrl(status.reblog?.account.acct ?? status.account.acct)"
          :reply-parent="getReplyParent(status)"
          @reply="handleReply"
          @reblog="handleReblog"
          @favourite="handleFavourite"
          @bookmark="handleBookmark"
          @share="handleShare"
          @send-message="handleSendMessage"
          @tag-click="handleTagClick"
          @status-click="handleStatusClick"
          @media-click="handleMediaClick"
        />

        <!-- Follow suggestions slider (only show when feed has content) -->
        <FollowSuggestions v-if="allStatuses.length > 0" />

        <!-- Remaining posts -->
        <StatusComponent
          v-for="status in remainingStatuses"
          :key="status.id"
          :status="status"
          :profile-url="getProfileUrl(status.reblog?.account.acct ?? status.account.acct)"
          :reply-parent="getReplyParent(status)"
          @reply="handleReply"
          @reblog="handleReblog"
          @favourite="handleFavourite"
          @bookmark="handleBookmark"
          @share="handleShare"
          @send-message="handleSendMessage"
          @tag-click="handleTagClick"
          @status-click="handleStatusClick"
          @media-click="handleMediaClick"
        />

        <!-- Load more button -->
        <div v-if="timeline.hasMore.value" class="flex justify-center py-4">
          <Button
            variant="muted"
            size="sm"
            @click="handleLoadMore"
          >
            Load more
          </Button>
        </div>
      </div>
    </ClientOnly>
  </section>
</template>
