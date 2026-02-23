<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { Timeline } from '@repo/ui';
import { useData } from '~/composables/useData';
import { useInteractions } from '~/composables/useInteractions';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const router = useRouter();
const { getFavouritedStatuses, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const rawStatuses = computed(() => getFavouritedStatuses());
const statuses = computed(() => withOverridesAll(rawStatuses.value));

function handleStatusClick(statusId: string) {
  router.push(`/status/${statusId}`);
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
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
      <h1 class="text-xl font-bold">
        Favourites
      </h1>
    </div>

    <!-- Timeline -->
    <section class="w-full">
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

    <!-- Empty State -->
    <div v-if="statuses.length === 0" class="text-center py-12 text-gray-500">
      <p>No favourites yet</p>
      <p class="text-sm mt-1">
        Posts you like will appear here
      </p>
    </div>
  </div>
</template>
