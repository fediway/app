<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { useStatusStore, useTimeline } from '@repo/api';
import { Button, Status as StatusComponent } from '@repo/ui';
import { useData } from '~/composables/useData';
import { useInteractions } from '~/composables/useInteractions';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { usePostComposer } from '~/composables/usePostComposer';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

definePageMeta({ keepalive: true });

const router = useRouter();
const { getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();
const { open: openComposer } = usePostComposer();

const timeline = useTimeline({ type: 'home' });
const statusStore = useStatusStore();

function getReplyParent(status: Status): Status | null {
  const displayStatus = status.reblog ?? status;
  if (!displayStatus.inReplyToId)
    return null;
  return statusStore.get(displayStatus.inReplyToId) ?? null;
}

if (import.meta.client) {
  timeline.fetch();
}

const rawStatuses = computed(() => timeline.statuses.value ?? []);
const allStatuses = computed(() => withOverridesAll(rawStatuses.value));

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
  toggleReblog(statusId, rawStatuses.value);
}

function handleFavourite(statusId: string) {
  toggleFavourite(statusId, rawStatuses.value);
}

function handleBookmark(statusId: string) {
  toggleBookmark(statusId, rawStatuses.value);
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
  </section>
</template>
