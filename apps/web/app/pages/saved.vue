<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { EmptyState, PageHeader, Timeline } from '@repo/ui';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const router = useRouter();
const { getBookmarkedStatuses } = useTimelineData();
const { getProfileUrl } = useAccountData();
const { toggleFavourite, toggleReblog, handleBookmark, withStoreState } = useWebActions();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const { data: rawStatuses } = getBookmarkedStatuses();
const statuses = withStoreState(rawStatuses);

function handleStatusClick(statusId: string) {
  router.push(`/status/${statusId}`);
}

function handleReblog(statusId: string) {
  toggleReblog(statusId);
}

function handleFavourite(statusId: string) {
  toggleFavourite(statusId);
}

function handleTagClick(tag: Tag) {
  router.push(`/tags/${tag.name}`);
}

function handleSendMessage(status: Status) {
  openSendMessage(status);
}

function handleMediaClick(attachments: MediaAttachment[], index: number) {
  openLightbox(attachments, index);
}
</script>

<template>
  <div class="w-full">
    <PageHeader title="Bookmarks" />

    <!-- Empty State -->
    <EmptyState
      v-if="statuses.length === 0"
      title="No bookmarks yet"
      description="Save posts to read later"
      class="py-12"
    />

    <!-- Timeline -->
    <section v-else class="w-full">
      <Timeline
        :statuses="statuses"
        :loading="false"
        :has-more="false"
        :get-profile-url="(acct) => getProfileUrl(acct)"
        @reblog="handleReblog"
        @favourite="handleFavourite"
        @bookmark="handleBookmark"
        @send-message="handleSendMessage"
        @tag-click="handleTagClick"
        @status-click="handleStatusClick"
        @media-click="handleMediaClick"
      />
    </section>
  </div>
</template>
