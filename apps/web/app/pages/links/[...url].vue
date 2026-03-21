<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { PhArrowSquareOut, PhLink } from '@phosphor-icons/vue';
import { useStatusActions, useStatusStore } from '@repo/api';
import { EmptyState, PageHeader, Timeline, useToast } from '@repo/ui';
import { computed } from 'vue';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const route = useRoute();
const { getStatusesByLink, getLinkInfo } = useExploreData();
const { getProfileUrl } = useAccountData();
const store = useStatusStore();
const { toast } = useToast();
const { toggleFavourite, toggleReblog, toggleBookmark } = useStatusActions({
  onError: () => toast.error('Action failed', 'Please try again.'),
});
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const linkUrl = computed(() => {
  const url = route.params.url;
  return Array.isArray(url) ? url.join('/') : url;
});

const linkInfo = computed(() => getLinkInfo(linkUrl.value || ''));
const { data: rawStatuses } = getStatusesByLink(linkUrl.value || '');
const statuses = computed(() =>
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

function handleReblog(statusId: string) {
  toggleReblog(statusId);
}

function handleFavourite(statusId: string) {
  toggleFavourite(statusId);
}

function handleBookmark(statusId: string) {
  toggleBookmark(statusId);
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
    <PageHeader
      title="Link"
      :subtitle="`${statuses.length} posts`"
      show-back
      @back="$router.back()"
    />

    <!-- Link Info Banner -->
    <div v-if="linkInfo" class="border-b border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-800/30">
      <a
        :href="linkInfo.url"
        target="_blank"
        rel="noopener noreferrer"
        class="block no-underline"
      >
        <div class="flex items-start gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
            <PhLink :size="24" class="text-gray-500 dark:text-gray-400" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">
              {{ linkInfo.title }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              {{ linkInfo.source }}
            </p>
          </div>
          <PhArrowSquareOut :size="20" class="shrink-0 text-gray-400" />
        </div>
      </a>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-if="statuses.length === 0"
      title="No posts yet"
      description="No one has shared this link yet"
      class="py-16"
    />

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
