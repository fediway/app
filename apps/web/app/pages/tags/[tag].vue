<script setup lang="ts">
import type { MediaAttachment, Status, Tag } from '@repo/types';
import { EmptyState, FollowButton, PageHeader, Timeline } from '@repo/ui';
import { computed } from 'vue';
import { useMediaLightbox } from '~/composables/useMediaLightbox';
import { useSendMessageModal } from '~/composables/useSendMessageModal';

const route = useRoute();
const { getStatusesByTag, getTagInfo } = useExploreData();
const { getProfilePath, getStatusPath } = useAccountData();
const { toggleFavourite, toggleReblog, handleBookmark, withStoreState } = useWebActions();
const { toggleFollow, isFollowing } = useFollows();
const { open: openSendMessage } = useSendMessageModal();
const { open: openLightbox } = useMediaLightbox();

const tagName = computed(() => {
  const tag = route.params.tag;
  return Array.isArray(tag) ? tag[0] : tag;
});

const _tagInfo = computed(() => getTagInfo(tagName.value || ''));
const { data: rawStatuses } = getStatusesByTag(tagName.value || '');
const statuses = withStoreState(rawStatuses);

// Tag follow uses the tag name prefixed with "tag:" to avoid ID collisions with accounts
const tagFollowId = computed(() => `tag:${tagName.value}`);
const isFollowingTag = computed(() => isFollowing(tagFollowId.value));
function toggleFollowTag() {
  toggleFollow(tagFollowId.value);
}

function handleReblog(statusId: string) {
  toggleReblog(statusId);
}

function handleFavourite(statusId: string) {
  toggleFavourite(statusId);
}

function handleStatusClick(statusId: string) {
  navigateTo(getStatusPath(statusId));
}

function handleProfileClick(acct: string) {
  navigateTo(getProfilePath(acct));
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
      :title="`#${tagName}`"
      :subtitle="`${statuses.length} posts`"
      show-back
      @back="$router.back()"
    />

    <!-- Tag Stats Banner -->
    <div class="border-b border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-800/30">
      <div class="flex items-center gap-4">
        <div class="flex size-14 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700">
          <span class="text-2xl text-gray-500 dark:text-gray-400">#</span>
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            #{{ tagName }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ statuses.length }} posts from the community
          </p>
        </div>
        <FollowButton
          :is-following="isFollowingTag"
          size="sm"
          @follow="toggleFollowTag"
          @unfollow="toggleFollowTag"
        />
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-if="statuses.length === 0"
      title="No posts yet"
      :description="`Be the first to post with #${tagName}`"
      class="py-16"
    />

    <!-- Timeline -->
    <Timeline
      v-else
      :statuses="statuses"
      :get-profile-url="getProfilePath"
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
