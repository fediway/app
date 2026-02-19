<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { Status as StatusComponent } from '@repo/ui';
import { useData } from '~/composables/useData';
import { useInteractions } from '~/composables/useInteractions';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { usePostComposer } from '~/composables/usePostComposer';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const router = useRouter();
const { getHomeTimeline, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();
const { open: openComposer } = usePostComposer();

const PAGE_SIZE = 5;
const visibleCount = ref(PAGE_SIZE);

const rawStatuses = computed(() => getHomeTimeline());
const allStatuses = computed(() => withOverridesAll(rawStatuses.value));
const statuses = computed(() => allStatuses.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < allStatuses.value.length);

// Split statuses for inserting follow suggestions after second post
const firstStatuses = computed(() => statuses.value.slice(0, 2));
const remainingStatuses = computed(() => statuses.value.slice(2));

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
  visibleCount.value += PAGE_SIZE;
}

function handleMediaClick(attachments: MediaAttachment[], index: number) {
  openLightbox(attachments, index);
}
</script>

<template>
  <section class="w-full py-2">
    <!-- First 2 posts -->
    <StatusComponent
      v-for="status in firstStatuses"
      :key="status.id"
      :status="status"
      :profile-url="getProfileUrl(status.reblog?.account.acct ?? status.account.acct)"
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

    <!-- Follow suggestions slider -->
    <FollowSuggestions />

    <!-- Remaining posts -->
    <StatusComponent
      v-for="status in remainingStatuses"
      :key="status.id"
      :status="status"
      :profile-url="getProfileUrl(status.reblog?.account.acct ?? status.account.acct)"
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
    <div v-if="hasMore" class="flex justify-center py-4">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        @click="handleLoadMore"
      >
        Load more
      </button>
    </div>
  </section>
</template>
