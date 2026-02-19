<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { Timeline } from '@repo/ui';
import { computed } from 'vue';
import { useData } from '~/composables/useData';
import { useInteractions } from '~/composables/useInteractions';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const route = useRoute();
const { getStatusesByTag, getTagInfo, getProfileUrl } = useData();
const { toggleFavourite, toggleReblog, toggleBookmark, withOverridesAll } = useInteractions();
const { toggleFollow, isFollowing } = useFollows();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const tagName = computed(() => {
  const tag = route.params.tag;
  return Array.isArray(tag) ? tag[0] : tag;
});

const _tagInfo = computed(() => getTagInfo(tagName.value || ''));
const rawStatuses = computed(() => getStatusesByTag(tagName.value || ''));
const statuses = computed(() => withOverridesAll(rawStatuses.value));

// Tag follow uses the tag name prefixed with "tag:" to avoid ID collisions with accounts
const tagFollowId = computed(() => `tag:${tagName.value}`);
const isFollowingTag = computed(() => isFollowing(tagFollowId.value));
function toggleFollowTag() {
  toggleFollow(tagFollowId.value);
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
        <button
          type="button"
          class="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          @click="$router.back()"
        >
          <svg class="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            #{{ tagName }}
          </h1>
          <p class="text-sm text-gray-500">
            {{ statuses.length }} posts
          </p>
        </div>
      </div>
    </div>

    <!-- Tag Stats Banner -->
    <div class="px-4 py-4 bg-gray-50 border-b border-gray-200">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center">
          <span class="text-2xl text-gray-500">#</span>
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-gray-900">
            #{{ tagName }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ statuses.length }} posts from the community
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium rounded-full transition-colors" :class="[
            isFollowingTag
              ? 'text-gray-700 bg-white border border-gray-300 hover:border-red-300 hover:text-red-600'
              : 'text-white bg-gray-900 hover:bg-gray-700',
          ]"
          @click="toggleFollowTag"
        >
          {{ isFollowingTag ? 'Following' : 'Follow' }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="statuses.length === 0" class="text-center py-16 px-4">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <span class="text-3xl text-gray-400">#</span>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        No posts yet
      </h3>
      <p class="text-gray-500">
        Be the first to post with #{{ tagName }}
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
