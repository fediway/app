<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { PhArrowLeft, PhArrowSquareOut, PhLink } from '@phosphor-icons/vue';
import { Timeline } from '@repo/ui';
import Button from '@ui/components/ui/button/Button.vue';
import { computed } from 'vue';
import { useData } from '~/composables/useData';
import { useInteractions } from '~/composables/useInteractions';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const route = useRoute();
const { getStatusesByLink, getLinkInfo, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const linkUrl = computed(() => {
  const url = route.params.url;
  return Array.isArray(url) ? url.join('/') : url;
});

const linkInfo = computed(() => getLinkInfo(linkUrl.value || ''));
const rawStatuses = computed(() => getStatusesByLink(linkUrl.value || ''));
const statuses = computed(() => withOverridesAll(rawStatuses.value));

function handleReblog(statusId: string) {
  toggleReblog(statusId, rawStatuses.value);
}

function handleFavourite(statusId: string) {
  toggleFavourite(statusId, rawStatuses.value);
}

function handleBookmark(statusId: string) {
  toggleBookmark(statusId, rawStatuses.value);
}

function handleStatusClick(statusId: string) {
  navigateTo(`/status/${statusId}`);
}

function handleProfileClick(acct: string) {
  navigateTo(getProfileUrl(acct));
}

function handleTagClick(tag: Tag) {
  navigateTo(`/tags/${tag.name}`);
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
    <div class="px-4 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
      <div class="flex items-center gap-3">
        <Button
          variant="muted"
          size="icon"
          class="size-9 -ml-2"
          @click="$router.back()"
        >
          <PhArrowLeft :size="20" class="text-gray-700" />
        </Button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            Link
          </h1>
          <p class="text-sm text-gray-500">
            {{ statuses.length }} posts
          </p>
        </div>
      </div>
    </div>

    <!-- Link Info Banner -->
    <div v-if="linkInfo" class="px-4 py-4 bg-gray-50 border-b border-gray-200">
      <a
        :href="linkInfo.url"
        target="_blank"
        rel="noopener noreferrer"
        class="block no-underline"
      >
        <div class="flex items-start gap-3">
          <div class="shrink-0 w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
            <PhLink :size="24" class="text-gray-500" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-base font-semibold text-gray-900 line-clamp-2">
              {{ linkInfo.title }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ linkInfo.source }}
            </p>
          </div>
          <PhArrowSquareOut :size="20" class="text-gray-400 shrink-0" />
        </div>
      </a>
    </div>

    <!-- Empty State -->
    <div v-if="statuses.length === 0" class="text-center py-16 px-4">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <PhLink :size="32" class="text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        No posts yet
      </h3>
      <p class="text-gray-500">
        No one has shared this link yet
      </p>
    </div>

    <!-- Timeline -->
    <Timeline
      v-else
      :statuses="statuses"
      :get-profile-url="getProfileUrl"
      @status-click="handleStatusClick"
      @profile-click="handleProfileClick"
      @tag-click="handleTagClick"
      @reblog="handleReblog"
      @favourite="handleFavourite"
      @bookmark="handleBookmark"
      @send-message="handleSendMessage"
      @media-click="handleMediaClick"
    />
  </div>
</template>
